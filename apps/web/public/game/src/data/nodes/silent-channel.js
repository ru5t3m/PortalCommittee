window.NODES_SILENT_CHANNEL = {
  // ------------------------------------------------------------------
  // ОПЕРАЦИЯ "ТИХИЙ КАНАЛ"
  // ------------------------------------------------------------------
  meta: {
    title: "Операция «Тихий канал»",
    author: "SpecGame_RZH",
    version: "1.0",
    initialNode: "sc_a1_intro",
  },

  // ------------------------------------------------------------------
  // АКТ 1: СЛИШКОМ ЧИСТЫЙ ВХОД
  // ------------------------------------------------------------------
  sc_a1_intro: {
    id: "sc_a1_intro",
    background: "assets/silent_channel/act01.png",
    phase: "Операция «Тихий канал» · Вводный сигнал",
    progress: "Акт 1 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Ночь. Главный герой заступил на смену в ОЦИБ (SOC). Всё спокойно, но одно событие кажется слишком странным, чтобы его игнорировать.",
      },
      {
        speaker: "narrator",
        text:
          "02:37. Монитор логов. В обычном потоке событий появляется нечто странное: вход под root с внешнего адреса.\n" +
          "Jan 12 02:14:22 srv-01 sshd[1842]: Accepted password for root from 185.241.52.19 port 51322 ssh2\n" +
          "Jan 12 02:14:24 srv-01 sshd[1842]: pam_unix(sshd:session): session opened for user root\n" +
          "Jan 12 02:16:03 srv-01 sshd[1842]: session closed for user root",
      },
      {
        speaker: "cybermentor",
        text:
          "Ну вот и логи. Зашёл под рутом с дешёвого VPS. Прямо как в учебнике для первого курса. Обычно тут всё и заканчивается.",
      },
      {
        speaker: "narrator",
        text:
          "Внутренний шум ОЦИБ(SOC): «Скорее всего брут. Но тайминг странный. Дропнул коннект через две минуты.»",
      },
      {
        speaker: "narrator",
        text: "Как ты интерпретируешь это?.",
      },
    ],
    choices: [
      {
        label: "Очевидный брут. Закрываем дыру и усиливаем парольную политику.",
        note: "Версия с опорой на первичные признаки.",
        next: "sc_a1_outcome",
        effects: { decision: +10, speed: +5 },
      },
      {
        label: "Слишком чисто. Кто-то хотел, чтобы мы это увидели.",
        note: "Подозрительно правильная картина.",
        next: "sc_a1_outcome",
        effects: { analytics: +10, decision: +5 },
      },
      {
        label: "Событие выглядит необычно, но одного фрагмента логов недостаточно.",
        note: "Осторожная аналитическая позиция.",
        next: "sc_a1_outcome",
        effects: { analytics: +10, recon: +5, speed: -5 },
      },
    ],
  },

  sc_a1_outcome: {
    id: "sc_a1_outcome",
    background: "assets/silent_channel/act01.png",
    phase: "Операция «Тихий канал» · Вводный сигнал",
    progress: "Акт 1 / 10",
    lines: [
      {
        speaker: "cybermentor",
        text: "Запомни. Тут ты выбираешь не версию. Ты выбираешь стиль.",
      },
    ],
    next: "sc_a2_intro",
  },

  // ------------------------------------------------------------------
  // АКТ 2: ПРОФИЛЬ СЕТИ
  // ------------------------------------------------------------------
  sc_a2_intro: {
    id: "sc_a2_intro",
    background: "assets/silent_channel/act02.png",
    phase: "Операция «Тихий канал» · Профиль сети",
    progress: "Акт 2 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Сканирование уже прикреплено к тикету.\n" +
          "PORT     STATE SERVICE VERSION\n" +
          "22/tcp   open  ssh     OpenSSH 7.4p1 Debian 10+deb9u7\n" +
          "80/tcp   open  http    Apache httpd 2.4.25\n" +
          "443/tcp  open  https   Apache httpd 2.4.25\n" +
          "3306/tcp open  mysql   MySQL 5.7.33",
      },
      {
        speaker: "narrator",
        text:
          "Похоже на обычную историю: устаревшие версии, неустановленный патч и возможные известные CVE.",
      },
      {
        speaker: "cybermentor",
        text: "Хочешь — можешь прямо сейчас начать патчить. Отчёт будет красивый.",
      },
      {
        speaker: "narrator",
        text: "Чат ОЦИБ(SOC): OpenSSH старый. Apache тоже. Набор знакомый, но не самый безопасный.",
      },
      {
        speaker: "narrator",
        text: "Что думаешь?.",
      },
    ],
    choices: [
      {
        label: "Дыры есть — через них и зашли. Логично.",
        note: "Простая причинно-следственная связь.",
        next: "sc_a3_intro",
        effects: { analytics: +5, decision: +5 },
      },
      {
        label: "Уязвимости — это поверхность, а не доказательство.",
        note: "Отделяем фон от намерения.",
        next: "sc_a3_intro",
        effects: { analytics: +10, decision: +5},
      },
      {
        label: "Это фон. Настоящий вход где-то ещё.",
        note: "Ищем глубокий вход.",
        next: "sc_a3_intro",
        effects: { recon: +10, analytics: +10 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 3: ТИХИЙ ТРАФИК
  // ------------------------------------------------------------------
  sc_a3_intro: {
    id: "sc_a3_intro",
    background: "assets/silent_channel/act03.png",
    phase: "Операция «Тихий канал» · Тихий трафик",
    progress: "Акт 3 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Wireshark. График почти ровный. Кроме одного периодичного пакета.\n" +
          "TLSv1.2 Application Data\n" +
          "Destination Port: 8443\n" +
          "Interval: 11–13 минут\n" +
          "Payload size: ~200–230 bytes",
      },
      {
        speaker: "cybermentor",
        text: "Для эксфила объём слишком маленький. Но повторяемость делает этот трафик подозрительным.",
      },
      {
        speaker: "narrator",
        text: "Коллега в чате: «Похоже на маяк - короткий повторяющийся сигнал. Как будто кто-то проверяет, смотрим ли мы вообще».",
      },
      {
        speaker: "narrator",
        text: "Что делаем?.",
      },
    ],
    choices: [
      {
        label: "Маяк. Надо глушить, пока не поздно.",
        note: "Ставка на немедленное подавление.",
        next: "sc_a4_intro",
        effects: { decision: +5, recon: -10, analytics: -5, speed: +10 },
      },
      {
        label: "Наблюдаем. Пусть думает, что мы спим.",
        note: "Проверяем глубину замысла.",
        next: "sc_a4_intro",
        effects: { recon: +10, analytics: +10, speed: -5 },
      },
      {
        label: "Шум. Слишком мало данных.",
        note: "Не фиксируемся на слабом сигнале.",
        next: "sc_a4_intro",
        effects: { analytics: -5, recon: -10 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 4: ПЛАНИРОВЩИК
  // ------------------------------------------------------------------
  sc_a4_intro: {
    id: "sc_a4_intro",
    background: "assets/silent_channel/act04.png",
    phase: "Операция «Тихий канал» · Планировщик",
    progress: "Акт 4 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Crontab сервера.\n*/15 * * * * root /usr/bin/python3 /tmp/.sys_update.py",
      },
      {
        speaker: "narrator",
        text:
          "Скрипт находится уже давно. Права доступа выглядят обычными. Явных тревожных признаков пока нет.",
      },
      {
        speaker: "cybermentor",
        text: "Тут обычно зажимают delete и идут писать отчёт.",
      },
      {
        speaker: "narrator",
        text: "Твои мысли?.",
      },
    ],
    choices: [
      {
        label: "Удаляем. Чистим систему.",
        note: "Грубая, но понятная зачистка.",
        next: "sc_a5_intro",
        effects: { analytics: -10, recon: -10, speed: +10, decision: +5},
      },
      {
        label: "Оставляем и смотрим, куда он звонит.",
        note: "Наблюдение вместо вмешательства.",
        next: "sc_a5_intro",
        effects: { recon: +5, analytics: +10, decision: +5 },
      },
      {
        label: "Подменяем на HoneyPot. Пусть думает, что всё под контролем.",
        note: "Ловушка с контролируемой витриной.",
        next: "sc_a5_intro",
        effects: { analytics: +10, recon: +10 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 5: ИДЕАЛЬНАЯ ИСТОРИЯ
  // ------------------------------------------------------------------
  sc_a5_intro: {
    id: "sc_a5_intro",
    background: "assets/silent_channel/act05.png",
    phase: "Операция «Тихий канал» · Идеальная история",
    progress: "Акт 5 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "History команд выглядит слишком аккуратно.\n" +
          "wget exploit.sh\nchmod +x exploit.sh\n./exploit.sh\nrm exploit.sh",
      },
      {
        speaker: "cybermentor",
        text: "Хахаха. Даже rm не забыли. Красиво.",
      },
      {
        speaker: "narrator",
        text: "Варианты?.",
      },
    ],
    choices: [
      {
        label: "Картина сложилась. Можно фиксировать.",
        note: "Делаем финальную фиксацию.",
        next: "sc_a6_intro",
        effects: { decision: +15 },
      },
      {
        label: "Слишком учебно. Это витрина.",
        note: "Сомнение в очевидности.",
        next: "sc_a6_intro",
        effects: { recon: +10, decision: -5 },
      },
      {
        label: "Не уверен, что это вообще реальная цепочка.",
        note: "Оставляем гипотезы открытыми.",
        next: "sc_a6_intro",
        effects: { analytics: +10, decision: -5 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 6: МАЛВАРЬ
  // ------------------------------------------------------------------
  sc_a6_intro: {
    id: "sc_a6_intro",
    background: "assets/silent_channel/act06.png",
    phase: "Операция «Тихий канал» · Малварь",
    progress: "Акт 6 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Найден бинарник в корневой директории. Хэш совпадает с известным семейством. Функционал урезан. Нет persistence-модуля.",
      },
      {
        speaker: "cybermentor",
        text: "Нашли зверька. Можно выдохнуть?",
      },
      {
        speaker: "narrator",
        text: "Внутренний голос игрока:",
      },
    ],
    choices: [
      {
        label: "Нашли — значит победили.",
        note: "Закрываем вопрос быстро.",
        next: "sc_a7_intro",
        effects: { decision: +5, speed: +5, analytics: -5, recon: -5 },
      },
      {
        label: "Это только часть. Кто-то держит вторую руку.",
        note: "Ищем скрытую часть цепочки.",
        next: "sc_a7_intro",
        effects: { analytics: +10 },
      },
      {
        label: "Отвлекающий манёвр.",
        note: "Ставим под сомнение цель.",
        next: "sc_a7_intro",
        effects: { recon: +10, analytics: +5 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 7: УТЕЧКА, КОТОРОЙ НЕТ
  // ------------------------------------------------------------------
  sc_a7_intro: {
    id: "sc_a7_intro",
    background: "assets/silent_channel/act07.png",
    phase: "Операция «Тихий канал» · Утечка, которой нет",
    progress: "Акт 7 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "HTTP-логи:\nGET /export?id=10241\n200 OK\nResponse size: 12 KB",
      },
      {
        speaker: "narrator",
        text: "Данные не критичны. Формально — утечка.",
      },
      {
        speaker: "cybermentor",
        text: "На бумаге — инцидент. По факту — ерунда.",
      },
      {
        speaker: "narrator",
        text: "Что дальше?.",
      },
    ],
    choices: [
      {
        label: "Фиксируем утечку и эскалируем.",
        note: "Работа по инструкции.",
        next: "sc_a8_intro",
        effects: { decision: +10, speed: +5, recon: -5 },
      },
      {
        label: "Это тест реакции. Хочет с нами поиграть.",
        note: "Смотрим, кто за кулисами.",
        next: "sc_a8_intro",
        effects: { recon: +10, analytics: +5 },
      },
      {
        label: "Слишком мелко для настоящей цели.",
        note: "Сдержанная оценка масштаба.",
        next: "sc_a8_intro",
        effects: { analytics: +5, decision: -5 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 8: ЛЕЧЕНИЕ ИЛИ ОПЕРАЦИЯ
  // ------------------------------------------------------------------
  sc_a8_intro: {
    id: "sc_a8_intro",
    background: "assets/silent_channel/act08.png",
    phase: "Операция «Тихий канал» · Лечение или операция",
    progress: "Акт 8 / 10",
    lines: [
      {
        speaker: "narrator",
        text: "ОЦИБ(SOC) шлет рекомендации:изоляция, патчинг, рестарт.",
      },
      {
        speaker: "cybermentor",
        text:
          "Безопасно — не всегда правильно. Но объяснять это потом придётся тебе.",
      },
      {
        speaker: "narrator",
        text: "Как действуем?.",
      },
    ],
    choices: [
      {
        label: "Сразу изолируем систему и устраняем риск.",
        note: "Быстрое сдерживание угрозы.",
        next: "sc_a9_intro",
        effects: { decision: +10, speed: +10 },
      },
      {
        label: "Рано. Потеряем противника.",
        note: "Сохраняем канал наблюдения.",
        next: "sc_a9_intro",
        effects: { analytics: +15, decision: +10 },
      },
      {
        label: "Стабилизируем частично. Идём в контрмеры для деанона.",
        note: "Удерживаем контроль и след.",
        next: "sc_a9_intro",
        effects: { recon: +10, decision: +5 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 9: ВТОРОЙ РАЗУМ
  // ------------------------------------------------------------------
  sc_a9_intro: {
    id: "sc_a9_intro",
    background: "assets/silent_channel/act09.png",
    phase: "Операция «Тихий канал» · Второй разум",
    progress: "Акт 9 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Поведение меняется. В логах появляются команды по очистке history. Трафик реже.",
      },
      {
        speaker: "cybermentor",
        text: "Похоже, противник понял, что его заметили.",
      },
      {
        speaker: "narrator",
        text: "Что это значит?.",
      },
    ],
    choices: [
      {
        label: "Он уходит. Надо закрываться.",
        note: "Реакция без задержки.",
        next: "sc_a10_intro",
        effects: { speed: +10, decision: -5, recon: -5},
      },
      {
        label: "Он адаптируется. Значит, это диалог.",
        note: "Видим связь и отвечаем.",
        next: "sc_a10_intro",
        effects: { analytics: +5, recon: +5 },
      },
      {
        label: "Мы его переиграли.",
        note: "Ставка на собственный успех.",
        next: "sc_a10_intro",
        effects: {
          analytics: -5,
          recon: -5,
          decision: +5,
          speed: -5,
        },
      },
    ],
  },

  // ------------------------------------------------------------------
  // АКТ 10: ТОЧКА, ГДЕ РЕШЕНИЙ НЕТ
  // ------------------------------------------------------------------
  sc_a10_intro: {
    id: "sc_a10_intro",
    background: "assets/silent_channel/act10.png",
    phase: "Операция «Тихий канал» · Точка, где решений нет",
    progress: "Акт 10 / 10",
    lines: [
      {
        speaker: "narrator",
        text:
          "Новых данных не будет. Только риск и ответственность.",
      },
      {
        speaker: "cybermentor",
        text: "Всё. Выбирай.",
      },
      {
        speaker: "narrator",
        text: "Как поступим?.",
      },
    ],
    choices: [
      {
        label: "Завершаем активную фазу и фиксируем результаты.",
        note: "Ставка на завершение.",
        next: "sc_epilogue",
        effects: { speed: +10, decision: +10, analytics: -5, recon: -5 },
      },
      {
        label: "Передаём инцидент на следующий уровень проверки.",
        note: "Смена масштаба и контекста.",
        next: "sc_epilogue",
        effects: { analytics: +10, recon: +10 },
      },
      {
        label: "Оставляем ситуацию под дальнейшим наблюдением.",
        note: "Работа на длительный след.",
        next: "sc_epilogue",
        effects: { recon: +10, analytics: +5 },
      },
    ],
  },

  // ------------------------------------------------------------------
  // ФИНАЛ
  // ------------------------------------------------------------------
  sc_epilogue: {
    id: "sc_epilogue",
    background: "assets/silent_channel/final.png",
    phase: "Операция «Тихий канал» · Финал",
    progress: "Финал",
    lines: [
      {
        speaker: "narrator",
        text:
          "Операция не заканчивается кликом. Она заканчивается моментом, когда данных больше не становится.",
      },
      {
        speaker: "narrator",
        text:
          "Мониторы всё ещё светятся. Трафик идёт. Серверы работают. Формально — система стабильна. Можно написать отчёт, закрыть тикет, пойти спать.",
      },
      {
        speaker: "narrator",
        text: "Финальная оценка: формируется профиль игрока.",
      },
      {
        speaker: "cybermentor",
        text: "Это не приговор. И не оценка. Это твой профиль.",
      },
      {
        speaker: "cybermentor",
        text:
          "В следующий раз противник будет другим. А вот ты — тем же.",
      },
      {
        speaker: "narrator",
        text:
          "Экран гаснет не потому, что всё закончилось, а потому, что ты сделал выбор, как будешь работать в следующий раз.",
      },
    ],
    ending: true,
  },
};
