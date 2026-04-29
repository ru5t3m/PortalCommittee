import Link from "next/link";
import { ArrowDown, ArrowRight, Gamepad2 } from "lucide-react";
import { ActivitySlideDeck } from "@/components/ActivitySlideDeck";
import { KnbEmblem } from "@/components/KnbEmblem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { activities } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const activityDetails = [
  {
    theme: "Опережение угроз",
    background: "linear-gradient(135deg, #06182d 0%, #073553 54%, #006b66 100%)",
    description: "Контртерроризм охватывает раннее выявление признаков подготовки атак, профилактику радикализации и координацию мер безопасности в местах массового пребывания людей. Это не только реагирование на угрозу, но и работа до того, как риск становится видимым для общества.",
    slides: [
      ["Задача", "Выявлять признаки подготовки угроз и снижать риски до того, как они переходят в открытую фазу."],
      ["Фокус", "Объекты массового пребывания, критическая инфраструктура, цифровая координация и радикальная пропаганда."],
      ["Инструменты", "Аналитика сообщений, координация ведомств, профилактические материалы и работа с официальными источниками."],
      ["Гражданам", "Сообщайте о подозрительных предметах и действиях через официальные каналы, не распространяйте непроверенную информацию."]
    ]
  },
  {
    theme: "Суверенитет и интересы",
    background: "linear-gradient(135deg, #06182d 0%, #102d4f 54%, #007d73 100%)",
    description: "Контрразведка направлена на защиту государственных интересов от разведывательной активности, незаконного доступа к сведениям и попыток влияния на ключевые решения. В центре направления находятся устойчивость институтов, безопасность информации и доверие к государственным процессам.",
    slides: [
      ["Задача", "Защищать государственные интересы, суверенитет и устойчивость ключевых институтов."],
      ["Фокус", "Попытки незаконного доступа к сведениям, влияние на принятие решений, разведывательная активность."],
      ["Инструменты", "Контрразведывательные меры, специальные проверки, режимы доступа и межведомственное взаимодействие."],
      ["Гражданам", "Соблюдайте требования по работе с документами и не передавайте служебные сведения через непроверенные каналы."]
    ]
  },
  {
    theme: "Цифровая устойчивость",
    background: "linear-gradient(135deg, #06243c 0%, #006f79 55%, #00a99b 100%)",
    description: "Кибербезопасность подразумевает защиту цифровой инфраструктуры, государственных сервисов и каналов обмена данными. Направление связано с предупреждением фишинга, утечек, вредоносных атак и компрометации учетных записей.",
    slides: [
      ["Задача", "Повышать устойчивость цифровой среды и критической инфраструктуры к атакам и утечкам."],
      ["Фокус", "Фишинг, вредоносные ссылки, компрометация учетных записей, атаки на государственные сервисы."],
      ["Инструменты", "Мониторинг угроз, реагирование, рекомендации по кибергигиене и защита каналов обмена."],
      ["Гражданам", "Проверяйте адреса сайтов, включайте двухфакторную защиту и не сообщайте SMS-коды третьим лицам."]
    ]
  },
  {
    theme: "Граница и контроль",
    background: "linear-gradient(135deg, #06182d 0%, #0b4563 54%, #3b7f89 100%)",
    description: "Пограничная безопасность отвечает за устойчивость режима государственной границы, контроль перемещения людей и грузов, а также выявление незаконных схем. Это направление соединяет оперативную работу, региональную координацию и публичные правила пересечения границы.",
    slides: [
      ["Задача", "Обеспечивать безопасность государственной границы и устойчивость пограничного режима."],
      ["Фокус", "Пограничный контроль, перемещение людей и грузов, выявление незаконных схем и рисков."],
      ["Инструменты", "Региональные подразделения, аналитика маршрутов, взаимодействие с государственными органами."],
      ["Гражданам", "Заранее проверяйте документы, соблюдайте правила пересечения границы и используйте официальные разъяснения."]
    ]
  },
  {
    theme: "Режим секретности",
    background: "linear-gradient(135deg, #06182d 0%, #26314f 54%, #9b6b12 100%)",
    description: "Защита государственных секретов означает контроль доступа к сведениям, безопасное обращение с документами и предотвращение разглашения чувствительной информации. Направление формирует правила, режимы и ответственность для работы с защищенными данными.",
    slides: [
      ["Задача", "Защищать сведения, составляющие государственные секреты, и организовывать режим секретности."],
      ["Фокус", "Документы, доступы, носители информации, служебные процессы и ответственность за разглашение."],
      ["Инструменты", "Проверка режимов, регламенты хранения, контроль доступа и обучение ответственных лиц."],
      ["Гражданам", "Не пересылайте сканы документов в открытые мессенджеры и не публикуйте служебную информацию."]
    ]
  },
  {
    theme: "Защищенная связь",
    background: "linear-gradient(135deg, #06182d 0%, #004c5f 54%, #008a94 100%)",
    description: "Правительственная связь обеспечивает надежные и защищенные каналы коммуникации для государственных органов и критически важных процессов. Важны непрерывность обмена, защита от перехвата и устойчивость инфраструктуры.",
    slides: [
      ["Задача", "Поддерживать защищенные каналы связи для государственных органов и критически важных процессов."],
      ["Фокус", "Надежность обмена, устойчивость каналов, целостность сообщений и защита от перехвата."],
      ["Инструменты", "Регламентированные каналы, техническая защита, контроль инфраструктуры и резервирование."],
      ["Гражданам", "Для обращений используйте только официальные контакты и проверяйте домены государственных ресурсов."]
    ]
  },
  {
    theme: "Общественная устойчивость",
    background: "linear-gradient(135deg, #06182d 0%, #27304e 54%, #8a2630 100%)",
    description: "Противодействие экстремизму включает профилактику радикализации, выявление деструктивной пропаганды и снижение рисков вовлечения граждан в незаконные действия. Особое внимание уделяется онлайн-среде, молодежи и манипулятивному контенту.",
    slides: [
      ["Задача", "Противодействовать экстремистской пропаганде, радикализации и незаконным деструктивным материалам."],
      ["Фокус", "Онлайн-пропаганда, вовлечение молодежи, манипуляции, призывы к незаконным действиям."],
      ["Инструменты", "Профилактика, аналитика открытых источников, разъяснительные материалы и взаимодействие с обществом."],
      ["Гражданам", "Не репостите радикальные материалы и сообщайте об опасном контенте через официальные каналы."]
    ]
  },
  {
    theme: "Экономическая стабильность",
    background: "linear-gradient(135deg, #06182d 0%, #24415f 54%, #99731d 100%)",
    description: "Экономическая безопасность связана с выявлением угроз стратегическим секторам, финансовой устойчивости и национальным интересам. Направление помогает предотвращать схемы, которые могут повлиять на критические объекты, ресурсы и устойчивость государства.",
    slides: [
      ["Задача", "Выявлять угрозы экономической устойчивости, национальным интересам и критическим секторам."],
      ["Фокус", "Финансовые схемы, риски для стратегических объектов, незаконное влияние и трансграничные угрозы."],
      ["Инструменты", "Аналитика рисков, взаимодействие с ведомствами, проверка информации и правовые механизмы."],
      ["Гражданам", "Проверяйте деловые предложения, не передавайте персональные данные и доверяйте официальным предупреждениям."]
    ]
  }
];

