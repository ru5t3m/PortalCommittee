import Link from "next/link";
import { ArrowDown, ArrowRight, Gamepad2 } from "lucide-react";
import { ActivitySlideDeck } from "@/components/ActivitySlideDeck";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getActivities } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const gameUrl = "https://spec-game-pi.vercel.app";

const activityDetailsRu = [
  {
    theme: "Опережение угроз",
    background: "linear-gradient(135deg, #06182d 0%, #073553 54%, #006b66 100%)",
    description: "Выявление, предупреждение и пресечение терроризма и иной деятельности, направленной на насильственное изменение конституционного строя, нарушение целостности и подрыв безопасности Республики Казахстан.",
    slides: [
      ["Задача", "Выявлять, предупреждать и пресекать терроризм, а также деятельность, направленную на подрыв безопасности государства."],
      ["Фокус", "Конституционный строй, территориальная целостность и безопасность Республики Казахстан."],
      ["Инструменты", "Оперативная работа, аналитика угроз, межведомственная координация и профилактические меры."],
      ["Гражданам", "Сообщайте о подозрительных действиях через официальные каналы и не распространяйте непроверенную информацию."]
    ]
  },
  {
    theme: "Суверенитет и интересы",
    background: "linear-gradient(135deg, #06182d 0%, #102d4f 54%, #007d73 100%)",
    description: "Осуществление контрразведывательной деятельности, добывание разведывательной информации в интересах Республики Казахстан.",
    slides: [
      ["Задача", "Осуществлять контрразведывательную деятельность и получать разведывательную информацию в интересах РК."],
      ["Фокус", "Государственные интересы, суверенитет, защищенность сведений и устойчивость ключевых процессов."],
      ["Инструменты", "Контрразведывательные меры, аналитика, специальные проверки и межведомственное взаимодействие."],
      ["Гражданам", "Соблюдайте требования по работе с документами и используйте только официальные каналы связи."]
    ]
  },
  {
    theme: "Граница и контроль",
    background: "linear-gradient(135deg, #06182d 0%, #0b4563 54%, #3b7f89 100%)",
    description: "Обеспечение защиты и охраны Государственной границы Республики Казахстан.",
    slides: [
      ["Задача", "Обеспечивать защиту и охрану Государственной границы Республики Казахстан."],
      ["Фокус", "Пограничный режим, контроль участков границы, перемещение людей и грузов."],
      ["Инструменты", "Пограничные подразделения, мониторинг, региональная координация и взаимодействие с госорганами."],
      ["Гражданам", "Соблюдайте правила пересечения границы и заранее проверяйте документы."]
    ]
  },
  {
    theme: "Режим секретности",
    background: "linear-gradient(135deg, #06182d 0%, #26314f 54%, #9b6b12 100%)",
    description: "Координация и осуществление деятельности по противодействию техническим разведкам в отношении сведений, составляющих государственные секреты.",
    slides: [
      ["Задача", "Защищать сведения, составляющие государственные секреты, от технических разведок."],
      ["Фокус", "Государственные секреты, технические каналы утечки, режимы доступа и защищенность информации."],
      ["Инструменты", "Координация, контроль, режимные меры и противодействие техническим разведкам."],
      ["Гражданам", "Не публикуйте и не пересылайте сведения ограниченного доступа через открытые каналы."]
    ]
  },
  {
    theme: "Защищенная связь",
    background: "linear-gradient(135deg, #06182d 0%, #004c5f 54%, #008a94 100%)",
    description: "Обеспечение Президента РК, государственных органов, Вооруженных Сил, других войск и воинских формирований РК правительственной связью в мирное и военное время, организация шифровальной работы.",
    slides: [
      ["Задача", "Обеспечивать правительственной связью руководство страны, госорганы и воинские формирования."],
      ["Фокус", "Связь в мирное и военное время, устойчивость каналов и организация шифровальной работы."],
      ["Инструменты", "Регламентированные каналы, техническая защита, резервирование и контроль инфраструктуры."],
      ["Гражданам", "Для обращений используйте официальные контакты и проверяйте домены государственных ресурсов."]
    ]
  },
  {
    theme: "Правовая защита",
    background: "linear-gradient(135deg, #06182d 0%, #24415f 54%, #99731d 100%)",
    description: "Выявление, пресечение, раскрытие и расследование уголовных правонарушений, отнесенных законодательством к ведению органов национальной безопасности.",
    slides: [
      ["Задача", "Выявлять, пресекать, раскрывать и расследовать уголовные правонарушения в ведении органов национальной безопасности."],
      ["Фокус", "Уголовные правонарушения, отнесенные законодательством к компетенции органов национальной безопасности."],
      ["Инструменты", "Оперативная работа, процессуальные действия, аналитика и взаимодействие с уполномоченными органами."],
      ["Гражданам", "При наличии значимой информации обращайтесь через официальные каналы."]
    ]
  }
];

