import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "КНБ РК | Официальный портал",
  description: "Информационный портал по вопросам национальной безопасности Республики Казахстан"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