export default async function ActivitiesOverviewPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <section className="relative min-h-[82vh] overflow-hidden bg-[#06182d] text-white">
        <div className="security-grid absolute inset-0 opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(0,169,155,0.35),transparent_28rem),radial-gradient(circle_at_82%_10%,rgba(248,177,51,0.18),transparent_26rem)]" />
        <Container className="relative grid min-h-[82vh] items-center gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">Направления деятельности</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">Вертикальная карта направлений деятельности КНБ</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">Скролл проведет по направлениям сверху вниз. Внутри каждого блока есть горизонтальная лента: листайте ее, чтобы увидеть задачи, фокус, инструменты и рекомендации.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="#counter-terrorism" variant="gold">Начать скролл</Button>
              <Button href="#activity-game" variant="ghost"><Gamepad2 className="h-4 w-4" /> К игре</Button>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/14 bg-white/[0.08] p-6 shadow-premium backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(0,169,155,0.22),transparent_18rem)]" />
              <div className="relative flex items-center justify-between gap-6">
                <KnbEmblem className="h-20 w-20" />
                <div className="text-right">
                  <p className="text-sm uppercase tracking-wide text-state-gold">8 направлений</p>
                  <p className="mt-1 text-2xl font-bold">Единая система безопасности</p>
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
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-state-gold">Описание</p>
                      <p className="mt-2 text-xs leading-6 text-white/72 md:text-sm">{detail.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/16" href={`/${locale}/activities/${activity.slug}`}>
                        Открыть карточку <ArrowRight className="h-4 w-4" />
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
            <Badge className="border-white/15 bg-white/10 text-state-gold">Интерактив</Badge>
            <h2 className="mt-4 text-4xl font-bold">Понять направления через игру</h2>
            <p className="mt-4 max-w-2xl text-white/70">Кнопка оставлена в конце страницы как точка входа для будущей обучающей игры по направлениям деятельности.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15" type="button">
            <Gamepad2 className="h-5 w-5 text-state-gold" />
            Сыграть
          </button>
        </Container>
      </section>
    </>
  );
}