const activityDetailsKk = [
  {
    theme: "Қатерлердің алдын алу",
    background: "linear-gradient(135deg, #06182d 0%, #073553 54%, #006b66 100%)",
    description: "Қазақстан Республикасының конституциялық құрылысын күштеп өзгертуге, тұтастығын бұзуға және қауіпсіздігіне нұқсан келтіруге бағытталған терроризмді және өзге де қызметті анықтау, алдын алу және жолын кесу.",
    slides: [
      ["Міндет", "Терроризмді және мемлекет қауіпсіздігіне нұқсан келтіруге бағытталған қызметті анықтау, алдын алу және жолын кесу."],
      ["Фокус", "Конституциялық құрылыс, аумақтық тұтастық және Қазақстан Республикасының қауіпсіздігі."],
      ["Құралдар", "Жедел жұмыс, қатерлерді талдау, ведомствоаралық үйлестіру және профилактикалық шаралар."],
      ["Азаматтарға", "Күдікті әрекеттер туралы ресми арналар арқылы хабарлаңыз және тексерілмеген ақпаратты таратпаңыз."]
    ]
  },
  {
    theme: "Егемендік пен мүдделер",
    background: "linear-gradient(135deg, #06182d 0%, #102d4f 54%, #007d73 100%)",
    description: "Қарсы барлау қызметін жүзеге асыру, Қазақстан Республикасының мүдделері үшін барлау ақпаратын алу.",
    slides: [
      ["Міндет", "Қарсы барлау қызметін жүзеге асыру және ҚР мүдделері үшін барлау ақпаратын алу."],
      ["Фокус", "Мемлекеттік мүдделер, егемендік, мәліметтердің қорғалуы және негізгі процестердің тұрақтылығы."],
      ["Құралдар", "Қарсы барлау шаралары, талдау, арнайы тексерулер және ведомствоаралық өзара іс-қимыл."],
      ["Азаматтарға", "Құжаттармен жұмыс талаптарын сақтаңыз және тек ресми байланыс арналарын пайдаланыңыз."]
    ]
  },
  {
    theme: "Шекара және бақылау",
    background: "linear-gradient(135deg, #06182d 0%, #0b4563 54%, #3b7f89 100%)",
    description: "Қазақстан Республикасының Мемлекеттік шекарасын қорғауды және күзетуді қамтамасыз ету.",
    slides: [
      ["Міндет", "Қазақстан Республикасының Мемлекеттік шекарасын қорғауды және күзетуді қамтамасыз ету."],
      ["Фокус", "Шекара режимі, шекара учаскелерін бақылау, адамдар мен жүктердің қозғалысы."],
      ["Құралдар", "Шекара бөлімшелері, мониторинг, өңірлік үйлестіру және мемлекеттік органдармен өзара іс-қимыл."],
      ["Азаматтарға", "Шекарадан өту қағидаларын сақтап, құжаттарды алдын ала тексеріңіз."]
    ]
  },
  {
    theme: "Құпиялылық режимі",
    background: "linear-gradient(135deg, #06182d 0%, #26314f 54%, #9b6b12 100%)",
    description: "Мемлекеттік құпияларды құрайтын мәліметтерге қатысты техникалық барлауларға қарсы іс-қимыл жөніндегі қызметті үйлестіру және жүзеге асыру.",
    slides: [
      ["Міндет", "Мемлекеттік құпияларды құрайтын мәліметтерді техникалық барлаулардан қорғау."],
      ["Фокус", "Мемлекеттік құпиялар, техникалық ақпарат ағу арналары, қол жеткізу режимдері және ақпараттың қорғалуы."],
      ["Құралдар", "Үйлестіру, бақылау, режимдік шаралар және техникалық барлауларға қарсы іс-қимыл."],
      ["Азаматтарға", "Қолжетімділігі шектеулі мәліметтерді ашық арналарда жарияламаңыз және жібермеңіз."]
    ]
  },
  {
    theme: "Қорғалған байланыс",
    background: "linear-gradient(135deg, #06182d 0%, #004c5f 54%, #008a94 100%)",
    description: "ҚР Президентін, мемлекеттік органдарды, Қарулы Күштерді, басқа да әскерлер мен әскери құралымдарды бейбіт және соғыс уақытында үкіметтік байланыспен қамтамасыз ету, шифрлау жұмысын ұйымдастыру.",
    slides: [
      ["Міндет", "Ел басшылығын, мемлекеттік органдарды және әскери құралымдарды үкіметтік байланыспен қамтамасыз ету."],
      ["Фокус", "Бейбіт және соғыс уақытындағы байланыс, арналардың тұрақтылығы және шифрлау жұмысын ұйымдастыру."],
      ["Құралдар", "Регламенттелген арналар, техникалық қорғау, резервтеу және инфрақұрылымды бақылау."],
      ["Азаматтарға", "Өтініштер үшін ресми байланыстарды пайдаланып, мемлекеттік ресурстардың домендерін тексеріңіз."]
    ]
  },
  {
    theme: "Құқықтық қорғау",
    background: "linear-gradient(135deg, #06182d 0%, #24415f 54%, #99731d 100%)",
    description: "Заңнамада ұлттық қауіпсіздік органдарының қарауына жатқызылған қылмыстық құқық бұзушылықтарды анықтау, жолын кесу, ашу және тергеу.",
    slides: [
      ["Міндет", "Ұлттық қауіпсіздік органдарының қарауына жататын қылмыстық құқық бұзушылықтарды анықтау, жолын кесу, ашу және тергеу."],
      ["Фокус", "Заңнамада ұлттық қауіпсіздік органдарының құзыретіне жатқызылған қылмыстық құқық бұзушылықтар."],
      ["Құралдар", "Жедел жұмыс, процестік әрекеттер, талдау және уәкілетті органдармен өзара іс-қимыл."],
      ["Азаматтарға", "Маңызды ақпарат болған жағдайда ресми арналар арқылы жүгініңіз."]
    ]
  }
];

