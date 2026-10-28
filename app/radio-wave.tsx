"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  AudioLines, Disc3, Headphones, Heart, Radio, Music2, Pause, Play,
  RadioTower, Settings2, Send, Signal, Sparkles, Users, Volume2, Waves, X
} from "lucide-react";

type Station = {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  tagline: string;
  color?: string;
};

const starterStations: Station[] = [
  { id: "groovesalad", name: "Groove Salad", genre: "Chillout / Downtempo", streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3", tagline: "A nicely chilled plate of ambient beats." },
  { id: "indiepop", name: "Indie Pop Rocks!", genre: "Indie / Alternative", streamUrl: "https://ice1.somafm.com/indiepop-128-mp3", tagline: "Independent music for independent minds." },
  { id: "metal", name: "Metal Detector", genre: "Metal / Rock", streamUrl: "https://ice1.somafm.com/metal-128-mp3", tagline: "Gitary głośniej. Świat trochę ciszej." },
];

function Shoutbox({ nickname }: { nickname: string }) {
  const messages = useQuery(api.shoutbox.list, {});
  const sendMessage = useMutation(api.shoutbox.send);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    try {
      await sendMessage({ nickname, body: body.trim() });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać wiadomości.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="panel" id="shoutbox">
      <div className="panel-head">
        <div><div className="eyebrow">Społeczność na żywo</div><h2>Shoutbox <span style={{ color: "var(--red)" }}>//</span></h2><div className="muted" style={{ fontSize: 12 }}>Krótka wiadomość, wspólny vibe.</div></div>
        <span className="tag"><span className="live-dot" style={{ display: "inline-block", marginRight: 6 }} /> LIVE</span>
      </div>
      <div className="chat-list" aria-live="polite">
        {messages === undefined ? <div className="empty">Łączenie z shoutboxem…</div> : messages.length === 0 ? <div className="empty">Cisza przed pierwszym bitem. Napisz coś!</div> : [...messages].reverse().map((message) => (
          <article className="chat-message" key={message._id}>
            <header><strong>{message.nickname}</strong><time>{new Date(message.createdAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</time></header>
            <p>{message.body}</p>
          </article>
        ))}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input className="field" aria-label="Wiadomość do shoutboxa" maxLength={280} placeholder={nickname + ", napisz coś…"} value={body} onChange={(event) => setBody(event.target.value)} />
        <button className="primary" disabled={sending || !body.trim()} aria-label="Wyślij wiadomość"><Send size={15} /> Wyślij</button>
      </form>
      {error && <p className="notice" role="alert">{error}</p>}
      <p className="muted" style={{ fontSize: 11, marginBottom: 0 }}>Maks. 280 znaków. Pisz z szacunkiem do innych.</p>
    </section>
  );
}

function ShoutboxOffline() {
  return <section className="panel" id="shoutbox"><div className="eyebrow">Społeczność na żywo</div><h2>Shoutbox <span style={{ color: "var(--red)" }}>//</span></h2><div className="empty">Shoutbox będzie aktywny po ustawieniu adresu wdrożenia Convex w zmiennej NEXT_PUBLIC_CONVEX_URL.</div></section>;
}

export default function RadioWaveApp({ backendEnabled }: { backendEnabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stations, setStations] = useState<Station[]>(starterStations);
  const [currentId, setCurrentId] = useState(starterStations[0].id);
  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");
  const [nickname, setNickname] = useState("RadioFan");
  const [nicknameInput, setNicknameInput] = useState("RadioFan");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGenre, setNewGenre] = useState("Rock / Alternative");
  const [newUrl, setNewUrl] = useState("");
  const [stationNotice, setStationNotice] = useState("");
  const [customStations, setCustomStations] = useState<Station[]>([]);

  useEffect(() => {
    try {
      const savedNick = localStorage.getItem("radiowave:nickname");
      if (savedNick) { setNickname(savedNick); setNicknameInput(savedNick); }
      const savedFavorites = localStorage.getItem("radiowave:favorites");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites) as string[]);
      const savedStations = localStorage.getItem("radiowave:custom-stations");
      if (savedStations) setCustomStations(JSON.parse(savedStations) as Station[]);
    } catch { /* Ignore invalid browser-local preferences. */ }
  }, []);

  const allStations = useMemo(() => [...stations, ...customStations], [stations, customStations]);
  const current = allStations.find((station) => station.id === currentId) ?? allStations[0];

  useEffect(() => {
    if (current && audioRef.current && audioRef.current.src !== current.streamUrl) {
      audioRef.current.src = current.streamUrl;
    }
  }, [current]);

  async function playStation(station: Station) {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentId(station.id);
    setPlayError("");
    if (audio.src !== station.streamUrl) audio.src = station.streamUrl;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setPlayError("Nie udało się uruchomić tego strumienia. Stacja może być chwilowo niedostępna.");
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) { audio.pause(); setPlaying(false); return; }
    await playStation(current);
  }

  function saveNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = nicknameInput.trim().replace(/[<>]/g, "").slice(0, 24);
    if (!clean) return;
    setNickname(clean);
    setNicknameInput(clean);
    localStorage.setItem("radiowave:nickname", clean);
  }

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("radiowave:favorites", JSON.stringify(next));
  }

  function addStation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStationNotice("");
    try {
      const url = new URL(newUrl.trim());
      if (url.protocol !== "https:") { setStationNotice("Adres strumienia musi zaczynać się od https://."); return; }
      const name = newName.trim().slice(0, 50);
      if (!name) { setStationNotice("Podaj nazwę stacji."); return; }
      const station: Station = { id: "custom-" + Date.now(), name, genre: newGenre.trim() || "Mix", streamUrl: url.toString(), tagline: "Dodana w panelu RadioWave." };
      const next = [...customStations, station];
      setCustomStations(next);
      localStorage.setItem("radiowave:custom-stations", JSON.stringify(next));
      setNewName(""); setNewUrl("");
      setStationNotice("Stacja dodana w tej przeglądarce.");
    } catch { setStationNotice("Wpisz poprawny adres URL strumienia."); }
  }

  function removeStation(id: string) {
    const next = customStations.filter((station) => station.id !== id);
    setCustomStations(next);
    localStorage.setItem("radiowave:custom-stations", JSON.stringify(next));
    if (currentId === id) { setCurrentId(starterStations[0].id); setPlaying(false); audioRef.current?.pause(); }
  }

  return (
    <>
      <div className="topline" />
      <div className="shell">
        <header className="nav">
          <a href="#" className="brand" aria-label="RadioWave — strona główna"><span className="brand-mark"><Radio size={23} /></span><span>Radio<em>Wave</em></span></a>
          <nav className="nav-links" aria-label="Nawigacja główna"><a href="#stations">STACJE</a><a href="#community">SPOŁECZNOŚĆ</a><a href="#profile">PROFIL</a></nav>
          <button className="secondary" onClick={() => setAdminOpen((open) => !open)}><Settings2 size={15} /> Panel</button>
        </header>

        <main>
          <section className="hero">
            <div>
              <div className="pill"><span className="live-dot" /> INTERNET RADIO & COMMUNITY</div>
              <h1>Twoje radio.<br />Twoja <span>scena.</span></h1>
              <p>Odkrywaj dźwięki, poznawaj ludzi i znajdź swoją częstotliwość. Stary internetowy klimat, nowa fala muzyki. Wciśnij play i zostań na dłużej.</p>
              <div className="hero-actions"><a className="primary" href="#stations"><Play size={16} fill="currentColor" /> Odkryj stacje</a><a className="secondary" href="#shoutbox"><Users size={16} /> Wbij na shoutbox</a></div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 27, color: "#a5a5b2", fontSize: 12 }}><span><Signal size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--green)" }} /> Radio bez granic</span><span><Headphones size={14} style={{ display: "inline", verticalAlign: "middle", color: "var(--red)" }} /> Muzyka non stop</span><span><Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", color: "#f6bd5a" }} /> Retro vibe</span></div>
            </div>
            <div className="record-stage" aria-label={playing ? "Płyta winylowa obraca się podczas odtwarzania" : "Płyta winylowa czeka na odtworzenie"}>
              <div className={"record" + (playing ? " spinning" : "")}><div className="record-label"><span className="record-hole" /></div></div><div className="tonearm" />
              <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }} className="pill"><span className="live-dot" /> {playing ? "TERAZ GRA" : "GOTOWE DO ODTWARZANIA"}</div>
            </div>
          </section>

          <section className="playerbar" aria-label="Odtwarzacz radia">
            <div className={"mini-record" + (playing ? " spinning" : "")} />
            <div className="player-info"><strong>{current?.name ?? "RadioWave"}</strong><span>{current?.genre ?? "Wybierz stację"} {playing ? " · ● LIVE" : " · gotowe"}</span></div>
            <div className="player-controls"><button className="primary" onClick={togglePlayback} aria-label={playing ? "Pauza" : "Odtwórz"}>{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}{playing ? "Pauza" : "Play"}</button><Volume2 size={18} color="#a7a7b3" /></div>
            <audio ref={audioRef} preload="none" onPlaying={() => { setPlaying(true); setPlayError(""); }} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setPlayError("Strumień nie odpowiada. Wybierz inną stację lub spróbuj ponownie później."); }} />
          </section>
          {playError && <p className="notice" role="status">{playError}</p>}

          <section id="stations">
            <div className="section-head"><div><div className="eyebrow">Znajdź swoją częstotliwość</div><h2>Na antenie <span style={{ color: "var(--red)" }}>//</span></h2></div><span className="tag">{allStations.length} STACJE</span></div>
            <div className="station-grid">
              {allStations.map((station, index) => <article className="station-card" key={station.id}>
                <div className="station-art"><div style={{ position: "absolute", top: 12, left: 12 }} className="tag">{index === 0 ? "CHILL MODE" : index === 1 ? "FRESH FINDS" : "LOUD & PROUD"}</div>{index % 3 === 0 ? <Waves size={46} strokeWidth={1.3} /> : index % 3 === 1 ? <AudioLines size={46} strokeWidth={1.3} /> : <Music2 size={46} strokeWidth={1.3} />}</div>
                <div className="station-meta"><div><h3>{station.name}</h3><p>{station.genre}</p></div><button className="icon-btn" onClick={() => toggleFavorite(station.id)} aria-label={favorites.includes(station.id) ? "Usuń z ulubionych" : "Dodaj do ulubionych"} style={{ color: favorites.includes(station.id) ? "var(--red)" : "#9999a6" }}><Heart size={17} fill={favorites.includes(station.id) ? "currentColor" : "none"} /></button></div>
                <p className="muted" style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>{station.tagline}</p>
                <div className="station-actions"><button className="primary" onClick={() => currentId === station.id && playing ? togglePlayback() : playStation(station)}>{currentId === station.id && playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}{currentId === station.id && playing ? "Pauza" : "Słuchaj"}</button><span className="tag"><RadioTower size={12} style={{ display: "inline", verticalAlign: "middle" }} /> STREAM</span></div>
              </article>)}
            </div>
          </section>

          <section className="content-grid" id="community">
            {backendEnabled ? <Shoutbox nickname={nickname} /> : <ShoutboxOffline />}
            <section className="panel" id="profile">
              <div className="eyebrow">Twoje miejsce w sieci</div><h2>Twój profil <span style={{ color: "var(--red)" }}>//</span></h2><p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>Ustaw swój nick i wracaj do ulubionych stacji. Profil w tej wersji zapisuje się w tej przeglądarce.</p>
              <div className="profile-box"><div className="avatar">{nickname.slice(0, 1).toUpperCase()}</div><div style={{ minWidth: 0 }}><strong>{nickname}</strong><small><Disc3 size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Słuchacz RadioWave</small></div></div>
              <form className="profile-form" onSubmit={saveNickname}><input className="field" value={nicknameInput} maxLength={24} onChange={(event) => setNicknameInput(event.target.value)} aria-label="Twój nick" placeholder="Wpisz nick" /><button className="secondary">Zapisz nick</button></form>
              <div style={{ marginTop: 22 }}><div className="eyebrow">Twoje ulubione</div><p style={{ fontSize: 13, margin: "8px 0", color: "#d6d6df" }}>{favorites.length ? favorites.map((id) => allStations.find((station) => station.id === id)?.name).filter(Boolean).join(" · ") : "Kliknij serduszko przy stacji, aby dodać ją do ulubionych."}</p></div>
              <div className="admin-grid" style={{ marginTop: 20 }}><div className="admin-tile"><strong>{allStations.length}</strong><span>Dostępne stacje</span></div><div className="admin-tile"><strong>{favorites.length}</strong><span>Ulubione stacje</span></div></div>
            </section>
          </section>

          {adminOpen && <section className="panel" id="admin" style={{ marginBottom: 28 }}>
            <div className="panel-head"><div><div className="eyebrow">Narzędzia witryny</div><h2>Panel stacji <span style={{ color: "var(--red)" }}>//</span></h2></div><button className="icon-btn" onClick={() => setAdminOpen(false)} aria-label="Zamknij panel"><X size={17} /></button></div>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>Dodawaj i usuwaj stacje zapisane lokalnie w tej przeglądarce. To wersja demonstracyjna — nie jest to jeszcze zabezpieczony panel administratora.</p>
            <form onSubmit={addStation} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, margin: "16px 0" }}>
              <input className="field" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nazwa stacji" aria-label="Nazwa stacji" maxLength={50} required />
              <input className="field" value={newGenre} onChange={(event) => setNewGenre(event.target.value)} placeholder="Gatunek" aria-label="Gatunek" maxLength={60} />
              <input className="field" value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="https://… adres strumienia" aria-label="Adres strumienia" type="url" required />
              <button className="primary"><Radio size={15} /> Dodaj stację</button>
            </form>
            {stationNotice && <p className="notice" role="status">{stationNotice}</p>}
            {customStations.length > 0 && <div className="chat-list">{customStations.map((station) => <div className="chat-message" key={station.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><div><strong>{station.name}</strong><p>{station.genre}</p></div><button className="secondary" onClick={() => removeStation(station.id)}>Usuń</button></div>)}</div>}
            <p className="notice">Docelowo ten obszar wymaga logowania administratora i autoryzacji po stronie serwera przed publicznym wdrożeniem.</p>
          </section>}
        </main>

        <footer className="footer"><span>© {new Date().getFullYear()} RadioWave · Twoja muzyka, Twoja scena.</span><span><span style={{ color: "var(--red)" }}>●</span> Zbudowane dla tych, którzy słuchają inaczej.</span></footer>
      </div>
    </>
  );
}
