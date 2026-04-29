import { FileArchive, FileCheck2, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Section } from "@/components/ui/Section";

const docs: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Законы", text: "Нормативные акты Республики Казахстан по вопросам национальной безопасности.", icon: Scale },
  { title: "Приказы", text: "Публично раскрываемые ведомственные документы и организационные решения.", icon: FileCheck2 },
  { title: "Регламенты", text: "Порядок взаимодействия со СМИ, публикации информации и ведения открытых справочных разделов.", icon: FileArchive }
];

export default function DocumentsPage() {
  return (
    <Section eyebrow="Документы" title="Законы, приказы и регламенты" description="Единая витрина официальных документов с категориями, поиском и возможностью дальнейшего подключения реестра." className="bg-white">
      <div className="grid gap-5 md:grid-cols-3">
        {docs.map((item) => (
          <PremiumCard key={item.title}>
            <item.icon className="h-8 w-8 text-state-teal" />
            <h3 className="mt-5 text-xl font-bold text-state-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
