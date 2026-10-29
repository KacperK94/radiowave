import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

type RadioBrowserStation = {
  stationuuid?: string;
  name?: string;
  tags?: string;
  url_resolved?: string;
  url?: string;
  country?: string;
  bitrate?: number;
};

const RADIO_BROWSER_SERVERS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

function toStation(station: RadioBrowserStation) {
  const streamUrl = station.url_resolved || station.url || "";
  const tags = (station.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(" / ");

  return {
    id: `radio-browser-${station.stationuuid || encodeURIComponent(streamUrl)}`,
    name: station.name || "Nieznana stacja",
    genre: [tags || "Różne gatunki", station.country].filter(Boolean).join(" · "),
    streamUrl,
    tagline: `Katalog Radio Browser · ${station.bitrate ? `${station.bitrate} kbps` : "radio internetowe"}`,
  };
}

function jsonStations(stations: ReturnType<typeof toStation>[], source: string) {
  return NextResponse.json(
    { stations, source },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const genre = (searchParams.get("genre") ?? "").trim().slice(0, 80);
  const countryCode = (searchParams.get("country") ?? "").trim().slice(0, 2).toUpperCase();

  // Prefer the persistent Convex catalog. If Convex has not been deployed or
  // populated yet, keep the public directory available through Radio Browser.
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      const args = {
        limit: 100,
        ...(query ? { q: query } : {}),
        ...(genre ? { tag: genre } : {}),
        ...(countryCode ? { countryCode } : {}),
      };
      const stations = await client.query(api.stations.list, args);
      if (stations.length > 0) return jsonStations(stations, "RadioWave database (Convex)");
    } catch {
      // The database may be awaiting deployment or initial catalog import.
      // Fall through to the public source rather than breaking the listener.
    }
  }

  const params = new URLSearchParams({
    limit: "1000",
    order: "clickcount",
    reverse: "true",
    hidebroken: "true",
  });
  if (query) params.set("name", query);
  if (genre) params.set("tag", genre);
  if (countryCode) params.set("countrycode", countryCode);

  // Public Radio Browser directory; mirrors are tried one by one for resilience.
  for (const server of RADIO_BROWSER_SERVERS) {
    try {
      const endpoint = query || genre || countryCode
        ? `${server}/json/stations/search?${params.toString()}`
        : `${server}/json/stations/topclick/1000`;
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "RadioWave/1.2 (open internet radio directory)",
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });

      if (!response.ok) continue;
      const rows = (await response.json()) as RadioBrowserStation[];
      if (!Array.isArray(rows)) continue;

      const stations = rows
        .filter((station) => station.name && (station.url_resolved || station.url))
        .map(toStation)
        .filter((station) => station.streamUrl.startsWith("https://"));

      if (!stations.length) continue;
      return jsonStations(stations, "Radio Browser");
    } catch {
      // Try the next public mirror.
    }
  }

  return NextResponse.json(
    { error: "Katalog stacji jest chwilowo niedostępny", stations: [] },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}
