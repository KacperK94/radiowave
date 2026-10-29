import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const genre = (searchParams.get("genre") ?? "").trim().slice(0, 80);

  const params = new URLSearchParams({
    limit: "100",
    order: "clickcount",
    reverse: "true",
    hidebroken: "true",
  });
  if (query) params.set("name", query);
  if (genre) params.set("tag", genre);

  // Radio Browser is a community directory with multiple public API mirrors.
  // Try mirrors sequentially so one unavailable host does not empty the catalog.
  for (const server of RADIO_BROWSER_SERVERS) {
    try {
      const endpoint = query || genre
        ? `${server}/json/stations/search?${params.toString()}`
        : `${server}/json/stations/topclick/100`;
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "RadioWave/1.1 (internet radio directory)",
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
      });

      if (!response.ok) continue;
      const rows = (await response.json()) as RadioBrowserStation[];
      if (!Array.isArray(rows)) continue;

      const stations = rows
        .filter((station) => station.name && (station.url_resolved || station.url))
        .map(toStation)
        .filter((station) => station.streamUrl.startsWith("https://"));

      // A valid but empty response from one mirror can be a transient issue;
      // continue to another mirror before declaring the directory unavailable.
      if (!stations.length) continue;

      return NextResponse.json(
        { stations, source: "Radio Browser" },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
      );
    } catch {
      // Try the next public mirror.
    }
  }

  return NextResponse.json(
    { error: "Katalog stacji jest chwilowo niedostępny", stations: [] },
    { status: 502 },
  );
}
