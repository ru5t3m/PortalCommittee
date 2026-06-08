import { BookOpenCheck, CalendarClock, ClipboardCheck, FileText, GraduationCap, MapPinned, ShieldCheck, Stethoscope, Trophy, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Locale } from "@/lib/i18n";

type InfoBlock = {
  title: string;
  text?: string;
  items?: string[];
  icon: LucideIcon;
};

const copy = {
  ru: {
    eyebrow: "Поступление на учебу",
    title: "Академия КНБ",
    description: "Порядок поступления на обучение в Академию КНБ со сроком обучения 4 года: требования к кандидатам, предварительное изучение, конкурсный отбор и учет результатов ЕНТ.",
    apply: "Подать заявку на поступление",
    introTitle: "Кого принимают",
    introText: "Для поступления на учебу в Академию КНБ со сроком обучения 4 года принимаются граждане, имеющие среднее или послесреднее образование, не проходившие воинскую службу, достигшие в год поступления возраста 17 лет, но не старше 21 года.",
    summary: [
      ["4 года", "срок обучения"],
      ["17-21", "возраст в год поступления"],
      ["6-7 месяцев", "предварительное изучение"]
    ],
    routeTitle: "Маршрут поступления",
    routeText: "Кандидат начинает подготовку заранее через территориальный орган КНБ, проходит изучение, затем конкурсный прием и зачисление по рейтингу.",
    selectionTitle: "Что входит в профессиональный отбор",
    entTitle: "ЕНТ и выбор специальности",
    contactTitle: "Первый шаг кандидата",
    blocks: [
      {
        title: "Куда обращаться",
        text: "Изучение кандидатов проводится заблаговременно, за 6-7 месяцев до начала приемной кампании. Для начала процедуры кандидату необходимо обратиться в территориальный орган КНБ по месту жительства, то есть в ДКНБ по области проживания кандидата.",
        icon: MapPinned
      },
      {
        title: "Предварительное изучение кандидата",
        text: "Изучение кандидата предусматривает специальную проверку, медицинское и психофизиологическое освидетельствование в военно-врачебных комиссиях, а также полиграфологическое исследование.",
        icon: Stethoscope
      },
      {
        title: "Конкурсный прием",
        text: "Прием в вузы органов национальной безопасности проводится на конкурсной основе и состоит из медицинского освидетельствования и окончательного профессионального отбора на базе Академии КНБ.",
        icon: Trophy
      },
      {
        title: "Окончательный профессиональный отбор",
        items: [
          "проверка на профессиональную пригодность",
          "проверка физической подготовленности",
          "экзамен на знание предмета \"Основы права\"",
          "проверка письменных навыков в формате эссе"
        ],
        icon: ClipboardCheck
      },
      {
        title: "Специальность «Контрразведывательная деятельность»",
        text: "Кандидаты по данной специальности в рамках ЕНТ выбирают любые два предмета по выбору из общеобразовательной учебной программы общего среднего образования вместе с обязательными предметами: история Казахстана, математическая грамотность и грамотность чтения.",
        icon: BookOpenCheck
      },
      {
        title: "Специальность «Организация и технология защиты информации»",
        text: "По данной специальности реализуется двудипломное образование совместно с Казахским национальным исследовательским техническим университетом имени К. Сатпаева. При сдаче ЕНТ кандидаты выбирают профильные предметы «математика-информатика» либо «математика-физика» вместе с обязательными предметами. В приоритете учитывается склонность кандидатов к точным наукам.",
        icon: GraduationCap
      },
      {
        title: "Зачисление",
        text: "Зачисление производится по решению приемной комиссии на основании рейтинга кандидата по итогам конкурсного отбора. Рейтинг определяется путем сложения баллов ЕНТ по сертификату и результатов окончательного профессионального отбора.",
        icon: UsersRound
      },
      {
        title: "Требования к сертификату ЕНТ",
        text: "Сертификат ЕНТ должен быть не ниже порогового уровня, установленного Правилами присуждения образовательного гранта: не менее 5 баллов по истории Казахстана, математической грамотности, грамотности чтения на языке обучения и не менее 5 баллов по каждому профильному предмету. Проходной балл зависит от приказа Министра науки и высшего образования РК.",
        icon: FileText
      }
    ] satisfies InfoBlock[],
    noteTitle: "Дополнительная информация",
    noteText: "Остальные условия по изучению кандидатов и поступлению доводятся кадровыми подразделениями ДКНБ."
  },
  kk: {
    eyebrow: "Оқуға қабылдау",
    title: "ҰҚК Академиясы",
    description: "Оқу мерзімі 4 жыл болатын ҰҚК Академиясына түсу тәртібі: кандидаттарға қойылатын талаптар, алдын ала зерделеу, конкурстық іріктеу және ҰБТ нәтижелерін есепке алу.",
    apply: "Оқуға өтінім беру",
    introTitle: "Кімдер қабылданады",
    introText: "Оқу мерзімі 4 жыл болатын ҰҚК Академиясына орта немесе орта білімнен кейінгі білімі бар, әскери қызмет өткермеген, түсу жылы 17 жасқа толған, бірақ 21 жастан аспаған азаматтар қабылданады.",
    summary: [
      ["4 жыл", "оқу мерзімі"],
      ["17-21", "түсу жылындағы жас"],
      ["6-7 ай", "алдын ала зерделеу"]
    ],
    routeTitle: "Түсу маршруты",
    routeText: "Кандидат дайындықты алдын ала ҰҚК аумақтық органы арқылы бастайды, зерделеуден өтеді, кейін конкурстық қабылдау және рейтинг бойынша оқуға қабылдау кезеңдерінен өтеді.",
    selectionTitle: "Кәсіби іріктеуге не кіреді",
    entTitle: "ҰБТ және мамандық таңдау",
    contactTitle: "Кандидаттың алғашқы қадамы",
    blocks: [
      {
        title: "Қайда жүгіну керек",
        text: "Кандидаттарды зерделеу қабылдау науқаны басталғанға дейін алдын ала, 6-7 ай бұрын жүргізіледі. Ол үшін кандидат тұрғылықты жері бойынша ҰҚК аумақтық органына, яғни өзі тұратын облыс бойынша ҰҚК департаментіне жүгінеді.",
        icon: MapPinned
      },
      {
        title: "Кандидатты алдын ала зерделеу",
        text: "Кандидатты зерделеу арнайы тексеруден, әскери-дәрігерлік комиссияларда медициналық және психофизиологиялық куәландырудан, сондай-ақ полиграфологиялық зерттеуден өтуді көздейді.",
        icon: Stethoscope
      },
      {
        title: "Конкурстық қабылдау",
        text: "Ұлттық қауіпсіздік органдарының жоғары оқу орындарына қабылдау конкурстық негізде жүзеге асырылады және медициналық куәландыру мен ҰҚК Академиясы базасындағы түпкілікті кәсіби іріктеуден тұрады.",
        icon: Trophy
      },
      {
        title: "Түпкілікті кәсіби іріктеу",
        items: [
          "кәсіби жарамдылықты тексеру",
          "дене даярлығын тексеру",
          "\"Құқық негіздері\" пәні бойынша емтихан",
          "эссе түріндегі жазбаша дағдыларды тексеру"
        ],
        icon: ClipboardCheck
      },
      {
        title: "«Қарсы барлау қызметі» мамандығы",
        text: "Бұл мамандық бойынша кандидаттар ҰБТ шеңберінде Қазақстан тарихы, математикалық сауаттылық және оқу сауаттылығы міндетті пәндерімен бірге жалпы орта білім беру бағдарламасынан кез келген екі таңдау пәнін таңдайды.",
        icon: BookOpenCheck
      },
      {
        title: "«Ақпаратты қорғауды ұйымдастыру және технологиясы» мамандығы",
        text: "Бұл мамандық бойынша Қ. Сәтбаев атындағы Қазақ ұлттық зерттеу техникалық университетімен бірлескен екі дипломды білім беру қарастырылған. ҰБТ тапсыру кезінде кандидаттар міндетті пәндермен бірге «математика-информатика» немесе «математика-физика» бейіндік пәндерін таңдайды. Нақты ғылымдарға бейімділік басым ескеріледі.",
        icon: GraduationCap
      },
      {
        title: "Оқуға қабылдау",
        text: "Оқуға қабылдау конкурстық іріктеу қорытындысы бойынша кандидат рейтингі негізінде қабылдау комиссиясының шешімімен жүргізіледі. Рейтинг ҰБТ сертификатының балдары мен түпкілікті кәсіби іріктеу нәтижелерін қосу арқылы анықталады.",
        icon: UsersRound
      },
      {
        title: "ҰБТ сертификатына қойылатын талаптар",
        text: "ҰБТ сертификаты білім беру грантын беру қағидаларында белгіленген шекті деңгейден төмен болмауы тиіс: Қазақстан тарихы, математикалық сауаттылық, оқу сауаттылығы бойынша және әр бейіндік пән бойынша кемінде 5 балл. Өту балы ҚР Ғылым және жоғары білім министрінің бұйрығына байланысты.",
        icon: FileText
      }
    ] satisfies InfoBlock[],
    noteTitle: "Қосымша ақпарат",
    noteText: "Кандидаттарды зерделеу және оқуға қабылдау бойынша қалған шарттарды ҰҚКД кадр бөлімшелері жеткізеді."
  }
};

