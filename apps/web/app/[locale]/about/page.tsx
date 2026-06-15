import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/i18n";

type Leader = {
  name: string;
  role: string;
  image: string;
};

type TextItem = {
  title: string;
  text: string;
  image?: string;
};

type HistoryItem = {
  date: string;
  text: string;
};

const leadership: Leader[] = [
  {
    name: "Сагимбаев Ермек Алдабергенович",
    role: "Председатель Комитета национальной безопасности РК, генерал-лейтенант национальной безопасности",
    image: "/about/leadership/sagimbayev-ermek.jpg"
  },
  {
    name: "Алтынбаев Али Сапаргалиевич",
    role: "Первый заместитель Председателя КНБ, генерал-майор национальной безопасности",
    image: "/about/leadership/altynbayev-ali.jpg"
  },
  {
    name: "Тулеуов Асхат Калмагамбетович",
    role: "Заместитель Председателя КНБ РК, генерал-майор национальной безопасности",
    image: "/about/leadership/tuleuov-askhat.jpg"
  },
  {
    name: "Рахымбердиев Бакытбек Толешевич",
    role: "Заместитель Председателя КНБ, генерал-майор национальной безопасности",
    image: "/about/leadership/rakhymberdiyev-bakytbek.jpg"
  },
  {
    name: "Наймантаев Алмас Тлепбергенович",
    role: "Заместитель Председателя КНБ РК, генерал-майор национальной безопасности",
    image: "/about/leadership/naimantayev-almas.jpg"
  },
  {
    name: "Саркулов Руслан Серикович",
    role: "Заместитель Председателя КНБ РК, генерал-майор национальной безопасности",
    image: "/about/leadership/sarkulov-ruslan.jpg"
  },
  {
    name: "Ирменов Марат Гатауллович",
    role: "Заместитель Председателя КНБ РК, генерал-майор национальной безопасности",
    image: "/about/leadership/irmenov-marat.jpg"
  },
  {
    name: "Жумабаев Марат Кабиденович",
    role: "Заместитель Председателя КНБ РК - Директор Службы внешней разведки, генерал-майор национальной безопасности",
    image: "/about/leadership/zhumabayev-marat.jpg"
  },
  {
    name: "Кунанбаев Берик Садыкович",
    role: "Заместитель Председателя КНБ РК - Директор Службы специального назначения «А», генерал-майор национальной безопасности",
    image: "/about/leadership/kunanbayev-berik.jpg"
  },
  {
    name: "Алдажұманов Ерлан Ерғалиұлы",
    role: "Заместитель Председателя КНБ РК - Директор Пограничной службы, генерал-майор",
    image: "/about/leadership/aldazhumanov-erlan.jpg"
  }
];

