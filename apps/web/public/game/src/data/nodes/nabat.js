window.NODES_NABAT = {
  // ------------------------------------------------------------------
  // ПРОЛОГ
  // ------------------------------------------------------------------
  nb_intro: {
    id: "nb_intro",
    background: "assets/nabat/webp/bg_train_interior.webp", // Промпт: Interior view of a destroyed compartment...
    phase: "Операция «Набат» · Пролог",
    progress: "Эпизод 1 / 6",
    lines: [
      {
        speaker: "narrator",
        text: "Февраль 1992 года. Поезд «Москва—Ташкент». Во время этапирования особо опасные рецидивисты атакуют конвоиров заточками.",
      },
    ],
    next: "nb_raid",
  },

  nb_raid: {
    id: "nb_raid",
    background: "assets/nabat/webp/bg_bus.webp", // Промпт: Interior view of a destroyed compartment...
    phase: "Операция «Набат» · Пролог",
    progress: "Эпизод 1 / 6",
    lines: [
      {
        speaker: "narrator",
        text: "Завладев оружием, они вырываются на свободу и захватывают рейсовый автобус «Икарус» с пассажирами на трассе.",
      },
    ],
    next: "nb_unsuccess",
  },

  nb_unsuccess: {
    id: "nb_unsuccess",
    background: "assets/nabat/webp/bg_shoot.webp", // Промпт: Interior view of a destroyed compartment...
    phase: "Операция «Набат» · Пролог",
    progress: "Эпизод 1 / 6",
    lines: [
      {
        speaker: "narrator",
        text: "После неудачной попытки перехвата милицией, преступники озверели. Теперь это террористы, и они требуют самолет.",
      },
    ],
    next: "nb_office",
  },

  // ------------------------------------------------------------------
  // АКТ 1: КАБИНЕТ И РЕШЕНИЕ
  // ------------------------------------------------------------------
  nb_office: {
    id: "nb_office",
    background: "assets/nabat/webp/bg_office.webp", // Промпт: Interior of a Soviet-era government office...
    phase: "КНБ · Штаб · Начало",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "narrator",
        text: "Тем временем у нашего героя проходит обычное дежурство, когда вдруг...",
      },
    ],
    next: "nb_office_call",
  },

  nb_office_call: {
    id: "nb_office_call",
    background: "assets/nabat/webp/bg_office_call.webp", // Промпт: Interior of a Soviet-era government office...
    phase: "КНБ · Штаб · Начало",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "narrator",
        text: "*Громкий, резкий звонок телефона оперативной связи*",
      },
    ],
    next: "nb_office2",
  },

  nb_office2: {
    id: "nb_office2",
    background: "assets/nabat/webp/bg_office_call.webp", // Промпт: Interior of a Soviet-era government office...
    phase: "КНБ · Штаб · Начало",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "- Дежурный по управлению, Капитан Омаров, слушаю",
      },
      {
        speaker: "call",
        text: "- Капитан, срочное донесение. Группа рецидивистов, которых перевозили в специальном вагоне выбрались на свободу.",
      },
      {
        speaker: "zhandos",
        text: "- Что?! Как это произошло?!",
      },
      {
        speaker: "call",
        text: "- Это не все, они захватили автобус. Требуют самолет и валюту. Грозят расстрелом заложников.",
      },
      {
        speaker: "zhandos",
        text: "- Успокойтесь. Говорите четко. Какой автобус? Сколько их? Куда направляются?",
      },
      {
        speaker: "call",
        text: "- Рейсовый «Икарус», Кызылорда — Сарыагаш. Пятеро рецидивистов. Вооружены! У них заложники, Капитан... там женщины и дети.",
      },
      {
        speaker: "zhandos",
        text: "- Принято! Немедленно доложусь об этом",
      },
    ],
    next: "nb_general_corridor",
  },

  nb_general_corridor: {
    id: "nb_general_corridor",
    background: "assets/nabat/webp/bg_office_corridor.webp",
    phase: "КНБ · Штаб · Доклад генералу",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "(мысли): Мне нужно доложить начальству. От того, как я это сделаю, зависит начало операции.",
      },
    ],
    choices: [
      {
        label: "Ворваться и кричать: «Товарищ полковник, там террористы! Всех убьют!",
        note: "Эмоциональный подход. Быстрая реакция, но выглядит как паника.",
        next: "nb_general_report1",
        effects: { tension: -10, confidence: +5, trust: -10 },
      },
      {
        label: "Доложить по форме: «Товарищ полковник, ЧП. Захвачен автобус. Жду приказов.",
        note: "Профессиональный подход. Повышает авторитет.",
        next: "nb_general_report",
        effects: { tension: +10, trust: +10 },
      },
    ],
  },

  nb_general_report1: {
    id: "nb_general_report1",
    background: "assets/nabat/webp/bg_general_office.webp",
    phase: "КНБ · Штаб · Доклад генералу",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "- Товарищ полковник, там террористы! Всех убьют! И там дети, и...",
      },
      {
        speaker: "commander",
        text: "- Капитан, отставить! Мне уже доложили, Президент тоже в курсе.",
      },
      {
        speaker: "commander",
        text: "- Я и так на нервах, не разводи панику! Одно меня волнует сейчас. В Кызылорде мы не сможем подготовить качественный штурм.",
      },
      {
        speaker: "commander",
        text: "- Нам нужно выиграть время и заманить их в удобное место. Что думаешь?",
      },
    ],
    choices: [
      {
        label: "«Скажем что такую сумму денег мы не соберем здесь и пусть отправляются в Шымкент»",
        note: "Рискованно, бандиты на взводе могут не поверить.",
        next: "nb_choice_truth",
        effects: { tension: -5, trust: -5 },
      },
      {
        label: "«Скажем, что международный рейс возможен только из Шымкента»",
        note: "Даст нам выигрыш во времени и перенаправит автобус куда нам нужно.",
        next: "nb_choice_trick",
        effects: { speed: +10, confidence: +10, trust: +5 },
      },
    ],
  },

  nb_general_report: {
    id: "nb_general_report",
    background: "assets/nabat/webp/bg_general_office.webp",
    phase: "КНБ · Штаб · Доклад генералу",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "- Товарищ полковник, группа рецедивистов сбежала из специального вагона и захватила рейсовый автобус Икарус, направляются в Кызылорду",
      },
      {
        speaker: "commander",
        text: "- Капитан, ситуация критическая, удивлен что ты так спокоен. Мне уже доложили, и Президент в курсе.",
      },
      {
        speaker: "commander",
        text: "- В Кызылорде мы не сможем подготовить качественный штурм.",
      },
      {
        speaker: "commander",
        text: "- Нам нужно выиграть время и заманить их в удобное место. Твои предложения?",
      },
    ],
    choices: [
      {
        label: "«Скажем что такую сумму денег мы не соберем здесь и пусть отправляются в Шымкент»",
        note: "Рискованно, бандиты на взводе могут не поверить.",
        next: "nb_choice_truth",
        effects: { tension: -5, trust: -5 },
      },
      {
        label: "«Скажем, что международный рейс возможен только из Шымкента»",
        note: "Даст нам выигрыш во времени и перенаправит автобус куда нам нужно.",
        next: "nb_choice_trick",
        effects: { speed: +10, confidence: +10, trust: +5 },
      },
    ],
  },

  nb_choice_truth: {
    id: "nb_choice_truth",
    background: "assets/nabat/webp/bg_safe.webp",
    phase: "КНБ · Штаб · Решение",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "- Скажем что требуемую сумму мы не сможем собрать здесь и нужно ехать в Шымкент",
      },
      {
        speaker: "commander",
        text: "- Логично, хотя они могут потребовать просто все деньги что есть здесь. Ладно, попробуем убедить их лететь в Шымкент.",
      },
    ],
    next: "nb_choice_truth2",
  },

  nb_choice_truth2: {
    id: "nb_choice_truth2",
    background: "assets/nabat/webp/bf_general_exit.webp",
    phase: "КНБ · Штаб · Решение",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "commander",
        text: "- Вылетай на место. Ты координируешь операцию. Свяжись с сопровождением. Будь со мной на связи.",
      },
    ],
    next: "nb2_highway_scene",
  },

  nb_choice_trick: {
    id: "nb_choice_trick",
    background: "assets/nabat/webp/bg_safe.webp",
    phase: "КНБ · Штаб · Решение",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "zhandos",
        text: "- Скажем что международные рейсы летают только с Шымкента и чтобы они направлялись туда!",
      },
      {
        speaker: "commander",
        text: "- Именно. Это даст нам драгоценные часы на подготовку встречи в Шымкенте. Действуй.",
      },
      {
        speaker: "zhandos",
        text: "- Есть.",
      },
    ],
    next: "nb_choice_trick2",
  },

  nb_choice_trick2: {
    id: "nb_choice_trick2",
    background: "assets/nabat/webp/bf_general_exit.webp",
    phase: "КНБ · Штаб · Решение",
    progress: "Эпизод 2 / 6",
    lines: [
      {
        speaker: "commander",
        text: "- Группа захвата уже выдвигается. Ты координируешь на месте. Свяжись с сопровождением. Держи связь со мной напрямую.",
      },
      {
        speaker: "commander",
        text: "- Я тоже выдвигаюсь.",
      },
      {
        speaker: "zhandos",
        text: "- Есть.",
      },
    ],
    next: "nb2_highway_scene",
  },

  // ------------------------------------------------------------------
  // АКТ 2: АЭРОПОРТ И ПОДГОТОВКА
  // ------------------------------------------------------------------

  nb2_highway_scene: {
    id: "nb2_highway_scene",
    background: "assets/nabat/webp/bg_car_interior_night.webp", // Промпт: First-person view from inside a Soviet car driving on a dark highway...
    phase: "Трасса · Преследование",
    progress: "Сцена 3 / 5",
    lines: [
      {
        speaker: "negotiator",
        text: "- Капитан, это сопровождение. Мы едем по трассе, пока все спокойно.",
      },
      {
        speaker: "zhandos",
        text: "- Принято, я выдвигаюсь в аэропорт, держим связь!",
      },
      {
        speaker: "negotiator",
        text: "(мысли): Мы едем уже семь часов. Нервы на пределе.",
      },
    ],
    next: "nb2_gas_station",
  },

  nb2_gas_station: {
    id: "nb2_gas_station",
    background: "assets/nabat/webp/bg_gas_station.webp", // Промпт: Background illustration of a lonely, dilapidated Soviet gas station...
    phase: "Трасса · Остановка",
    progress: "Сцена 3 / 5",
    lines: [
      {
        speaker: "narrator",
        text: "Автобус сворачивает к заправке.",
      },
      {
        speaker: "terrorist",
        text: "Солярку! И жрать! Быстро, или я начну стрелять!",
        sprite: "assets/nabat/webp/spr_kaisar_yelling.webp"
      },
      {
        speaker: "negotiator",
        text: "Капитан, они свернули на заправку требуют топливо и еды. Как действуем?",
      },
    ],
    choices: [
      {
        label: "Рискнуть: Сказать оперативнику переодеться заправщиком и подойти самому",
        note: "Позволит увидеть схему салона, но высокий риск.",
        next: "nb2_gas_outcome_risk",
        effects: { tension: -10, trust: -10, intel_collected: true }, // Логика проверки успеха (trust > 0) реализуется в движке
      },
      {
        label: "Использовать мегафон издалека и выполнить условия как они требуют",
        note: "Успокоит бандитов, но мы не узнаем деталей внутри.",
        next: "nb2_gas_outcome_safe",
        effects: { trust: +10, tension: +10, intel_collected: false },
      },
    ],
  },

  nb2_gas_outcome_risk: { // Вставка результата риска
    id: "nb2_gas_outcome_risk",
    background: "assets/nabat/webp/bg_bus_door_view.webp", // Вид на дверь
    phase: "Трасса · Разведка",
    progress: "Сцена 3 / 5",
    lines: [
      {
        speaker: "narrator",
        text: "Сотрудник подошел к двери чтобы передать еду. Когда двери открылись он успел разглядеть ситуацию внутри.",
      },
      {
        speaker: "narrator",
        text: "Данные собраны. Автобус уезжает.",
      },

    ],
    next: "nb2_airport_arrival",
  },

  nb2_gas_outcome_safe: { // Вставка безопасного исхода
    id: "nb2_gas_outcome_safe",
    background: "assets/nabat/webp/bg_gas_station.webp",
    phase: "Трасса · Переговоры",
    progress: "Сцена 3 / 5",
    lines: [
      {
        speaker: "narrator",
        text: "Бандиты успокоились. Автобус заправлен и уезжает.",
      },
    ],
    next: "nb2_airport_arrival",
  },

  // ------------------------------------------------------------------
  // АКТ 2: АЭРОПОРТ И ПОДГОТОВКА
  // ------------------------------------------------------------------
  nb2_airport_arrival: {
    id: "nb2_airport_arrival",
    background: "assets/nabat/webp/bg_airport_dawn.webp", // Промпт: Background illustration of an airport tarmac at dawn...
    phase: "Шымкент · Аэропорт",
    progress: "Сцена 4 / 5",
    lines: [
      {
        speaker: "teammate",
        text: "Капитан, мои ребята всю ночь тренировались на таком же автобусе. Мы готовы к штурму. Знаем каждый винтик.",
      },
      {
        speaker: "zhandos",
        text: "Каков план?",
      },
    ],
    next: "nb2_airport_arrival2",
  },

  nb2_airport_arrival2: {
    id: "nb2_airport_arrival2",
    background: "assets/nabat/webp/bg_kamaz.webp", // Промпт: Background illustration of an airport tarmac at dawn...
    phase: "Шымкент · Аэропорт",
    progress: "Сцена 4 / 5",
    lines: [
      {
        speaker: "teammate",
        text: "На готове стоит машина. Она столкнется с автобусом чтобы остановить его.",
      },
      {
        speaker: "teammate",
        text: "Дальше наши ребята из Отдела А возьмут все на себя.",
      },
      {
        speaker: "zhandos",
        text: "А если автобус все таки прорвется на полосу?",
      },
    ],
    next: "nb2_airport_arrival3",
  },

  nb2_airport_arrival3: {
    id: "nb2_airport_arrival",
    background: "assets/nabat/webp/bg_plane.webp", // Промпт: Background illustration of an airport tarmac at dawn...
    phase: "Шымкент · Аэропорт",
    progress: "Сцена 4 / 5",
    lines: [
      {
        speaker: "teammate",
        text: "Тогда план «Б». Штурм внутри самолета. Мы уже подготовили своих людей которые выдадут себя за сотрудников экипажа. Но там тесно, риск потерь огромный.",
      },
      {
        speaker: "negotiator",
        text: "Центр, это сопровождение! Объект прошел последний пост. Они нервничают, кажется, что-то подозревают!",
      },
    ],
    next: "nb2_tactical_choice",
  },

  nb2_tactical_choice: {
    id: "nb2_tactical_choice",
    background: "assets/nabat/webp/bg_tactical_map.webp", // Промпт: Top-down close-up view of a tactical planning map...
    phase: "Шымкент · Финальный выбор",
    progress: "Сцена 4 / 5",
    lines: [
      {
        speaker: "teammate",
        text: "Снайперы тоже на позиции, итого у нас три варианта, Капитан. Решать тебе. Автобус подходит к перекрестку.",
      },
    ],
    next: "nb2_tactical_choice2",
  },

  nb2_tactical_choice2: {
    id: "nb2_tactical_choice2",
    background: "assets/nabat/webp/bg_tactical_map.webp", // Промпт: Top-down close-up view of a tactical planning map...
    phase: "Шымкент · Финальный выбор",
    progress: "Сцена 4 / 5",
    lines: [
      {
        speaker: "system",
        text: "ВЫБЕРИТЕ ТАКТИКУ ШТУРМА",
      },
    ],
    choices: [
      {
        label: "Снайперский выстрел",
        note: "Высокий риск.",
        next: "nb2_ending_fail_sniper",
        effects: { trust: -10, tension: -10, speed: -10, outcome: "fail" },
      },
      {
        label: "Засада в Самолете",
        note: "Нет гарантий, может затянуть операцию и вызвать потери.",
        next: "nb2_ending_plane_ambush",
        effects: { trust: -10, tension: -10, confidence: +10, outcome: "neutral" },
      },
      {
        label: "Штурм автобуса",
        note: "Требует идеального момента.",
        next: "nb2_ending_truck_ram",
        effects: { trust: +10, speed: +10, confidence: +5, outcome: "success_check" }, // Здесь можно добавить мини-игру на QTE
      },
    ],
  },

  // ------------------------------------------------------------------
  // СЦЕНА 5: ФИНАЛЫ (РАЗВЯЗКА)
  // ------------------------------------------------------------------

  // Ветка А: Снайпер (Плохая концовка)
  nb2_ending_fail_sniper: {
    id: "nb2_ending_fail_sniper",
    background: "assets/nabat/webp/bg_action_sniper.webp", // Промпт: Action shot of a yellow Ikarus bus windshield shattering...
    phase: "Финал · 1",
    progress: "Исход: Провал",
    lines: [
      {
        speaker: "narrator",
        text: "Выстрел! Водитель убит. Автобус теряет управление и врезается в ограждение.",
      },
      {
        speaker: "narrator",
        text: "В хаосе второй бандит открыл огонь. Террористы уничтожены, но есть раненые среди заложников.",
      },
      {
        speaker: "zhandos",
        text: "Мы победили... но какой ценой?",
      },
    ],
    next: "nb2_ending_fail_sniper2",
  },

  nb2_ending_fail_sniper2: {
    id: "nb2_ending_fail_sniper2",
    background: "assets/common/bg_hq.webp", // Промпт: Action shot of a yellow Ikarus bus windshield shattering...
    phase: "Финал · 1",
    progress: "Исход: Провал",
    ending: true,
    lines: [
      {
        speaker: "curator",
        text:
          "Вы примерили роль сотрудника Отдела «А» и выбрали один из возможных планов. В реальности у группы всегда есть несколько вариантов — попробуйте пройти сценарий ещё раз и исследовать другие развилки.",
      },
    ],
  },

  // Ветка Б: Самолет (Нейтральная концовка)
  nb2_ending_plane_ambush: {
    id: "nb2_ending_plane_ambush",
    background: "assets/nabat/webp/bg_action_plane.webp", // Промпт: Interior action scene inside the massive cargo hold of an IL-76...
    phase: "Финал · Осада",
    progress: "Исход: Несчастный случай внутри",
    lines: [
      {
        speaker: "narrator",
        text: "Автобус заехал в самолет. Рампа закрылась. Группа захвата блокировала выходы.",
      },
      {
        speaker: "narrator",
        text: "Началась операция по захвату нарушителей внутри самолета. Группе было тяжело координировать действия внутри самолета.",
      },
      {
        speaker: "narrator",
        text: "Во время захвата один из террористов выстрелил и пуля попала в гражданского.",
      },
      {
        speaker: "narrator",
        text: "Террористов удалось нейтрализовать, потери минимальны, Но всех волнует один вопрос: можно ли было обойтись вовсе без потерь?...",
      },

    ],
    next: "nb2_ending_plane_ambush2",
  },

  nb2_ending_plane_ambush2: {
    id: "nb2_ending_plane_ambush2",
    background: "assets/common/bg_hq.webp", // Промпт: Action shot of a yellow Ikarus bus windshield shattering...
    phase: "Финал · Осада",
    progress: "Исход: Провал",
    ending: true,
    lines: [
      {
        speaker: "curator",
        text:
          "Тактические решения всегда балансируют риск и время. Вы реализовали один из запасных планов Отдела «А». Попробуйте пройти сценарий снова и узнать другие концовки.",
      },
    ],
  },

  // Ветка В: Таран (Золотая концовка)
  nb2_ending_truck_ram: {
    id: "nb2_ending_truck_ram",
    background: "assets/nabat/webp/bg_action_ram.webp", // Промпт: Dynamic action scene on airport tarmac immediately after a crash...
    phase: "Финал · Легенда",
    progress: "Исход: Триумф",
    lines: [
      {
        speaker: "zhandos",
        text: "НАБАТ! ПОШЕЛ!",
      },
      {
        speaker: "narrator",
        text: "УДАР! КамАЗ врезается лоб-в-лоб, останавливая автобус на месте.",
      },
      {
        speaker: "narrator",
        text: "Спецназ влетает в окна, используя спины товарищей как живую лестницу. 4 секунды. Чистая победа.",
      },
    ],
    next: "nb2_ending_truck_ram2",
  },

  nb2_ending_truck_ram2: {
    id: "nb2_ending_truck_ram2",
    background: "assets/nabat/webp/bg_afterforce.webp", // Промпт: Action shot of a yellow Ikarus bus windshield shattering...
    phase: "Финал · Осада",
    progress: "Исход: Провал",
    lines: [
      {
        speaker: "teammate",
        text: "Ни одной царапины у заложников. Отличная работа! Это войдет в историю.",
      },
      {
        speaker: "zhandos",
        text: "Мы все отлично сработали, считаю это успех!",
      },
    ],
    next: "nb2_ending_truck_ram3",
  },

  nb2_ending_truck_ram3: {
    id: "nb2_ending_truck_ram3",
    background: "assets/common/bg_hq.webp", // Промпт: Action shot of a yellow Ikarus bus windshield shattering...
    phase: "Финал · Осада",
    progress: "Исход: Провал",
    ending: true,
    lines: [
      {
        speaker: "curator",
        text:
          "Так и было в реальной жизни: штурм занял всего четыре секунды — редкий прецедент для подобных операций в мире.",
      },
      {
        speaker: "curator",
        text:
          "Вы примерили роль бойца Отдела «А» и прошли по историческому плану. Попробуйте другие варианты, чтобы увидеть альтернативные развязки.",
      },
    ],
  },
};
