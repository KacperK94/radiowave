"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Headphones, Radio, UserRoundPlus } from "lucide-react";

export default function RegisterPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "info">("error");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (nickname.trim().length < 3) {
      setNotice("Nick musi mieć co najmniej 3 znaki.");
      setNoticeType("error");
      return;
    }
    if (password.length < 8) {
      setNotice("Hasło musi mieć co najmniej 8 znaków.");
      setNoticeType("error");
      return;
    }
    if (password !== confirmPassword) {
      setNotice("Hasła nie są takie same.");
      setNoticeType("error");
      return;
    }

    setNotice("Ekran jest gotowy, ale rejestracja nie jest jeszcze podłączona do systemu kont. Konto nie zostało utworzone.");
    setNoticeType("info");
  }

  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <Link href="/" className="register-back"><ArrowLeft size={16} /> Wróć do radia</Link>
        <div className="register-brand">
          <span className="register-brand-icon"><Radio size={25} /></span>
          <span>Radio<em>Wave</em></span>
        </div>
        <div className="register-eyebrow"><Headphones size={14} /> TWOJA MUZYKA. TWOJA SPOŁECZNOŚĆ.</div>
        <h1 id="register-title">Dołącz do<br /><span>swojej fali.</span></h1>
        <p className="register-intro">Stwórz profil słuchacza, zbieraj ulubione stacje i dołącz do rozmów z innymi fanami radia.</p>

        <form className="register-form" onSubmit={submit}>
          <label htmlFor="register-nickname">Nick</label>
          <input id="register-nickname" name="nickname" autoComplete="nickname" minLength={3} maxLength={24} required value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="np. RadioFan" />
          <label htmlFor="register-email">Adres e-mail</label>
          <input id="register-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ty@example.com" />
          <label htmlFor="register-password">Hasło</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 znaków" />
          <label htmlFor="register-confirm-password">Powtórz hasło</label>
          <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Wpisz hasło ponownie" />
          <button className="register-submit" type="submit"><UserRoundPlus size={17} /> Utwórz konto</button>
        </form>

        {notice && <p className={noticeType === "info" ? "register-notice register-notice-info" : "register-notice"} role="status">{notice}</p>}
        <p className="register-legal">Tworząc konto, akceptujesz zasady społeczności RadioWave. Nie wysyłamy formularza do serwera w tej wersji.</p>
        <div className="register-footer"><span className="register-signal" /> Radio gra. Społeczność rośnie.</div>
      </section>
      <aside className="register-side" aria-label="Informacje o RadioWave">
        <div className="register-orbit register-orbit-one" />
        <div className="register-orbit register-orbit-two" />
        <div className="register-side-content">
          <div className="register-side-mark"><Radio size={31} /></div>
          <p className="register-side-kicker">NIE SZUKAJ SZUMU.</p>
          <h2>Znajdź<br />swoje <span>brzmienie.</span></h2>
          <p>Od chilloutu po ciężkie gitary. Odkrywaj stacje, zapisuj ulubione i słuchaj po swojemu.</p>
          <div className="register-equalizer" aria-hidden="true">{[18, 32, 22, 44, 28, 52, 24, 38, 16, 46, 27, 36, 19, 42, 25, 33, 15].map((height, index) => <i key={index} style={{ height }} />)}</div>
          <span className="register-side-caption">TWOJA CZĘSTOTLIWOŚĆ. TWOJE ZASADY.</span>
        </div>
      </aside>
    </main>
  );
}