const copy = {
  ru: {
    eyebrow: "О КНБ РК",
    title: "Комитет национальной безопасности Республики Казахстан",
    description:
      "КНБ РК осуществляет руководство единой системой органов национальной безопасности, выполняет задачи разведки, контрразведки, оперативно-розыскной деятельности, охраны Государственной границы, правительственной связи, специальных подразделений и защиты государственных секретов.",
    historyTitle: "История",
    historyItems: [
      {
        date: "19 декабря 1991",
        text: "Спустя 3 дня после принятия Конституционного Закона о государственной независимости Республики Казахстан Кабинет Министров РК, руководствуясь Декларацией о государственном суверенитете Казахской Советской Социалистической Республики, принял постановление «О Комитете государственной безопасности Республики Казахстан», в котором говорилось, что Комитет государственной безопасности Республики Казахстан признаётся правопреемником союзно-республиканского органа управления КГБ СССР."
      },
      {
        date: "20 июня 1992",
        text: "Постановлением Верховного Совета РК введён в действие подписанный Президентом Республики Казахстан «Закон Об органах национальной безопасности Республики Казахстан»."
      },
      {
        date: "13 июля 1992",
        text: "Президент Республики Казахстан Нурсултан Назарбаев подписал Указ № 844 «О преобразовании Комитета государственной безопасности Республики Казахстан». Этот день считается днём рождения КНБ и ежегодно отмечается его работниками."
      },
      {
        date: "17 мая 2022",
        text: "Президент Республики Казахстан подписал Указ о реформировании структуры КНБ и утверждении нового Положения о Комитете, нормы которого подверглись существенной переработке в связи с новыми угрозами национальной безопасности."
      }
    ],
    symbolsTitle: "Символика",
    emblemTitle: "Эмблема органов национальной безопасности",
    emblemDescription:
      "Большой круглый щит символизирует надежную защиту и обеспечение безопасности страны от внешней угрозы. Бирюзово-голубое центральное поле означает чистое мирное небо, васильково-синяя окружность - честь, верность и принадлежность к органам безопасности. Двойная семиконечная звезда объединяет красный цвет надежды и золотое основание веры; число лучей отсылает к священному для казахского народа числу 7. В центре малого щита расположен шанырак, отражающий общность целей и ценностей народа с органами национальной безопасности, а по окружности малого щита нанесен девиз органов национальной безопасности.",
    flagTitle: "Флаг органов национальной безопасности",
    flagDescription:
      "Флаг представляет собой прямоугольное полотнище василькового синего цвета с соотношением сторон 2:3. В центре размещено золотистое трафаретное изображение основных элементов эмблемы: стилизованная семиконечная звезда, малый щит и шанырак.",
    mottoTitle: "Девиз органов национальной безопасности",
    mottoKk: "Намыс. Айбын. Отан",
    mottoRu: "Честь. Доблесть. Отечество",
    structureTitle: "Руководство",
    chairmanLabel: "Председатель",
    deputiesLabel: "Заместители Председателя",
    servicesTitle: "Службы",
    servicesDescription:
      "Службы закрывают ключевые функциональные направления КНБ: границу, защищенную связь, специальные задачи, внешнюю разведку и авиационное обеспечение.",
    services: [
      {
        title: "Пограничная служба КНБ",
        text: "Организует охрану и защиту Государственной границы Республики Казахстан.",
        image: "/about/services/border-service.webp"
      },
      {
        title: "Служба правительственной связи КНБ",
        text: "Обеспечивает специальные и защищенные коммуникации для государственных органов.",
        image: "/about/services/government-communications.webp"
      },
      {
        title: "Служба специального назначения «А» КНБ",
        text: "Выполняет специальные задачи в пределах компетенции органов национальной безопасности.",
        image: "/about/services/special-purpose-a.webp"
      },
      {
        title: "Служба внешней разведки КНБ",
        text: "Работает по направлению внешней разведки в интересах Республики Казахстан.",
        image: "/about/services/foreign-intelligence.webp"
      },
      {
        title: "Авиационная служба КНБ",
        text: "Обеспечивает авиационную поддержку задач системы органов национальной безопасности.",
        image: "/about/services/aviation-service.webp"
      }
    ],
    schoolsTitle: "Учебные заведения",
    schoolsDescription: "Подготовка кадров для системы органов национальной безопасности ведется в профильных ведомственных учебных заведениях.",
    schools: [
      {
        title: "Академия КНБ Республики Казахстан",
        text: "Ведомственное учебное заведение для подготовки кадров органов национальной безопасности.",
        href: "knb-academy",
        image: "/education/knb-academy-emblem.png"
      },
      {
        title: "Пограничная академия КНБ Республики Казахстан",
        text: "Учебное заведение для подготовки специалистов по направлениям Пограничной службы.",
        href: "border-academy",
        image: "/education/border-academy-emblem.png"
      }
    ],
    go: "Подробнее"
  },
  kk: {
    eyebrow: "ҚР ҰҚК туралы",
    title: "Қазақстан Республикасының Ұлттық қауіпсіздік комитеті",
    description:
      "ҚР ҰҚК ұлттық қауіпсіздік органдарының біртұтас жүйесіне басшылық жасайды, барлау, қарсы барлау, жедел-іздестіру қызметі, Мемлекеттік шекараны қорғау, үкіметтік байланыс, арнайы бөлімшелер және мемлекеттік құпияларды қорғау бағыттарындағы міндеттерді орындайды.",
    historyTitle: "Тарихы",
    historyItems: [
      {
        date: "1991 жылғы 19 желтоқсан",
        text: "Қазақстан Республикасының мемлекеттік тәуелсіздігі туралы Конституциялық заң қабылданғаннан кейін үш күн өткен соң Қазақстан Республикасының Мемлекеттік қауіпсіздік комитеті құрылды."
      },
      {
        date: "1992 жылғы 20 маусым",
        text: "«Қазақстан Республикасының ұлттық қауіпсіздік органдары туралы» Заң қолданысқа енгізілді."
      },
      {
        date: "1992 жылғы 13 шілде",
        text: "Президент Қазақстан Республикасының Мемлекеттік қауіпсіздік комитетін қайта құру туралы Жарлыққа қол қойды. Бұл күн ҰҚК-нің туған күні болып саналады."
      }
    ],
    symbolsTitle: "Рәміздер",
    emblemTitle: "Ұлттық қауіпсіздік органдарының эмблемасы",
    emblemDescription:
      "Үлкен дөңгелек қалқан елді сыртқы қатерден сенімді қорғауды және қауіпсіздікті қамтамасыз етуді білдіреді. Көгілдір орталық алаң - ашық бейбіт аспанның, ал көк түсті шеңбер - ар-намыс, адалдық және қауіпсіздік органдарына тиесіліліктің белгісі. Қос жеті қырлы жұлдыз үмітті білдіретін қызыл түсті және сенімді білдіретін алтын негізді біріктіреді; жеті сәуле қазақ халқы үшін қасиетті 7 санына құрмет көрсетеді. Кіші қалқанның ортасындағы шаңырақ халық пен ұлттық қауіпсіздік органдарының ортақ мақсаттары мен құндылықтарын бейнелейді, ал кіші қалқанның шеңберіне ұлттық қауіпсіздік органдарының ұраны жазылған.",
    flagTitle: "Ұлттық қауіпсіздік органдарының туы",
    flagDescription:
      "Ту 2:3 арақатынастағы көк түсті тікбұрышты полотнище түрінде берілген. Ортасында эмблеманың негізгі элементтерінің алтын түсті трафареттік бейнесі орналасқан: стильдендірілген жеті қырлы жұлдыз, кіші қалқан және шаңырақ.",
    mottoTitle: "Ұлттық қауіпсіздік органдарының ұраны",
    mottoKk: "Намыс. Айбын. Отан",
    mottoRu: "Честь. Доблесть. Отечество",
    structureTitle: "Басшылық",
    chairmanLabel: "Төраға",
    deputiesLabel: "Төрағаның орынбасарлары",
    servicesTitle: "Қызметтер",
    servicesDescription:
      "Қызметтер ҰҚК-нің негізгі функционалдық бағыттарын қамтиды: шекара, қорғалған байланыс, арнайы міндеттер, сыртқы барлау және авиациялық қамтамасыз ету.",
    services: [
      {
        title: "ҰҚК Шекара қызметі",
        text: "Қазақстан Республикасының Мемлекеттік шекарасын қорғау мен күзетуді ұйымдастырады.",
        image: "/about/services/border-service.webp"
      },
      {
        title: "ҰҚК Үкіметтік байланыс қызметі",
        text: "Мемлекеттік органдар үшін арнайы және қорғалған коммуникацияларды қамтамасыз етеді.",
        image: "/about/services/government-communications.webp"
      },
      {
        title: "ҰҚК «А» арнайы мақсаттағы қызметі",
        text: "Ұлттық қауіпсіздік органдарының құзыреті шегінде арнайы міндеттерді орындайды.",
        image: "/about/services/special-purpose-a.webp"
      },
      {
        title: "ҰҚК Сыртқы барлау қызметі",
        text: "Қазақстан Республикасының мүддесі үшін сыртқы барлау бағыты бойынша жұмыс істейді.",
        image: "/about/services/foreign-intelligence.webp"
      },
      {
        title: "ҰҚК Авиациялық қызметі",
        text: "Ұлттық қауіпсіздік органдары жүйесінің міндеттерін авиациялық қамтамасыз етеді.",
        image: "/about/services/aviation-service.webp"
      }
    ],
    schoolsTitle: "Оқу орындары",
    schoolsDescription: "Ұлттық қауіпсіздік органдары жүйесіне кадр даярлау бейінді ведомстволық оқу орындарында жүргізіледі.",
    schools: [
      {
        title: "Қазақстан Республикасы ҰҚК Академиясы",
        text: "Ұлттық қауіпсіздік органдары үшін кадр даярлайтын ведомстволық оқу орны.",
        href: "knb-academy",
        image: "/education/knb-academy-emblem.png"
      },
      {
        title: "Қазақстан Республикасы ҰҚК Шекара академиясы",
        text: "Шекара қызметі бағыттары бойынша мамандар даярлайтын оқу орны.",
        href: "border-academy",
        image: "/education/border-academy-emblem.png"
      }
    ],
    go: "Толығырақ"
  }
};

