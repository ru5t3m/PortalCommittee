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
    descriptionLabel: "Описание",
    openCard: "Открыть карточку",
    interactive: "Интерактив",
    gameTitle: "Понять направления через игру",
    gameText: "Кнопка ведет на обучающую игру по направлениям деятельности.",
    play: "Сыграть"
  },
  kk: {
    eyebrow: "Қызмет бағыттары",
    title: "ҰҚК қызмет бағыттарының картасы",
    description: "Бөлімдер жоғарыдан төмен қарай берілген. Әр блоктағы көлденең лентадан міндеттерді, фокусты, құралдарды және ұсынымдарды көре аласыз.",
    start: "Қарауды бастау",
    game: "Ойынға",
    count: "бағыт",
    system: "Қауіпсіздіктің бірыңғай жүйесі",
    descriptionLabel: "Сипаттама",
    openCard: "Карточканы ашу",
    interactive: "Интерактив",
    gameTitle: "Бағыттарды ойын арқылы түсіну",
    gameText: "Кнопка қызмет бағыттары бойынша оқыту ойынына апарады.",
    play: "Ойнау"
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

      <section className="bg-[#f6fbf8]">
        {activities.map((activity, index) => {
          const detail = activityDetails[index];
          return (
            <article id={activity.slug} key={activity.slug} className="relative overflow-hidden text-white" style={{ backgroundImage: detail.background }}>
              <div className="security-grid absolute inset-0 opacity-45" />
              <div className="absolute -right-24 top-16 h-[24rem] w-[24rem] rounded-full border border-state-gold/16" />
              <Container className="relative grid gap-6 py-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,2.08fr)] lg:items-center">
                <Reveal>
                  <div>
                    <Badge className="border-white/20 bg-white/10 text-state-gold">{String(index + 1).padStart(2, "0")} / {activities.length}</Badge>
                    <div className="mt-4 flex items-start gap-3">
                      <activity.icon className="mt-1 h-9 w-9 shrink-0 text-state-gold" />
                      <div>
                        <h2 className="max-w-[19rem] text-balance text-2xl font-bold leading-tight sm:max-w-none md:text-3xl">{activity.title}</h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">{activity.text}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-[1.1rem] border border-white/12 bg-white/[0.07] p-4 backdrop-blur">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-state-gold">{copy.descriptionLabel}</p>
                      <p className="mt-2 text-xs leading-6 text-white/72 md:text-sm">{detail.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/16" href={`/${locale}/activities/${activity.slug}`}>
                        {copy.openCard} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.08} className="min-w-0">
                  <ActivitySlideDeck activityTitle={activity.title} theme={detail.theme} slides={detail.slides} />
                </Reveal>
              </Container>
            </article>
          );
        })}
      </section>

      <section id="activity-game" className="relative overflow-hidden bg-state-navy py-20 text-white">
        <div className="security-grid absolute inset-0 opacity-45" />
        <Container className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge className="border-white/15 bg-white/10 text-state-gold">{copy.interactive}</Badge>
            <h2 className="mt-4 text-4xl font-bold">{copy.gameTitle}</h2>
            <p className="mt-4 max-w-2xl text-white/70">{copy.gameText}</p>
          </div>
          <a className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15" href={gameUrl}>
            <Gamepad2 className="h-5 w-5 text-state-gold" />
            {copy.play}
          </a>
        </Container>
      </section>
    </>
  );
}
