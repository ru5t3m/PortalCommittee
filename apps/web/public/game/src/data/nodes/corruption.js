 window.NODES_CORRUPTION = {

  // Пролог с майором Айтбековым
  cr_kapremont_prologue: {
    id: "cr_kapremont_prologue",
    background: "assets/corruption/1.jpg",
    phase: "Антикоррупция · Капремонт школ · Пролог",
    progress: "Эпизод 1 / 4",
    lines: [
      {
        speaker: "narrator",
        text:
          "Поздний вечер, 23:47. Кабинет 317 в здании Антикоррупционной службы по городу Астана.",
      },
      {
        speaker: "narrator",
        text:
          "Майор Ерлан Айтбеков кладёт на стол тонкую папку. На обложке маркером: «Капремонт школ. Плановая. Без приоритета».",
      },
      {
        speaker: "mentor",
        text:
          "Слушай внимательно, стажёр. Если здесь пустышка — мы просто потеряем неделю. А если есть схема... потеряем нервы, возможно, друзей и, очень вероятно, карьеру.",
      },
      {
        speaker: "mentor",
        text:
          "Здесь нет конвертов с наличкой. Нет камер с 'встречами'. Есть только «правильные» подписи, очень аккуратные цифры и формулировки, от которых юристы мурлыкают. Ты не просто читаешь документы. Ты учишься видеть, как система дышит. Каждое твоё решение будет записано. Не только что ты нашёл, а как ты на это смотрел. Готов?",
      },
    ],
    choices: [
      {
        label: "Готов, майор. Давайте разберёмся.",
        note: "Проявляешь внимательность и готовность собирать разведданные.",
        next: "cr_kapremont_initial",
        effects: { recon: +5, decision: +10 },
      },
      {
        label: "Я вижу перерасход уже на первой странице.",
        note: "Сразу анализируешь цифры и ищешь логические несостыковки.",
        next: "cr_kapremont_initial",
        effects: { analytics: +10 },
      },
      {
        label: "Сделаем быстро, без лишних глаз.",
        note: "Стремишься к оперативному решению и минимальному вниманию посторонних.",
        next: "cr_kapremont_initial",
        effects: { decision: +10, trust: +10, recon: +10 },
      },
    ],
  },

  // Открытие папки и первый серьёзный выбор
  cr_kapremont_initial: {
    id: "cr_kapremont_initial",
    background: "assets/corruption/2.png",
    phase: "Антикоррупция · Капремонт школ",
    progress: "Эпизод 1 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "Ты открываешь папку.",
      },
      {
        speaker: "mentor",
        text:
          "55 миллионов на 12 школ. Из них 12 миллионов — 'неопределённые услуги'. Красиво, да? Стройматериалы — 18 лямов, подрядные работы — 21, логистика — 3,3. А остальное? 'Услуги'. Слово-то какое мягкое.",
      },
      {
        speaker: "narrator",
        text: "Твой первый серьёзный выбор:",
      },
    ],
    choices: [
      {
        label: "Перерасход очевиден. Пишем предварительное заключение.",
        note: "Ты берёшь инициативу и нацелен на ускоренное оформление дела.",
        next: "cr_kapremont_phone_call",
        effects: { decision: +10 },
      },
      {
        label: "Меня интересует, кто именно одобрил эти 'неопределённые услуги'.",
        note: "Фокусируешься на деталях и формальных ответственных.",
        next: "cr_kapremont_phone_call",
        effects: { analytics: +10, trust: -10, recon: +5 },
      },
      {
        label: "Нужно понять, кто в департаменте реально тянул этот проект.",
        note: "Хочешь найти тихие рычаги влияния и понять, кто рулит процессом.",
        next: "cr_kapremont_phone_call",
        effects: { recon: +10, decision: +5, tension: +5},
      },
    ],
  },


  cr_kapremont_phone_call: {
    id: "cr_kapremont_phone_call",
    background: "assets/corruption/4.png",
    phase: "Антикоррупция · Капремонт школ · Звонок",
    progress: "Эпизод 1 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Вы дозваниваетесь до департамента.",
      },
    ],
    next: "cr_kapremont_phone_call2",
  },


  // Звонок в департамент, три варианта разговора
  cr_kapremont_phone_call2: {
    id: "cr_kapremont_phone_call2",
    background: "assets/corruption/5.png",
    phase: "Антикоррупция · Капремонт школ · Звонок",
    progress: "Эпизод 2 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Голос на той стороне дрожит. Это главный бухгалтер — Тимур Аскаров. Он упоминает 44‑й приказ, рост цен на цемент, инфляцию...",
      },
    ],
    choices: [
      {
        label: "Тимур, вы меня по имени назвали. Мы знакомы?",
        note: "Пытаешься установить контакт и получить больше доверия, действуя словно коллега.",
        next: "cr_kapremont_phone_followup",
        effects: { recon: +10, analytics: +5, trust: +5 },
      },
      {
        label: "Пришлите все допсоглашения за 8 месяцев на почту.",
        note: "Запрашиваешь данные, чтобы позже проанализировать возможные аномалии.",
        next: "cr_kapremont_phone_followup",
        effects: { analytics: +10, decision: +5, tension: +5, trust: -10 },
      },
      {
        label: "Явитесь к 14:00 с оригиналами. Кабинет 317.",
        note: "Ставишь жёсткий ультиматум и создаёшь давление для быстрого результата.",
        next: "cr_kapremont_phone_followup",
        effects: { decision: +10, tension: +10, trust: -10, analytics: -10 },
      },
    ],
  },

  cr_kapremont_phone_followup: {
    id: "cr_kapremont_phone_followup",
    background: "assets/corruption/5.png",
    phase: "Антикоррупция · Капремонт школ · После звонка",
    progress: "Эпизод 2 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Тимур вздыхает, обещает прийти. Айтбеков кивает: 'Хорошо начал'.",
      },
    ],
    next: "cr_kapremont_phone_followup2",
  },

  cr_kapremont_phone_followup2: {
    id: "cr_kapremont_phone_followup2",
    background: "assets/corruption/6.png",
    phase: "Антикоррупция · Капремонт школ · После звонка",
    progress: "Эпизод 2 / 10",
    lines: [
      {
        speaker: "mentor",
        text:
          "День второй. Выезжаем на объект и затем к подрядчику. Дорога в Есиль. Снег, радио, заползает в кабину. Тимур молчит."
      },
    ],
    next: "cr_kapremont_day2_school",
  },

  // День 2: школа и подрядчик
  cr_kapremont_day2_school: {
    id: "cr_kapremont_day2_school",
    background: "assets/corruption/7.png",
    phase: "Антикоррупция · Капремонт школ · День 2",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Вы находитесь в школе №47. Директор Гульмира Омарова показывает вам плачевное состояние объекта: потолки текут, в спортзале плесень, дети занимаются в куртках.",
      },
      {
        speaker: "gulmira",
        text:
          "Вот, смотрите. Обещали ремонт до сентября. Уже третий год. Дети в куртках мерзнут, уроки отменяем. А деньги... куда они ушли?",
      },
      {
        speaker: "timur",
        text:
          "Всё по акту. 100% готовность.",
      },
      {
        speaker: "narrator",
        text:
          "Вы задаёте вопрос Тимуру. Его реакция определится вашим выбором.",
      },
    ],
    choices: [
      {
        label: "'Тимур, вы подписали. Знаете последствия?'",
        note: "Давление на бухгалтера, но он может стать союзником.",
        next: "cr_kapremont_office",
        effects: { tension: +10, decision: -5 },
      },
      {
        label: "Гульмира, мы разберёмся. Покажите документы.",
        note: "Попытка успокоить директора и получить бумаги.",
        next: "cr_kapremont_office",
        effects: { trust: +10, decision: +5, tension: -10 },
      },
    ],
  },

  cr_kapremont_office: {
    id: "cr_kapremont_office",
    background: "assets/corruption/9.jpg",
    phase: "Антикоррупция · Капремонт школ · Подрядчик",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Офис ТОО «Строительная Компания». Директор Дамир Сейтжанов встречает вас с улыбкой и предлагает кофе.",
      },
      {
        speaker: "damir",
        text:
          "Проходите. Мы выиграли честно. \n"+
          "Три человека построили 12 школ?\n"+
          "А что, аутсорсинг. Субподрядчики, бригады. Всё легально.",
      },
      {
        speaker: "narrator",
        text:
          "Вы задаёте вопросы, выбирая направление: штаты, история регистрации или связи с департаментом.",
      },
    ],
    choices: [
      {
        label: "Покажите штатное расписание, три человека?",
        note: "Выбираешь открытую, жёсткую линию, проверяя реальное состояние дел.",
        next: "cr_seriy_day2_office_staffing",
        effects: { decision: +5, tension: +5, trust: -5},
      },
      {
        label: "Почему вы зарегистрировались всего за 8 месяцев до тендера?",
        note: "Ищешь логические несостыковки в датах и истории фирмы.",
        next: "cr_seriy_day2_office_history",
        effects: { analytics: +10, recon: +5 },
      },
      {
        label: "Друзья в департаменте помогли?",
        note: "Проверяешь возможные связи и покровительство внутри департамента.",
        next: "cr_seriy_day2_office_friends",
        effects: { recon: +10, trust: +5, tension: -5},
      },
    ],
  },


   // ФОН 9: Штатное расписание
  cr_seriy_day2_office_staffing: {
    id: "cr_seriy_day2_office_staffing",
    background: "assets/corruption/9.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2 · Штат",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "damir",
        text:
          "Штат... ну, формально три. Я, бухгалтер, юрист. Но работы сделаны! Акты подписаны директором школы. Гульмира Омарова сама хвалила!",
      },
      {
        speaker: "player",
        text: "Акты фейковые. Мы были там — плесень по стенам.",
      },
      {
        speaker: "damir",
        text: "Плесень? Это... погодные условия. Починим. Дайте время!",
      },
    ],
    next: "cr_seriy_day2_office_history",
  },

  // ФОН 9: История
  cr_seriy_day2_office_history: {
    id: "cr_seriy_day2_office_history",
    background: "assets/corruption/9.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2 · История",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "damir",
        text:
          "Совпадение чистой воды. Рынок открылся после пандемии — все в стройку рванули. Мы вовремя попали.",
      },
      {
        speaker: "player",
        text: "А Гульнара Кадырова? Её имя в допсоглашениях на 12 миллионов 'услуг'.",
      },
      {
        speaker: "damir",
        text:
          "Консультант отличный. Знает все лазейки. Хорошая женщина, семья, дети. Без неё бы не справились.",
      },
    ],
    next: "cr_seriy_day2_office_photos",
  },

  // ФОН 9: Друзья
  cr_seriy_day2_office_friends: {
    id: "cr_seriy_day2_office_friends",
    background: "assets/corruption/9.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2 · Реакция",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "damir",
        text:
          "Друзья? Нет-нет... Тендер прозрачный, все видели. Протоколы на портале.",
      },
      {
        speaker: "player",
        text: "Понимаю, Дамир. Бизнес — это связи. Кто звонит?",
      },
      {
        speaker: "damir",
        text: "Никто. Реклама.",
      },
    ],
    next: "cr_seriy_day2_office_photos",
  },

  // ФОН 10: Паркинг, машина
  cr_seriy_day2_office_photos: {
    id: "cr_seriy_day2_office_photos",
    background: "assets/corruption/10.png",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2 · Паркинг",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Выходишь из кабинета. На парковке — Mercedes G-Class Дамира с тонировкой. Номер: 001 AA 77 (элитный, правительственный район).",
      },
    ],
    next: "cr_seriy_day2_office_photo_shot",
  },

  // ФОН 11: Фото номера
  cr_seriy_day2_office_photo_shot: {
    id: "cr_seriy_day2_office_photo_shot",
    background: "assets/corruption/11.png",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2 · Улика",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "Ты фотографируешь номер. Потом звонишь Айтбекову.",
      },
      {
        speaker: "player",
        text: "Майор, номер пробейте. И слежку ставим — парень нервный.",
      },
      {
        speaker: "aitbekov",
        text: "Договорились. Наружка уже в пути.",
      },
    ],
    next: "cr_seriy_day2_evening",
  },

  // === КОНЕЦ ДНЯ 2 ===
  // ФОН 12: Кабинет с телефоном (вечер)
  cr_seriy_day2_evening: {
    id: "cr_seriy_day2_evening",
    background: "assets/corruption/12.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2-3 · Переход",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Вторник, 22:30. Твой кабинет. Ты ждёшь. Телефон должен был позвонить.",
      },
    ],
    next: "cr_seriy_transition_call",
  },

  // ФОН 13: Телефон загорелся
  cr_seriy_transition_call: {
    id: "cr_seriy_transition_call",
    background: "assets/corruption/13.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2-3 · Звонок",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "И позвонил.",
      },
    ],
    next: "cr_seriy_transition_report",
  },

  // ФОН 14: Поднятая трубка
  cr_seriy_transition_report: {
    id: "cr_seriy_transition_report",
    background: "assets/corruption/14.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 2-3 · Брифинг",
    progress: "Эпизод 3 / 10",
    lines: [
      {
        speaker: "aitbekov",
        text:
          "Стажёр, номер пробили — на Дамира, но зарегистрирован на тёщу из Алматы. Наружка села на хвост: поехал в 'Abay' на ужин в 19:00. Один? Нет, ждёт кого-то. Женщину.",
      },
      {
        speaker: "aitbekov",
        text:
          "Будем следить. Завтра с утра — твой выезд. Не спи, это может быть наш прорыв.",
      },
    ],
    next: "cr_seriy_day3_intro",
  },

  // === ДЕНЬ 3 ===
  // ФОН 15: Машина наружки у ресторана
  cr_seriy_day3_intro: {
    id: "cr_seriy_day3_intro",
    background: "assets/corruption/15.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Ночная слежка",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Среда, 21:00. Машина наружки у ресторана 'Abay' в центре города. Ты сидишь сзади, видеокамера готова.",
      },
    ],
    next: "cr_seriy_day3_restaurant",
  },

  // ФОН 16: Ресторан, Дамир + Гульнара
  cr_seriy_day3_restaurant: {
    id: "cr_seriy_day3_restaurant",
    background: "assets/corruption/16.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Встреча",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "21:14. Дамир входит. За угловым столиком — Гульнара Кадырова (38 лет, деловой костюм, холодный взгляд, сумочка Chanel). Они за угловым столиком, 40 минут: шепот, бокалы вина.",
      },
    ],
    next: "cr_seriy_day3_handoff",
  },

  // ФОН 17: Передача флешки
  cr_seriy_day3_handoff: {
    id: "cr_seriy_day3_handoff",
    background: "assets/corruption/17.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Улика",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "В салфетке — что-то блеснуло. Флешка? Дамир передаёт её Гульнаре. Она кладёт в сумочку.",
      },
      {
        speaker: "narrator",
        text: "Ты даёшь сигнал в рацию: 'Начинаем.'",
      },
    ],
    next: "cr_seriy_day3_exit",
  },

  // ФОН 18: Выход из ресторана
  cr_seriy_day3_exit: {
    id: "cr_seriy_day3_exit",
    background: "assets/corruption/18.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Выход",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "21:55. Они выходят. Гульнара оглядывается — замечает машину.",
      },
    ],
    next: "cr_seriy_day3_chase",
  },

  // ФОН 19: Тёмный парк, погоня пешком
  cr_seriy_day3_chase: {
    id: "cr_seriy_day3_chase",
    background: "assets/corruption/19.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Погоня",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Погоня пешком по заснеженному парку. Тёмные дорожки, фонари, сугробы. Быстрые решения — беги/обойди/крикни.",
      },
    ],
    choices: [
      {
        label: "Схватить её! (Быстрое решение)",
        note: "Ты быстро двигаешься, преграждаешь путь.",
        next: "cr_seriy_day3_catch_success",
        effects: { decision: +10, recon: -10 },
      },
      {
        label: "Обойти с другой стороны (Аналитика)",
        note: "Ты предсказываешь её движение и закрываешь выход.",
        next: "cr_seriy_day3_catch_success",
        effects: { analytics: +10, recon: +5, decision: +5 },
      },
      {
        label: "Крикнуть: 'Стой! Флешка!' (Разведнавыки)",
        note: "Ты пугаешь её громким голосом, она замирает.",
        next: "cr_seriy_day3_catch_success",
        effects: { recon: +10, decision: -5 },
      },
    ],
  },

  // ФОН 20: У мусорки, попытка сломать флешку
  cr_seriy_day3_catch_success: {
    id: "cr_seriy_day3_catch_success",
    background: "assets/corruption/20.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Перехват",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Ловишь Гульнару у урны. Она пытается сломать флешку об землю, но ты перехватываешь её руку.",
      },
      {
        speaker: "gulmira_posrednica",
        text: "Отдайте! Это личное! Мои заметки!",
      },
      {
        speaker: "player",
        text:
          "Консультации? Или откаты 15% от 55 миллионов? Флешка у меня — посмотрим.",
      },
    ],
    next: "cr_seriy_day3_gulmira_dialogue",
  },

  // ФОН 21: Диалог с Гульнарой под деревом
  cr_seriy_day3_gulmira_dialogue: {
    id: "cr_seriy_day3_gulmira_dialogue",
    background: "assets/corruption/21.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Переговоры",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "gulmira_posrednica",
        text:
          "Мальчик, вы не знаете, с кем связались. Это не твоя лига. Дамир — пешка. Верни флешку, и забудем.",
      },
    ],
    choices: [
      {
        label: "'Расскажи о себе. Консультант с такой сумочкой — не из бедных.' (Разведнавыки)",
        note: "Ты пытаешься понять, кто она на самом деле.",
        next: "cr_seriy_day3_gulmira_recon",
        effects: { recon: +10, analytics: +5 },
      },
      {
        label: "'На флешке схема: 12% тебе, 3% Тимуру. Подтверди.' (Аналитика)",
        note: "Ты показываешь, что знаешь детали.",
        next: "cr_seriy_day3_gulmira_analytics",
        effects: { analytics: +5, decision: +5, tension: +5, trust: -10 },
      },
      {
        label: "'Руки за спину. Ты под арестом.' (Быстрое решение)",
        note: "Жёсткий ход. Ты берёшь инициативу.",
        next: "cr_seriy_day3_gulmira_arrest",
        effects: { decision: +10, tension: +10, trust: -10, analytics: -5 },
      },
    ],
  },

  // ФОН 21: Разведнавыки путь
  cr_seriy_day3_gulmira_recon: {
    id: "cr_seriy_day3_gulmira_recon",
    background: "assets/corruption/21.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Интервью",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "gulmira_posrednica",
        text:
          "Ха, наблюдательный. Бывшая в департаменте, вышла 'на вольные хлеба'. Сын в Лондоне учится, Оксфорд. Деньги нужны. А ты? Идеалист?",
      },
      {
        speaker: "player",
        text: "Деньги детей — святое. Но школы в плесени.",
      },
      {
        speaker: "gulmira_posrednica",
        text: "(пауза, затягивается) Дети... Ладно. Флешка — переписка. Ничего криминального. Но если сдашь меня...",
      },
    ],
    next: "cr_seriy_day3_gulmira_deal",
  },

  // ФОН 21: Аналитика путь
  cr_seriy_day3_gulmira_analytics: {
    id: "cr_seriy_day3_gulmira_analytics",
    background: "assets/corruption/21.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Анализ",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "gulmira_posrednica",
        text: "Умный... Да, схема. Но все в доле. Асылбек наверху — он решает.",
      },
      {
        speaker: "player",
        text: "Асылбек? Директор департамента?",
      },
      {
        speaker: "gulmira_posrednica",
        text: "Мой зять, фактически.",
      },
    ],
    next: "cr_seriy_day3_gulmira_deal",
  },

  // ФОН 21: Быстрое решение путь
  cr_seriy_day3_gulmira_arrest: {
    id: "cr_seriy_day3_gulmira_arrest",
    background: "assets/corruption/21.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Арест",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "gulmira_posrednica",
        text: "Арест? Без ордера? Позвоню Асылбеку — и ты на улице.",
      },
      {
        speaker: "narrator",
        text: "Но она не вырывается. Понимает, что конец.",
      },
    ],
    next: "cr_seriy_day3_gulmira_deal",
  },

  // ФОН 21: Финальный диалог и сделка
  cr_seriy_day3_gulmira_deal: {
    id: "cr_seriy_day3_gulmira_deal",
    background: "assets/corruption/21.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Сделка",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "gulmira_posrednica",
        text:
          "Ладно, 500к тебе — и разойдёмся. Или... звони копам, посмотрим, кто сломается первым.",
      },
      {
        speaker: "player",
        text: "Признаёшь схему. И будешь свидетелем.",
      },
      {
        speaker: "gulmira_posrednica",
        text: "(кивает медленно) Флешка в обмен на защиту. Ради сына.",
      },
    ],
    next: "cr_seriy_day3_arrest",
  },

  // ФОН 22: Машина наружки, арест
  cr_seriy_day3_arrest: {
    id: "cr_seriy_day3_arrest",
    background: "assets/corruption/22.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 3 · Арест",
    progress: "Эпизод 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "Сажаешь Гульнару в машину. Наручники. Флешка — в доказательства.",
      },
      {
        speaker: "aitbekov",
        text: "(по рации) Молодец. Завтра допросим. Стой дома, после работы — докладаешь.",
      },
    ],
    next: "cr_seriy_day4_intro",
  },

  // === ДЕНЬ 4 ===
  // ФОН 23: Кабинет, анализ данных на экране
  cr_seriy_day4_intro: {
    id: "cr_seriy_day4_intro",
    background: "assets/corruption/23.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 4 · Аналитика",
    progress: "Эпизод 5 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Четверг, 10:00. Кабинет с блокчейном на экране. USDT-транзакции: 15k, 22k ночью. P2P-обменники Алматы. Финразведчик Даулет (40 лет) указывает на графики.",
      },
      {
        speaker: "dauleT_analyst",
        text:
          "Вывод на наличку, дальше — карты, квартиры в Дубае. Асылбек — верх пирамиды. Министр берёт 20%, по слухам.",
      },
    ],
    next: "cr_seriy_day4_interrogation",
  },

  // ФОН 24: Кабинет допроса, Тимур
  cr_seriy_day4_interrogation: {
    id: "cr_seriy_day4_interrogation",
    background: "assets/corruption/25.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 4 · Допрос",
    progress: "Эпизод 5 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Допрос Тимура Аскарова. Кабинет с зеркалом, магнитофон включён. Тимур потеет, кусает ногти.",
      },
      {
        speaker: "timur",
        text:
          "Гульнара — сестра жены Асылбека Тлеубаева, директора. Берут 12-15%. Меня на компромате: фото с вечеринки, где...",
      },
      {
        speaker: "player",
        text: "Расскажи всё. С начала. Хронология.",
      },
      {
        speaker: "timur",
        text:
          "Первый перевод — 450к 'консультации' Гульнаре. Потом 780k 'сопровождение'. Крипта: карты пополняли P2P, USDT на кошелёк. Асылбек звонил: 'Подпиши допсоглашение, или фото уйдут жене'. Я подписал...",
      },
    ],
    choices: [
      {
        label: "'Давай все данные. Записи, транзакции, всё.' (Быстрое решение)",
        note: "Ты берёшь все улики и свидетельства.",
        next: "cr_seriy_day4_timur_confession",
        effects: { decision: +10, recon: +10 },
      },
      {
        label: "'Дети в школе №47 учатся? Те же, где плесень?' (Разведнавыки)",
        note: "Ты ловишь его эмоцию, достаёшь честность.",
        next: "cr_seriy_day4_timur_confession",
        effects: { recon: +10, trust: +10, tension: -10 },
      },
    ],
  },

  // ФОН 24: Ломка Тимура
  cr_seriy_day4_timur_confession: {
    id: "24",
    background: "assets/corruption/24.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 4 · Признание",
    progress: "Эпизод 5 / 10",
    lines: [
      {
        speaker: "timur",
        text: "Да... Мой сын там. Второй класс. Они мёрзнут!",
      },
      {
        speaker: "narrator",
        text:
          "Тимур предоставляет все записи звонков, транзакции, договоры. Вся цепочка преступления.",
      },
      {
        speaker: "timur",
        text: "Я с вами. Ради семьи.",
      },
    ],
    next: "cr_seriy_day5_intro",
  },

  // === ДЕНЬ 5 ===
  // ФОН 25: Офис директора, высокие потолки
  cr_seriy_day5_intro: {
    id: "cr_seriy_day5_intro",
    background: "assets/corruption/26.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Конфронтация",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Пятница, 14:00. Офис Асылбека Тлеубаева, директора департамента образования. Высокие потолки, портреты, вид на город.",
      },
      {
        speaker: "asylbek",
        text:
          "Молодой человек, заходите. Чай? Кофе? Или сразу к делу? Вы понимаете, с кем говорите? Департамент образования — это не просто контора. Это система. Тысячи детей, учителей, школ. Без нас Астана встанет.",
      },
    ],
    next: "cr_seriy_day5_confrontation",
  },

  // ФОН 25 ОПЯТЬ: Confrontation
  cr_seriy_day5_confrontation: {
    id: "cr_seriy_day5_confrontation",
    background: "assets/corruption/27.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Улика",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "player",
        text:
          "Понимаю, Асылбек Серикович. Квартира в Дубае на имя тёщи — 2 миллиона USD. Фото с видом на Бурдж-Халифа. Транши USDT ночью через P2P. Флешка Гульнары с вашей схемой откатов. 12-15% от 55 миллионов.",
      },
      {
        speaker: "asylbek",
        text: "Ложь! Полный подлог! Кто вас подослал? Айтбеков? Этот старый волк давно на меня зуб точит.",
      },
    ],
    next: "cr_seriy_day5_offer",
  },

  // ФОН 25: Предложение
  cr_seriy_day5_offer: {
    id: "cr_seriy_day5_offer",
    background: "assets/corruption/27.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Переговоры",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "asylbek",
        text:
          "Сколько хотите? Миллион тенге? Два? Я переведу прямо сейчас. Карту давай.",
      },
      {
        speaker: "narrator",
        text:
          "Он распечатывает ещё что-то со стола.",
      },
      {
        speaker: "asylbek",
        text:
          "Но это не всё. Схема больше. Министр в курсе. Возьмёшь 10 миллионов — сдашь меня министру. Он заплатит больше. Мы все в одной лодке.",
      },
    ],
    next: "cr_seriy_day5_final_choice",
  },

  // ФОН 26: Финальный выбор — что делать с Асылбеком
  cr_seriy_day5_final_choice: {
    id: "cr_seriy_day5_final_choice",
    background: "assets/corruption/27.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Финал",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Это твой выбор.",
      },
    ],
    choices: [
      {
        label: "'Нет. Наручники. Ты идёшь под стражу.' (Быстрое решение)",
        note: "Жёсткий исход. Арест, но риск политического давления.",
        next: "cr_seriy_day5_end_arrest",
        effects: { decision: +10, tension: +10, trust: -10},
      },
      {
        label: "'Министр? Контакты — проверим цепочку.' (Аналитика)",
        note: "Ты пытаешься поднять выше, но рискуешь сам.",
        next: "cr_seriy_day5_end_investigate",
        effects: { analytics: +10, recon: +5 },
      },
      {
        label: "'Расскажите про министра. Станьте свидетелем. Ради семьи.' (Разведнавыки)",
        note: "Вербовка. Он становится твоим информатором.",
        next: "cr_seriy_day5_end_informant",
        effects: { recon: +10, trust: +10, tension: -5 },
      },
    ],
  },

  // ФОН 26: Конец — Арест
  cr_seriy_day5_end_arrest: {
    id: "cr_seriy_day5_end_arrest",
    background: "assets/corruption/27.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Арест",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "Арман входит. Наручники щёлкают. Асылбека уводят.",
      },
      {
        speaker: "asylbek",
        text: "Сукин сын... Но помни: систему не сломать.",
      },
    ],
    next: "cr_seriy_day6_intro",
  },

  // ФОН 26: Конец — Расследование
  cr_seriy_day5_end_investigate: {
    id: "cr_seriy_day5_end_investigate",
    background: "assets/corruption/bg_director_office.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Расширение",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "asylbek",
        text:
          "Умно. Вот номер... Министр Бекмухамедов. Но не звони сразу. 7 миллионов авансом.",
      },
      {
        speaker: "narrator",
        text:
          "Ты берёшь контакты. Это расширит расследование, но поднимет ставку.",
      },
    ],
    next: "cr_seriy_day6_intro",
  },

  // ФОН 26: Конец — Свидетель
  cr_seriy_day5_end_informant: {
    id: "cr_seriy_day5_end_informant",
    background: "assets/corruption/bg_director_office.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 5 · Вербовка",
    progress: "Эпизод 6 / 10",
    lines: [
      {
        speaker: "asylbek",
        text: "(вздыхает, голос еле слышен) Министр Бекмухамедов... Берёт 20%. Гульнара — мой буфер. Я устал...",
      },
      {
        speaker: "player",
        text: "Вы свидетель. Защита. Ради внуков.",
      },
      {
        speaker: "asylbek",
        text: "(кивает) Договорились.",
      },
    ],
    next: "cr_seriy_day6_intro",
  },

  // === ДЕНЬ 6 ===
  // ФОН 27: Аэропорт, толпа, терминал
  cr_seriy_day6_intro: {
    id: "cr_seriy_day6_intro",
    background: "assets/corruption/29.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 6 · Кульминация",
    progress: "Эпизод 7 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Суббота, 11:00. Аэропорт Нур-Султан, терминал вылета. Толпа пассажиров, объявления 'Рейс в Тбилиси'. Дамир Сейтжанов на стойке регистрации, паспорт в руке, чемодан Louis Vuitton.",
      },
    ],
    next: "cr_seriy_day6_airport_damir",
  },

  // ФОН 27 опять: Регистрация Дамира
  cr_seriy_day6_airport_damir: {
    id: "cr_seriy_day6_airport_damir",
    background: "assets/corruption/29.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 6 · Задержание",
    progress: "Эпизод 7 / 10",
    lines: [
      {
        speaker: "damir",
        text: "Билет бизнес-класс! Скорее, опаздываю!",
      },
      {
        speaker: "player",
        text: "Дамир Сейтжанов? Руки вверх! Флешка, крипта, откаты — конец игры.",
      },
      {
        speaker: "damir",
        text: "Что?! Пустите! Я дипломат! У меня связи! Билет в Грузию!",
      },
    ],
    next: "cr_seriy_day6_airport_struggle",
  },

  // ФОН 29: Борьба в аэропорту
  cr_seriy_day6_airport_struggle: {
    id: "cr_seriy_day6_airport_struggle",
    background: "assets/corruption/30.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 6 · Экшен",
    progress: "Эпизод 7 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "(Борьба. Дамир пытается вырваться, толкает чемодан. Быстрые решения.)",
      },
    ],
    choices: [
      {
        label: "'На пол!' (Быстрое решение)",
        note: "Решительный ход. Он падает, сдаётся.",
        next: "cr_seriy_day6_airport_surrender",
        effects: { decision: +10, tension: +5 },
      },
      {
        label: "'Ради семьи — сдавайся!' (Разведнавыки)",
        note: "Эмоциональное воздействие. Он слышит вас.",
        next: "cr_seriy_day6_airport_surrender",
        effects: { recon: +5, analytics: +5, tension: -5},
      },
      {
        label: "'Асылбек подставил тебя. Все уже говорят.' (Аналитика)",
        note: "Ты даёшь информацию. Он теряет надежду.",
        next: "cr_seriy_day6_airport_surrender",
        effects: { analytics: +5, tension: +5, trust: -5 },
      },
    ],
  },

  // ФОН 30: Наручники
  cr_seriy_day6_airport_surrender: {
    id: "cr_seriy_day6_airport_surrender",
    background: "assets/corruption/31.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · День 6 · Арест",
    progress: "Эпизод 7 / 10",
    lines: [
      {
        speaker: "damir",
        text: "Ладно! Асылбек брал 15%, Гульнара — посредник. Вот пароли от кошелька!",
      },
      {
        speaker: "narrator",
        text:
          "Наручники щёлкают. Толпа глазеет. Дамира уводят. Ты: 'Дело закрыто'.",
      },
    ],
    next: "cr_seriy_finale_office",
  },

  // === ФИНАЛ ===
  // ФОН 1 ВЗЯТЬ САМЫЙ НАЧАЛЬНЫЙ: Кабинет ночью (финал)
  cr_seriy_finale_office: {
    id: "cr_seriy_finale_office",
    background: "assets/corruption/bg_office_night.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · Финал",
    progress: "Эпизод 8 / 10",
    ending: true,
    lines: [
      {
        speaker: "aitbekov",
        text:
          "Дамир уже в изоляторе. Гульнара дала показания на камеру — сдала Асылбека полностью. Тимур подписал всё, что нужно. 55 миллионов украденных у детей.",
      },
      {
        speaker: "player",
        text: "Майор… это правда конец?",
      },
      {
        speaker: "aitbekov",
        text:
          "Конец? Нет, парень. Это только трещина в стене. Система большая. Асылбек — не самый верх. Но сегодня мы её укусили. Сильно. Ты сделал работу. (пауза) Помнишь первую ночь? Папка 'Без приоритета'. Ты открыл её и не закрыл. Это уже победа.",
      },
    ],
    next: "cr_seriy_finale_narration",
  },

  // Финальный нарратив
  cr_seriy_finale_narration: {
    id: "cr_seriy_finale_narration",
    background: "assets/corruption/bg_final_dark.jpg",
    phase: "ОПЕРАЦИЯ «СЕРЫЙ КОНТУР» · Финал · Эпилог",
    progress: "Эпизод 8 / 10",
    ending: true,
    lines: [
      {
        speaker: "narrator",
        text:
          "Коррупция не умирает от одного ареста. Она прячется в тишине. Но сегодня тишина стала чуть громче. Мы услышали её. И она нас тоже услышала.",
      },
      {
        speaker: "narrator",
        text:
          "«ОПЕРАЦИЯ 'СЕРЫЙ КОНТУР' завершена. Но история продолжается…»",
      },
    ],
  },
};