function LeaderCard({ leader, large = false }: { leader: Leader; large?: boolean }) {
  return (
    <PremiumCard className={large ? "mx-auto grid max-w-5xl gap-6 rounded-2xl p-5 md:grid-cols-[13rem_1fr] md:p-6" : "h-full rounded-2xl p-5"}>
      <img
        src={leader.image}
        alt={leader.name}
        className="mx-auto aspect-square w-full max-w-52 rounded-xl object-cover"
      />
      <div className={large ? "self-center" : "mt-4"}>
        <h3 className={large ? "text-2xl font-bold leading-tight text-state-navy md:text-3xl" : "text-xl font-bold leading-tight text-state-navy"}>{leader.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{leader.role}</p>
      </div>
    </PremiumCard>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = copy[locale];
  const historyItems = t.historyItems as HistoryItem[];
  const services = t.services as TextItem[];
  const schools = t.schools as Array<TextItem & { href: string; image: string }>;
  const [chairman, ...deputies] = leadership;

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_25rem),radial-gradient(circle_at_80%_60%,rgba(214,168,58,0.22),transparent_24rem)]" />
        <Container className="relative py-20 md:py-24">
          <Reveal>
            <Badge className="border-white/20 bg-white/10 text-state-gold backdrop-blur">{t.eyebrow}</Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-tight md:text-7xl">{t.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/[0.78]">{t.description}</p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-state-surface py-14 md:py-16">
        <Container>
          <Reveal>
            <div>
              <h2 className="text-center text-3xl font-bold leading-tight text-state-navy md:text-5xl">{t.historyTitle}</h2>
              <div className="mt-8 space-y-4">
                {historyItems.map((item) => (
                  <div key={item.date} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[14rem_1fr] md:gap-8 md:p-6">
                    <div className="text-lg font-bold leading-tight text-state-tealDark md:text-xl">{item.date}</div>
                    <p className="text-lg leading-8 text-slate-700 md:text-xl md:leading-9">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold leading-tight text-state-navy md:text-5xl">{t.symbolsTitle}</h2>
            </div>
          </Reveal>

          <div className="mt-10 space-y-6">
            <Reveal>
              <article className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[18rem_1fr] md:items-center md:p-8 lg:grid-cols-[22rem_1fr]">
                <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-50 p-8">
                  <img
                    src="/about/symbols/emblem.png"
                    alt={t.emblemTitle}
                    className="h-auto w-full max-w-64 object-contain md:max-w-72"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight text-state-navy">{t.emblemTitle}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{t.emblemDescription}</p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.08}>
              <article className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[18rem_1fr] md:items-center md:p-8 lg:grid-cols-[22rem_1fr]">
                <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-50 p-4">
                  <img
                    src="/about/symbols/flag.jpg"
                    alt={t.flagTitle}
                    className="aspect-[3/2] w-full max-w-sm rounded-lg object-cover shadow-md"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight text-state-navy">{t.flagTitle}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{t.flagDescription}</p>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-6 rounded-2xl bg-state-navy px-6 py-8 text-center text-white shadow-elevated md:px-10 md:py-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-gold">{t.mottoTitle}</p>
              <p className="mt-5 text-3xl font-bold leading-tight md:text-5xl">{t.mottoKk}</p>
              <p className="mt-3 text-xl font-semibold leading-tight text-white/82 md:text-3xl">{t.mottoRu}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-state-surface py-16 md:py-20">
        <Container>
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold leading-tight text-state-navy md:text-5xl">{t.structureTitle}</h2>
            </div>
          </Reveal>

          <div className="mt-12">
            <h3 className="mb-4 text-2xl font-bold text-state-navy">{t.chairmanLabel}</h3>
            <Reveal>
              <LeaderCard leader={chairman} large />
            </Reveal>
          </div>

          <div className="mt-12">
            <h3 className="mb-5 text-2xl font-bold text-state-navy">{t.deputiesLabel}</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {deputies.map((leader) => (
                <Reveal key={leader.name}>
                  <LeaderCard leader={leader} />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold leading-tight text-state-navy md:text-5xl">{t.servicesTitle}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">{t.servicesDescription}</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <Reveal
                key={service.title}
                className={index === services.length - 1 ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]" : ""}
              >
                <div className="relative min-h-[19rem] overflow-hidden rounded-2xl border border-white/10 bg-state-navy shadow-elevated">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,22,45,0.96)_0%,rgba(7,22,45,0.84)_34%,rgba(7,22,45,0.42)_68%,rgba(7,22,45,0.2)_100%)]" />
                  <div className="relative flex min-h-[19rem] items-start p-6 md:p-8">
                    <div className="max-w-md">
                      <h3 className="text-2xl font-bold leading-tight text-white md:text-3xl">{service.title}</h3>
                      <p className="mt-4 text-sm leading-6 text-white md:text-base md:leading-7">{service.text}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold leading-tight text-state-navy md:text-5xl">{t.schoolsTitle}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">{t.schoolsDescription}</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {schools.map((school) => (
              <Reveal key={school.title}>
                <Link href={`/${locale}/education/${school.href}`} className="block h-full">
                  <PremiumCard className="h-full rounded-2xl">
                    <span className="flex h-36 w-36 items-center justify-center">
                      <img src={school.image} alt="" className="h-full w-full object-contain" />
                    </span>
                    <h3 className="mt-5 text-2xl font-bold text-state-navy">{school.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{school.text}</p>
                    <span className="mt-6 inline-flex text-sm font-semibold text-state-tealDark">{t.go}</span>
                  </PremiumCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
