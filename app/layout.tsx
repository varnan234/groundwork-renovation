import type { Metadata, Viewport } from "next";
import { Archivo, Schibsted_Grotesk, Azeret_Mono } from "next/font/google";
import { RackProvider } from "@/components/RackProvider";
import { site } from "@/lib/site";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const body = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const ticket = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-ticket",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} | Basement renovation, drywall, flooring and more in ${site.areaShort}`,
  description:
    "Basement renovation, framing, drywall repair, painting, flooring, tiling and plumbing across the Greater Toronto Area. Book a visit or DM a photo for a quick estimate.",
};

export const viewport: Viewport = {
  themeColor: "#f4f4f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${body.variable} ${ticket.variable}`}>
      <body>
        <RackProvider>{children}</RackProvider>
      </body>
    </html>
  );
}
