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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const genre = (searchParams.get("genre") ?? "").trim().slice(0, 80);
  const params = new URLSearchParams({
    limit: "100",
    order: "clickcount",
    reverse: "true",
    hidebroken: "true",
    is_https: "true",
  });

  if (query) params.set("name", query);
  if (genre) params.set("tag", genre);

  try {
    const response = await fetch(
      `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`,
      {
        headers: { "User-Agent": "RadioWave/1.0 (internet radio directory)" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Radio directory is temporarily unavailable", stations: [] },
        { status: 502 },
      );
    }

    const rows = (await response.json()) as RadioBrowserStation[];
    const stations = rows
      .filter((station) => station.name && (station.url_resolved || station.url))
      .map((station) => {
        const streamUrl = station.url_resolved || station.url || "";
        const tags = (station.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 4)
          .join(" / ");
        return {
          id: `radio-browser-${station.stationuuid || encodeURIComponent(streamUrl)}`,
          name: station.name || "Unknown station",
          genre: [tags || "Różne gatunki", station.country].filter(Boolean).join(" · "),
          streamUrl,
          tagline: `Katalog Radio Browser · ${station.bitrate ? `${station.bitrate} kbps` : "radio internetowe"}`,
        };
      })
      .filter((station) => station.streamUrl.startsWith("https://"));

    return NextResponse.json(
      { stations },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the radio directory", stations: [] },
      { status: 502 },
    );
  }
}
