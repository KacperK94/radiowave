"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function JoinLink() {
  const pathname = usePathname();
  if (pathname === "/register") return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 7, padding: "9px 14px", background: "#171016", borderBottom: "1px solid #38202a", color: "#c8bdc7", fontSize: 12, textAlign: "center" }}>
      <span>Nowość na RadioWave — zapisz swój profil i ulubione stacje.</span>
      <Link href="/register" style={{ color: "#ff6576", fontWeight: 700, textDecoration: "none" }}>Dołącz do społeczności <span aria-hidden="true">→</span></Link>
    </div>
  );
}
