import "./globals.css";
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ҚР ҰҚК | Ресми портал",
  description: "Қазақстан Республикасының ұлттық қауіпсіздігі мәселелері бойынша ақпараттық портал"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk">
      <body>{children}</body>
    </html>
  );
}