const pageCopy = {
  ru: {
    eyebrow: "Направления деятельности",
    title: "Вертикальная карта направлений деятельности КНБ",
    description: "Скролл проведет по направлениям сверху вниз. Внутри каждого блока есть горизонтальная лента: листайте ее, чтобы увидеть задачи, фокус, инструменты и рекомендации.",
    start: "Начать скролл",
    game: "К игре",
    count: "направлений",
    system: "Единая система безопасности",
    contents: "Навигация",
    contentsText: "Выберите направление или просмотрите страницу последовательно.",
    descriptionLabel: "Описание",
    openCard: "Открыть подробнее",
    interactive: "Интерактив",
    gameTitle: "Понять направления через игру",
    gameText: "Кнопка ведет на обучающую игру по направлениям деятельности.",
    play: "Сыграть",
    next: "Далее",
    of: "из",
    previous: "Предыдущий слайд",
    showSlide: "Показать слайд"
  },
  kk: {
    eyebrow: "Қызмет бағыттары",
    title: "ҰҚК қызмет бағыттарының картасы",
    description: "Бөлімдер жоғарыдан төмен қарай берілген. Әр блоктағы көлденең лентадан міндеттерді, фокусты, құралдарды және ұсынымдарды көре аласыз.",
    start: "Қарауды бастау",
    game: "Ойынға",
    count: "бағыт",
    system: "Қауіпсіздіктің бірыңғай жүйесі",
    contents: "Мазмұны",
    contentsText: "Бағытты таңдаңыз немесе бетті ретімен қараңыз.",
    descriptionLabel: "Сипаттама",
    openCard: "Толығырақ ашу",
    interactive: "Интерактив",
    gameTitle: "Бағыттарды ойын арқылы түсіну",
    gameText: "Батырма қызмет бағыттары бойынша оқыту ойынына апарады.",
    play: "Ойнау",
    next: "Келесі",
    of: "ішінен",
    previous: "Алдыңғы слайд",
    showSlide: "Слайдты көрсету"
  }
};

