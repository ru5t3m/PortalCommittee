import "../globals.css";
import { Document } from "@/components/Document";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return <Document lang="ru">{children}</Document>;
}
