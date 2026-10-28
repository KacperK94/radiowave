import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "RadioWave — Twoje radio. Twoja scena.",
  description: "Odkrywaj internetowe stacje radiowe, poznawaj ludzi i dziel się muzyką. RadioWave — klimat starego internetu w nowym wydaniu.",
  applicationName: "RadioWave",
  themeColor: "#09090c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body><ConvexClientProvider>{children}</ConvexClientProvider></body>
    </html>
  );
}