export default async function KnbAcademyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const contactBlock = t.blocks[0];
  const routeBlocks = [t.blocks[0], t.blocks[1], t.blocks[2], t.blocks[6]];
  const selectionBlock = t.blocks[3];
  const specialtyBlocks = [t.blocks[4], t.blocks[5]];
  const entBlock = t.blocks[7];
  return (
    <>
      <PageHero badge={t.eyebrow} title={t.title} description={t.description} />
      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf8_48%,#ffffff_100%)] py-20 md:py-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[1.35rem] bg-state-navy p-7 text-white shadow-premium md:p-8">
              <div className="security-grid absolute inset-0 opacity-35" />
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-state-gold/25" />
              <div className="relative">
                <GraduationCap className="h-11 w-11 text-state-gold" />
                <h2 className="mt-5 text-3xl font-bold leading-tight">{t.introTitle}</h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/76">{t.introText}</p>
                <Button href={`/${locale}/appeals`} variant="gold" className="mt-7">{t.apply}</Button>
              </div>
            </div>

            <div className="grid gap-4">
              {t.summary.map(([value, label]) => (
                <div key={value} className="rounded-[1.15rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-3xl font-bold text-state-navy">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-10 rounded-[1.35rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
              <div>
                <CalendarClock className="h-9 w-9 text-state-teal" />
                <h2 className="mt-4 text-3xl font-bold text-state-navy">{t.routeTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t.routeText}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                {routeBlocks.map((block, index) => (
                  <div key={block.title} className="relative rounded-2xl bg-state-surface p-5">
                    <span className="absolute right-4 top-4 text-4xl font-black text-state-teal/12">{String(index + 1).padStart(2, "0")}</span>
                    <block.icon className="h-7 w-7 text-state-tealDark" />
                    <h3 className="mt-5 text-base font-bold leading-6 text-state-navy">{block.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[1.35rem] bg-state-navy p-6 text-white shadow-premium md:p-8">
              <ClipboardCheck className="h-9 w-9 text-state-gold" />
              <h2 className="mt-5 text-2xl font-bold">{t.selectionTitle}</h2>
              {selectionBlock.items ? (
                <ul className="mt-6 grid gap-3">
                  {selectionBlock.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold leading-6 text-white/82">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-state-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="rounded-[1.35rem] border border-state-teal/15 bg-white p-6 shadow-sm md:p-8">
              <BookOpenCheck className="h-9 w-9 text-state-teal" />
              <h2 className="mt-5 text-2xl font-bold text-state-navy">{t.entTitle}</h2>
              <div className="mt-6 grid gap-4">
                {specialtyBlocks.map((block) => (
                  <article key={block.title} className="rounded-2xl border border-slate-200 bg-state-surface p-5">
                    <h3 className="text-lg font-bold text-state-navy">{block.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{block.text}</p>
                  </article>
                ))}
                <article className="rounded-2xl border border-state-gold/30 bg-state-gold/10 p-5">
                  <h3 className="text-lg font-bold text-state-navy">{entBlock.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{entBlock.text}</p>
                </article>
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <PremiumCard className="h-full">
              <contactBlock.icon className="h-8 w-8 text-state-teal" />
              <h2 className="mt-5 text-2xl font-bold text-state-navy">{t.contactTitle}</h2>
              <h3 className="mt-4 text-lg font-bold text-state-navy">{contactBlock.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{contactBlock.text}</p>
            </PremiumCard>

            <PremiumCard className="h-full bg-state-navy text-white">
              <h2 className="text-2xl font-bold">{t.noteTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">{t.noteText}</p>
            </PremiumCard>
          </div>
        </Container>
      </section>
    </>
  );
}
