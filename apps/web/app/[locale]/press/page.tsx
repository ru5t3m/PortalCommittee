import { Camera, FileText } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";
import { news } from "@/lib/data";

export default function PressPage() {
  return (
    <>
      <Section eyebrow="Пресс-центр" title="Новости, заявления и материалы для СМИ" description="Официальная коммуникация, публикации и порядок аккредитации представителей средств массовой информации." className="bg-white">
        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item) => <NewsCard key={item.title} {...item} />)}
        </div>
      </Section>
      <Section eyebrow="СМИ" title="Медиа и аккредитация">
        <div className="grid gap-5 md:grid-cols-2">
          <PremiumCard>
            <Camera className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Медиа</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Фотографии, видеофрагменты и материалы для публикации предоставляются через официальный пресс-контур.</p>
          </PremiumCard>
          <PremiumCard>
            <FileText className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">Аккредитация СМИ</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Заявки рассматриваются по установленным правилам с учетом целей мероприятия и требований безопасности.</p>
          </PremiumCard>
        </div>
      </Section>
    </>
  );
}