export default async function ActivitiesOverviewPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const activities = getActivities(locale);
  const activityDetails = locale === "kk" ? activityDetailsKk : activityDetailsRu;
  const copy = pageCopy[locale];

  return (
    <>
      <section className="relative min-h-[82vh] overflow-hidden bg-[#06182d] text-white">
        <div className="security-grid absolute inset-0 opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(0,169,155,0.35),transparent_28rem),radial-gradient(circle_at_82%_10%,rgba(248,177,51,0.18),transparent_26rem)]" />
        <Container className="relative grid min-h-[82vh] items-center gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{copy.eyebrow}</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{copy.description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="#counter-terrorism" variant="gold">{copy.start}</Button>
              <Button href={gameUrl} variant="ghost"><Gamepad2 className="h-4 w-4" /> {copy.game}</Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/14 bg-white/[0.08] p-6 shadow-premium backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(0,169,155,0.22),transparent_18rem)]" />
              <div className="relative flex items-center justify-between gap-6">
                <KnbEmblem className="h-20 w-20" />
                <div className="text-right">
                  <p className="text-sm uppercase tracking-wide text-state-gold">{activities.length} {copy.count}</p>
                  <p className="mt-1 text-2xl font-bold">{copy.system}</p>
                </div>
              </div>
              <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
                {activities.map((activity) => (
                  <Link key={activity.slug} href={`#${activity.slug}`} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:border-state-gold/45 hover:bg-white/[0.11]">
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-state-teal/18 text-state-teal">
                        <activity.icon className="h-5 w-5" />
                      </span>
                      <span className="font-semibold">{activity.title}</span>
                    </span>
                    <ArrowDown className="h-4 w-4 text-state-gold transition group-hover:translate-y-1" />
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[#f7fbf9] py-16 md:py-20">
        <Container className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[1.35rem] border border-state-teal/15 bg-white p-5 shadow-[0_18px_55px_rgba(6,24,45,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-state-gold">{copy.contents}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{copy.contentsText}</p>
              <nav className="mt-5 grid gap-1" aria-label={copy.contents}>
                {activities.map((activity, index) => (
                  <Link
                    key={activity.slug}
                    href={`#${activity.slug}`}
                    className="group grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-state-navy transition hover:bg-state-teal/10"
                  >
                    <span className="text-xs font-bold tabular-nums text-state-tealDark">{String(index + 1).padStart(2, "0")}</span>
                    <span className="leading-5">{activity.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <div className="grid gap-6">
            {activities.map((activity, index) => {
              const detail = activityDetails[index];
              return (
                <article
                  id={activity.slug}
                  key={activity.slug}
                  className="scroll-mt-28 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(6,24,45,0.07)]"
                >
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,169,155,0.08),transparent)]" />
                    <Reveal className="relative p-6 pb-0 md:p-8 md:pb-0">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <Badge className="border-state-teal/20 bg-state-teal/10 text-state-tealDark">
                            {index + 1} / {activities.length}
                          </Badge>
                          <h2 className="mt-6 max-w-4xl text-balance text-3xl font-bold leading-tight text-state-navy md:text-4xl">{activity.title}</h2>
                        </div>
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-state-navy text-state-gold">
                          <activity.icon className="h-6 w-6" />
                        </span>
                      </div>

                      <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-600 md:text-base">{detail.description}</p>
                    </Reveal>

                    <Reveal delay={0.08} className="relative min-w-0">
                      <ActivitySlideDeck
                        theme={detail.theme}
                        slides={detail.slides}
                      />
                    </Reveal>

                    <div className="relative px-6 pb-6 md:px-8 md:pb-8">
                      <Link
                        className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark hover:shadow-premium"
                        href={`/${locale}/activities/${activity.slug}`}
                      >
                        {copy.openCard} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="activity-game" className="relative overflow-hidden bg-[#f7fbf9] pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-[1.6rem] bg-state-navy px-6 py-10 text-white shadow-premium md:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_26%,rgba(0,169,155,0.28),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(214,168,58,0.18),transparent_22rem)]" />
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <Badge className="border-white/15 bg-white/10 text-state-gold">{copy.interactive}</Badge>
                <h2 className="mt-4 text-4xl font-bold">{copy.gameTitle}</h2>
                <p className="mt-4 max-w-2xl text-white/70">{copy.gameText}</p>
              </div>
              <a className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15" href={gameUrl}>
                <Gamepad2 className="h-5 w-5 text-state-gold" />
                {copy.play}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
