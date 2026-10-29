import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];
const MAX_PAGE_SIZE = 100;
const MAX_IMPORT_BATCH = 100;

type RadioBrowserRow = {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  homepage?: string;
  favicon?: string;
  country?: string;
  countrycode?: string;
  state?: string;
  language?: string;
  tags?: string;
  codec?: string;
  bitrate?: number;
  votes?: number;
  clickcount?: number;
  lastcheckok?: boolean | number;
  lastchecktime?: string | number;
};

function toStation(row: RadioBrowserRow, now: number) {
  const streamUrl = (row.url_resolved || row.url || "").trim();
  if (!row.stationuuid || !row.name?.trim() || !streamUrl.startsWith("https://")) return null;

  let parsed: URL;
  try {
    parsed = new URL(streamUrl);
  } catch {
    return null;
  }
  if (!parsed.hostname || parsed.username || parsed.password) return null;

  const tags = (row.tags || "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 30);
  const languages = (row.language || "").split(",").map((language) => language.trim().toLowerCase()).filter(Boolean).slice(0, 12);
  const country = row.country?.trim() || undefined;
  const countryCode = row.countrycode?.trim().toUpperCase() || undefined;
  const name = row.name.trim().slice(0, 180);
  const searchText = [name, tags.join(" "), languages.join(" "), country, row.state].filter(Boolean).join(" ").slice(0, 1200);
  const lastCheckTimeRaw = Number(row.lastchecktime);
  const lastCheckTime = Number.isFinite(lastCheckTimeRaw) && lastCheckTimeRaw > 0
    ? (lastCheckTimeRaw < 10_000_000_000 ? lastCheckTimeRaw * 1000 : lastCheckTimeRaw)
    : now;

  return {
    stationUuid: row.stationuuid,
    name,
    searchText,
    streamUrl,
    homepage: row.homepage?.startsWith("https://") ? row.homepage : undefined,
    favicon: row.favicon?.startsWith("https://") ? row.favicon : undefined,
    country,
    countryCode,
    state: row.state?.trim().slice(0, 120) || undefined,
    languages,
    tags,
    codec: row.codec?.trim().slice(0, 30) || undefined,
    bitrate: Math.max(0, Math.min(10000, Number(row.bitrate) || 0)),
    votes: Math.max(0, Number(row.votes) || 0),
    clickCount: Math.max(0, Number(row.clickcount) || 0),
    lastCheckOk: row.lastcheckok === true || row.lastcheckok === 1,
    lastCheckTime,
    source: "Radio Browser",
    importedAt: now,
    updatedAt: now,
  };
}

export const list = query({
  args: {
    q: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(args.limit ?? 60)));
    const tag = args.tag?.trim().toLowerCase();
    const countryCode = args.countryCode?.trim().toUpperCase();
    const q = args.q?.trim().slice(0, 100);

    const rows = q
      ? await ctx.db.query("stations").withSearchIndex("search_station_text", (search) => {
          const builder = search.search("searchText", q);
          return countryCode ? builder.eq("countryCode", countryCode) : builder;
        }).take(Math.min(limit * 5, 500))
      : countryCode
        ? await ctx.db.query("stations").withIndex("by_countryCode", (index) => index.eq("countryCode", countryCode)).order("desc").take(Math.min(limit * 5, 500))
        : await ctx.db.query("stations").withIndex("by_clickCount").order("desc").take(Math.min(limit * 5, 500));

    return rows
      .filter((station) => station.lastCheckOk)
      .filter((station) => !tag || station.tags.some((value: string) => value.includes(tag)))
      .slice(0, limit)
      .map((station) => ({
        id: `radio-browser-${station.stationUuid}`,
        name: station.name,
        genre: [station.tags.slice(0, 4).join(" / ") || "Różne gatunki", station.country].filter(Boolean).join(" · "),
        streamUrl: station.streamUrl,
        tagline: `Radio Browser · ${station.bitrate ? `${station.bitrate} kbps` : "radio internetowe"}`,
        country: station.country,
        countryCode: station.countryCode,
        languages: station.languages,
        tags: station.tags,
        homepage: station.homepage,
        favicon: station.favicon,
      }));
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const sample = await ctx.db.query("stations").take(500);
    return {
      indexedSample: sample.length,
      sampleHealthy: sample.filter((station) => station.lastCheckOk).length,
      updatedAt: sample.reduce((latest, station) => Math.max(latest, station.updatedAt), 0),
      source: "Radio Browser",
    };
  },
});

export const upsertBatch = internalMutation({
  args: { stations: v.array(v.object({
    stationUuid: v.string(),
    name: v.string(),
    searchText: v.string(),
    streamUrl: v.string(),
    homepage: v.optional(v.string()),
    favicon: v.optional(v.string()),
    country: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    state: v.optional(v.string()),
    languages: v.array(v.string()),
    tags: v.array(v.string()),
    codec: v.optional(v.string()),
    bitrate: v.number(),
    votes: v.number(),
    clickCount: v.number(),
    lastCheckOk: v.boolean(),
    lastCheckTime: v.number(),
    source: v.string(),
    importedAt: v.number(),
    updatedAt: v.number(),
  })) },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const station of args.stations) {
      const existing = await ctx.db.query("stations")
        .withIndex("by_stationUuid", (index) => index.eq("stationUuid", station.stationUuid))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, station);
        updated += 1;
      } else {
        await ctx.db.insert("stations", station);
        inserted += 1;
      }
    }
    return { inserted, updated };
  },
});

export const syncTopStations = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let rows: RadioBrowserRow[] | null = null;
    let lastError = "No Radio Browser mirror returned a valid response.";

    for (const mirror of MIRRORS) {
      try {
        const response = await fetch(`${mirror}/json/stations/topclick/1000`, {
          headers: { "User-Agent": "RadioWave/1.2 (open radio directory)", Accept: "application/json" },
          signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) {
          lastError = `Radio Browser returned HTTP ${response.status}.`;
          continue;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          rows = data as RadioBrowserRow[];
          break;
        }
      } catch {
        lastError = "Radio Browser mirror timed out or could not be reached.";
      }
    }

    if (!rows) throw new Error(lastError);

    const clean = rows
      .map((row) => toStation(row, now))
      .filter((station): station is NonNullable<typeof station> => station !== null)
      .slice(0, 1000);

    let inserted = 0;
    let updated = 0;
    for (let offset = 0; offset < clean.length; offset += MAX_IMPORT_BATCH) {
      const result = await ctx.runMutation(internal.stations.upsertBatch, {
        stations: clean.slice(offset, offset + MAX_IMPORT_BATCH),
      });
      inserted += result.inserted;
      updated += result.updated;
    }

    return { fetched: rows.length, accepted: clean.length, inserted, updated, syncedAt: now, source: "Radio Browser" };
  },
});
