import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/components/player-provider";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "World Cup Pick'em", template: "%s · Pick'em" },
  description: "A private World Cup prediction game.",
};

export const viewport: Viewport = { themeColor: "#11110f" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${mono.variable} font-sans antialiased`}>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
