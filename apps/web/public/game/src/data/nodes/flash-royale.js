window.NODES_FLASH_ROYALE = {
  // ------------------------------------------------------------------
  // АКТ 1: ВСТУПЛЕНИЕ / ДОСЬЕ
  // ------------------------------------------------------------------
  meta: {
    title: "Флэш-рояль: проигрыш разведчика",
    author: "SpecGame_RZH",
    version: "1.1",
    initialNode: "fr_a1_intro",
  },

  fr_a1_intro: {
    id: "fr_a1_intro",
    background: "assets/flash_royale/bg_office_astana_evening.webp",
    phase: "Контрразведка · Вступление",
    progress: "Акт 1 / 4",
    lines: [
      {
        speaker: "narrator",
        text: "Контрразведка начинается там, где совпадения перестают быть случайными.",
        voice: "assets/voices/flash-royale/fr_a1_intro_1.mp3",
      },
    ],
    next: "fr_a1_mentor_1",
  },

  fr_a1_mentor_1: {
    id: "fr_a1_mentor_1",
    background: "assets/flash_royale/bg_office_astana_evening_light.png",
    phase: "Контрразведка · Вступление",
    progress: "Акт 1 / 4",
    lines: [
      {
        speaker: "mentor",
        text:
          "Сегодня шумных событий не будет.\n" +
          "Перед тобой дипломат. И только твоя внимательность решает, кто ведет игру.",
        voice: "assets/voices/flash-royale/fr_a1_mentor_1_1.mp3",
      },
      {
        speaker: "mentor",
        text:
          "Формально — дипломат западного государства.\n" +
          "На деле — объект, с которым все не так просто.",
        voice: "assets/voices/flash-royale/fr_a1_mentor_1_2.mp3",
      },
    ],
    next: "fr_a1_dossier_open",
  },

  fr_a1_dossier_open: {
    id: "fr_a1_dossier_open",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Досье",
    progress: "Акт 1 / 4",
    lines: [
      { speaker: "mentor", text: "Взгляни на папку на столе с грифом Секретно." ,
voice: "assets/voices/flash-royale/fr_a1_dossier_open_1.mp3",
},
    ],
    next: "fr_a1_choice_0",
  },

  fr_a1_choice_0: {
    id: "fr_a1_choice_0",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Досье",
    progress: "Акт 1 / 4",
    lines: [
      { speaker: "narrator", text: "Открыто досье. Имя: «Клаус» (псевдоним). Статус: дипломат. Возраст: 30+. Страна: западное государство." ,
voice: "assets/voices/flash-royale/fr_a1_choice_0_2.mp3",
},
      { speaker: "narrator", text: "Факты: активно устанавливает контакты с гражданами РК, часто посещает неформальные мероприятия, играет в покер, харизматичен и коммуникабелен." ,
voice: "assets/voices/flash-royale/fr_a1_choice_0_3.mp3",
},
    ],
    next: "fr_a1_micro_menu",
  },

  fr_a1_micro_menu: {
    id: "fr_a1_micro_menu",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Уточнение",
    progress: "Акт 1 / 4",
    lines: [{ speaker: "mentor", text: "Что именно настораживает?" ,
voice: "assets/voices/flash-royale/fr_a1_micro_menu_1.mp3",
}],
    choices: [
      {
        label: "Частота контактов",
        note: "Ментор: «Контакты — кислород разведки.»",
        next: "fr_a1_choice_1",
        effects: { recon: +10, intel: +10, analytics: +10, outcome: "neutral" },
      },
      {
        label: "Неформальные встречи",
        note: "Ментор: «Вербовка никогда не начинается в кабинете.»",
        next: "fr_a1_choice_1",
        effects: { analytics: +10, tension: +10, trust: +10, outcome: "neutral" },
      },
      {
        label: "Личностные качества",
        note: "Ментор: «Харизма — инструмент. Вопрос, в чьих руках.»",
        next: "fr_a1_choice_1",
        effects: { trust: -10, tension: -10, recon: -10, analytics: -10, outcome: "neutral" },
      },
      {
        label: "Всё сразу",
        note: "Широкая рамка подозрения.",
        next: "fr_a1_choice_1",
        effects: { decision: -10, analytics: -10, outcome: "neutral" },
      },
    ],
  },

  fr_a1_choice_1: {
    id: "fr_a1_choice_1",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Первичная оценка",
    progress: "Акт 1 / 4",
    lines: [{ speaker: "mentor2", text: "Как ты оцениваешь объект на данном этапе?" ,
voice: "assets/voices/flash-royale/fr_a1_choice_1_1.mp3",
}],
    choices: [
      {
        label: "«Обычный дипломат. Повышенная активность — часть работы.»",
        note: "Потеря инициативы. Упускаешь окно раннего реагирования.",
        next: "fr_a1_react_bad",
        effects: { missedEarlyOpportunity: true, hintsDisabled: true, tension: -5, recon: -5 },
      },
      {
        label: "«Активность выше среднего, но без явных нарушений.»",
        note: "Осторожность. Нейтральный путь.",
        next: "fr_a1_react_neutral",
        effects: { decision: +10 },
      },
      {
        label: "«Поведение требует повышенного внимания.»",
        note: "Наблюдательность. Оптимальный путь.",
        next: "fr_a1_react_good",
        effects: { recon: +10, tension: +10 },
      },
    ],
  },

  fr_a1_react_bad: {
    id: "fr_a1_react_bad",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Первичная оценка",
    progress: "Акт 1 / 4",
    lines: [
      { speaker: "mentor", text: "Так думает большинство. Именно поэтому большинство никогда не ловит разведчиков." ,
voice: "assets/voices/flash-royale/fr_a1_react_bad_1.mp3",
},
      { speaker: "narrator", text: "Предупреждение: упущена возможность раннего реагирования." ,
voice: "assets/voices/flash-royale/fr_a1_react_bad_2.mp3",
},
      { speaker: "mentor", text: "Запомни! Разведчик редко выдаёт себя поступком. Он выдаёт себя стилем жизни." ,
voice: "assets/voices/flash-royale/fr_a1_react_bad_3.mp3",
},
      { speaker: "narrator", text: "Куратор закрывает папку." ,
voice: "assets/voices/flash-royale/fr_a1_react_bad_4.mp3",
},
    ],
    next: "fr_a2_entry_hard",
  },

  fr_a1_react_neutral: {
    id: "fr_a1_react_neutral",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Первичная оценка",
    progress: "Акт 1 / 4",
    lines: [{ speaker: "mentor", text: "Разумно. Но разум — не всегда достаточно." ,
voice: "assets/voices/flash-royale/fr_a1_react_neutral_1.mp3",
},
            { speaker: "mentor", text: "Запомни первое правило. Разведчик редко выдаёт себя поступком. Он выдаёт себя стилем жизни." ,
voice: "assets/voices/flash-royale/fr_a1_react_neutral_2.mp3",
},
            { speaker: "mentor", text: "Мы ищем не факты. Мы ищем закономерности. Чем точнее они видны, тем меньше случайностей вокруг." ,
voice: "assets/voices/flash-royale/fr_a1_react_neutral_4.mp3",
},],
    next: "fr_a2_entry_normal",
  },

  fr_a1_react_good: {
    id: "fr_a1_react_good",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Первичная оценка",
    progress: "Акт 1 / 4",
    lines: [{ speaker: "mentor", text: "Вот это уже разговор. Подозрение — ещё не обвинение, но повод проверить." ,
voice: "assets/voices/flash-royale/fr_a1_react_good_1.mp3",
},
            { speaker: "mentor", text: "Запомни первое правило. Разведчик редко выдаёт себя поступком. Он выдаёт себя стилем жизни." ,
voice: "assets/voices/flash-royale/fr_a1_react_good_2.mp3",
},
            { speaker: "mentor", text: "Мы идём не за фактом. Мы идём за узором. Чем точнее ты его видишь, тем меньше он похож на случайность." ,
voice: "assets/voices/flash-royale/fr_a1_react_good_4.mp3",
},
    ],
    next: "fr_a2_entry_assist",
  },

  // ------------------------------------------------------------------
  // АКТ 2: БИОГРАФИЯ БЕЗ ПРОБЕЛОВ (ветвление из акта 1)
  // ------------------------------------------------------------------

  fr_a2_entry_hard: {
    id: "fr_a2_entry_hard",
    background: "assets/common/bg_hq.lossless.webp",
    phase: "Провал",
    progress: "Финал",
    ending: true,
    lines: [
      { speaker: "curator", text: "Ты не заметил подозрительную активность шпиона. Мы упустили его из виду." ,
voice: "assets/voices/flash-royale/fr_a2_entry_hard_1.mp3",
},
      { speaker: "narrator", text: "Сценарий завершен." ,
voice: "assets/voices/flash-royale/fr_a2_entry_hard_2.mp3",
},
    ],
  },

  fr_a2_entry_normal: {
    id: "fr_a2_entry_normal",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Биография — это не доказательство. Это повод подумать." ,
voice: "assets/voices/flash-royale/fr_a2_entry_normal_1.mp3",
}],
    next: "fr_a2_scene1",
  },

  fr_a2_entry_assist: {
    id: "fr_a2_entry_assist",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Ты заметил закономерность. Теперь докажи ее." ,
voice: "assets/voices/flash-royale/fr_a2_entry_assist_1.mp3",
}],
    next: "fr_a2_scene1",
  },

  fr_a2_scene1: {
    id: "fr_a2_scene1",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [
      { speaker: "mentor", text: "На поверхности все чисто. А что ты видишь между строк?" ,
voice: "assets/voices/flash-royale/fr_a2_scene1_1.mp3",
},
    ],
    next: "fr_a2_micro1",
  },

  fr_a2_micro1: {
    id: "fr_a2_micro1",
    background: "assets/flash_royale/bg_office_table_dossier_open.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "narrator", text: "На что из биографии стоит обратить внимание?" ,
voice: "assets/voices/flash-royale/fr_a2_micro1_1.mp3",
}],
    choices: [
      {
        label: "Престижное образование",
        note: "Нормально, но это может быть слишком идеальной формой.",
        next: "fr_a2_after_m1_generic",
        effects: { recon: -10, tension: +5 },
      },
      {
        label: "Опыт в бизнесе",
        note: "Нормально, но важно смотреть на переходы.",
        next: "fr_a2_after_m1_generic",
        effects: { recon: +5 },
      },
      {
        label: "Прямой карьерный рост в МИД",
        note: "Подозрительно гладкая траектория.",
        next: "fr_a2_after_m1_good",
        effects: { recon: +10, tension: +5, flag_careerSmooth: true },
      },
      {
        label: "Нет ничего подозрительного",
        note: "Логично. И безопасно. (Риск веры в легенду.)",
        next: "fr_a1_react_bad",
        effects: { trustInLegend: true, recon: -10, trust: -10 },
      },
    ],
  },

  fr_a2_after_m1_generic: {
    id: "fr_a2_after_m1_generic",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Хорошо. Это нормально. Но бывает, что нормальное слишком идеально." ,
voice: "assets/voices/flash-royale/fr_a2_after_m1_generic_1.mp3",
}],
    next: "fr_a2_scene2",
  },

  fr_a2_after_m1_good: {
    id: "fr_a2_after_m1_good",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Все выглядит слишком ровно. Внимательность подсказывает: это еще не вся история." ,
voice: "assets/voices/flash-royale/fr_a2_after_m1_good_1.mp3",
}],
    next: "fr_a2_scene2",
  },

  fr_a2_after_m1_bad: {
    id: "fr_a2_after_m1_bad",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Логично быть может. Но я бы подумал еще немного." ,
voice: "assets/voices/flash-royale/fr_a2_after_m1_bad_1.mp3",
}],
    next: "fr_a2_scene2",
  },

  fr_a2_scene2: {
    id: "fr_a2_scene2",
    background: "assets/flash_royale/bg_bio_documents_point.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [
      { speaker: "narrator", text: "Твой куратор указывает на интересные сведения",
voice: "assets/voices/flash-royale/fr_a2_scene2_1.mp3",
},
      { speaker: "narrator", text: "Диплом получен в возрасте 28 лет\n" +
        "Через два года - карьера в МИД",
voice: "assets/voices/flash-royale/fr_a2_scene2_2.mp3",
},
    ],
    next: "fr_a2_micro2",
  },

  fr_a2_micro2: {
    id: "fr_a2_micro2",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "narrator", text: "Как ты интерпретируешь этот переход?" ,
voice: "assets/voices/flash-royale/fr_a2_micro2_1.mp3",
}],
    choices: [
      {
        label: "Это нормальный карьерный путь",
        note: "Безопасная версия.",
        next: "fr_a2_after_m2_bad",
        effects: { recon: -5, trustInLegend: true },
      },
      {
        label: "Возможно, он скрывает промежуток, связанный с разведшколой",
        note: "Оперативная гипотеза.",
        next: "fr_a2_after_m2_good",
        effects: { analytics: +10, recon: +5,  flag_schoolGap: true },
      },
      {
        label: "Нужно сделать запрос на дополнительные данные",
        note: "Усиливает контроль фактов.",
        next: "fr_a2_after_m2_good",
        effects: { analytics: +10,intel: +10, flag_request: true },
      },
      {
        label: "Это мелочь, не стоит внимания",
        note: "Слишком безопасно.",
        next: "fr_a2_after_m2_bad",
        effects: { recon: -10, analytics: -10, tension: +10, trustInLegend: true, analytics: -5 },
      },
    ],
  },

  fr_a2_after_m2_bad: {
    id: "fr_a2_after_m2_bad",
    background: "assets/flash_royale/bg_bio_documents_point.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Интересно, ты мог пропустить довольно важную деталь." ,
voice: "assets/voices/flash-royale/fr_a2_after_m2_bad_1.mp3",
}],
    next: "fr_a2_scene3",
  },

  fr_a2_after_m2_good: {
    id: "fr_a2_after_m2_good",
    background: "assets/flash_royale/bg_bio_documents_point.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Промежуток между дипломом и работой в МИД — это не случайность." ,
voice: "assets/voices/flash-royale/fr_a2_after_m2_good_1.mp3",
}],
    next: "fr_a2_scene3",
  },

  fr_a2_scene3: {
    id: "fr_a2_scene3",
    background: "assets/flash_royale/bg_bio_documents_dim.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [
      { speaker: "narrator", text: "Под его биографическими данными ты обращаешь внимание на короткие сведения." ,
voice: "assets/voices/flash-royale/fr_a2_scene3_1.mp3",
},
      { speaker: "narrator", text: "Осторожность в поведении, попытки скрыться от наблюдения, серьёзная конспирация, попытки обнаружить в своем окружении агентуру КНБ." ,
voice: "assets/voices/flash-royale/fr_a2_scene3_2.mp3",
},
    ],
    next: "fr_a2_micro3",
  },

  fr_a2_micro3: {
    id: "fr_a2_micro3",
    background: "assets/flash_royale/bg_office_table_dossier.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "narrator", text: "Что ты думаешь о его манере поведения?" ,
voice: "assets/voices/flash-royale/fr_a2_micro3_1.mp3",
}],
    choices: [
      {
        label: "Это обычное поведение дипломата",
        note: "Поверхностное восприятие.",
        next: "fr_a2_after_m3_bad",
        effects: { analytics: -10, recon: -5, trustInLegend: true, intel: -5 },
      },
      {
        label: "Он пытается скрыться от внешнего наблюдения",
        note: "Признак профессиональной конспирации.",
        next: "fr_a2_after_m3_good",
        effects: { intel: +10, recon: +5, tension: +5, flag_surveillance: true },
      },
      {
        label: "Это указывает на профессиональную подготовку",
        note: "Вывод о его квалификации.",
        next: "fr_a2_after_m3_good",
        effects: { intel: +10, recon: +5, analytics: +5, flag_tradecraft: true },
      },
      {
        label: "Ничего подозрительного",
        note: "Снижение подозрения.",
        next: "fr_a2_after_m3_bad",
        effects: { recon: -10, analytics: -10, trustInLegend: true },
      },
    ],
  },

  fr_a2_after_m3_bad: {
    id: "fr_a2_after_m3_bad",
    background: "assets/flash_royale/bg_bio_documents_dim.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Ты думаешь, что это просто осторожность?" ,
voice: "assets/voices/flash-royale/fr_a2_after_m3_bad_1.mp3",
}],
    next: "fr_a2_end",
  },

  fr_a2_after_m3_good: {
    id: "fr_a2_after_m3_good",
    background: "assets/flash_royale/bg_bio_documents_dim.webp",
    phase: "Контрразведка · Биография",
    progress: "Акт 2 / 4",
    lines: [{ speaker: "mentor", text: "Только тот, кто скрывает свою работу, будет так осторожен. Это профессионал." ,
voice: "assets/voices/flash-royale/fr_a2_after_m3_good_1.mp3",
}],
    next: "fr_a2_end",
  },

  fr_a2_end: {
    id: "fr_a2_end",
    background: "assets/flash_royale/bg_bio_documents_dim.webp",
    phase: "Контрразведка · Итог",
    progress: "Акт 2 / 4",
    lines: [
      {
        speaker: "mentor",
        text:
          "Когда у тебя в руках идеально отработанная биография, подумай — кто её пишет.\n" +
          "Потому что она не должна быть без пробелов.",
        voice: "assets/voices/flash-royale/fr_a2_end_1.mp3",
      },
      {
        speaker: "narrator",
        text: "Вся информация проверена. Теперь пора проверить легенду лично.",
        voice: "assets/voices/flash-royale/fr_a2_end_2.mp3",
      },
    ],
    next: "fr_a3_entry",
  },

  // ------------------------------------------------------------------
  // АКТ 3: ЛЕГЕНДА, КОТОРОЙ ХОЧЕТСЯ ВЕРИТЬ
  // ------------------------------------------------------------------

  fr_a3_entry: {
      id: "fr_a3_entry",
      background: "assets/flash_royale/bg_third_start.webp",
      // Промпт: Diplomatic reception hall, suits blurred in background, warm chandeliers, tense observation mood, cinematic 2.5D, 16:9
      phase: "Контакты · Проверка",
      progress: "Акт 3 / 4",
      lines: [{ speaker: "mentor", text: "Моментом истины в оперативной разработке «Клауса» стала добытая оперативным путем информация о полученном им задании завербовать агента в одном из ключевых министерств Казахстана." ,
  voice: "assets/voices/flash-royale/fr_a3_entry_1.mp3",
  },
              { speaker: "mentor", text: "Одной из вершин искусства оперативной работы в любой спецслужбе является агентурное проникновение, готовых сценариев для которого просто не существует." ,
  voice: "assets/voices/flash-royale/fr_a3_entry_2.mp3",
  },
      ],
      next: "fr_a3_entry1",
    },

  fr_a3_entry1: {
      id: "fr_a3_entry1",
      background: "assets/flash_royale/bg_third_start2.webp",
      // Промпт: Diplomatic reception hall, suits blurred in background, warm chandeliers, tense observation mood, cinematic 2.5D, 16:9
      phase: "Контакты · Проверка",
      progress: "Акт 3 / 4",
      lines: [{ speaker: "narrator", text: "Контрразведчики творчески подошли к этому процессу, решив подставить западному дипломату «ценный источник»." ,
  voice: "assets/voices/flash-royale/fr_a3_entry_3.mp3",
  },
              { speaker: "mentor", text: "«После некоторых раздумий решили, что эту роль сыграешь ты. Ты обладаешь цепким умом и живым характером, что называется «горишь на работе». Учли и твой небольшой стаж службы в столице, где ты еще не успел «засветиться» перед окружением.»." ,
  voice: "assets/voices/flash-royale/fr_a3_entry_3.mp3",
  },
      ],
      next: "fr_a3_after_entry",
    },

  fr_a3_after_entry: {
    id: "fr_a3_after_entry",
    background: "assets/flash_royale/bg_diplomatic_reception.webp",
    // Промпт: Diplomatic reception hall, suits blurred in background, warm chandeliers, tense observation mood, cinematic 2.5D, 16:9
    phase: "Контакты · Проверка",
    progress: "Акт 3 / 4",
    lines: [{ speaker: "narrator", text: "В соответствии с созданной легендой, ты успешно на общих основаниях прошел конкурсный отбор в интересующее Клауса министерство и положительно зарекомендовал себя с первых дней работы там. Тебя стали привлекать к официальным мероприятием с участием иностранных делегаций." ,
voice: "assets/voices/flash-royale/fr_a3_entry_1.mp3",
},
            { speaker: "narrator", text: "На одном из таких дипломатических приемов ты встречаешь Клауса." ,
voice: "assets/voices/flash-royale/fr_a3_entry_2.mp3",
},
            { speaker: "narrator", text: "Как раз тогда он уже активно искал себе новые связи. Искал кого можно завербовать" ,
voice: "assets/voices/flash-royale/fr_a3_entry_3.mp3",
}
    ],
    next: "fr_a3_scene1",
  },

  fr_a3_scene1: {
    id: "fr_a3_scene1",
    background: "assets/flash_royale/bg_diplomatic_reception.webp",
    phase: "Контакты · Первый контакт",
    progress: "Акт 3 / 4",
    lines: [{ speaker: "klaus", text: "«Я замечал вас на приемах. Вы не такой как все остальные. Обычно в этом зале говорят только о погоде." ,
voice: "assets/voices/flash-royale/fr_a3_scene1_1.mp3",
}],
    choices: [
      {
        label: "Ответить официально, дистанцированно",
        note: "Контакт слабый, Клаус настораживается.",
        next: "fr_a3_post1",
        effects: { trust: -5, tension: +5 },
      },
      {
        label: "Ответить легко, с намёком на общие интересы",
        note: "Контакт установлен (база).",
        next: "fr_a3_post1",
        effects: { trust: +10, decision: +10 },
      },
      {
        label: "Ответить иронично, показывая самостоятельность",
        note: "Клаус интересуется быстрее (опасно при ошибках акта 2).",
        next: "fr_a3_post1",
        effects: { trust: +10, tension: +10, intel: +10},
      },
    ],
  },

  fr_a3_post1: {
    id: "fr_a3_post1",
    background: "assets/flash_royale/bg_diplomatic_reception.webp",
    phase: "Контакты · Первый контакт",
    progress: "Акт 3 / 4",
    lines: [{ speaker: "klaus", text: "В конце месяца - VI международная конференция. Вы там будете? Если да, после можем обсудить это в более приятной атмосфере." ,
voice: "assets/voices/flash-royale/fr_a3_post1_1.mp3",
},
    ],
    choices: [
      {
        label: "К сожалению, нет. Выезжаю в командировку.",
        next: "fr_a3_postt",
        effects: { trust: -5, decision: -5 },
      },
      {
        label: "Да, хорошая идея.",
        next: "fr_a3_postt",
        effects: { trust: +10, recon: +5 },
      },
      {
        label: "Еще точно не знаю, не планировал участие в международной конференции.",
        next: "fr_a3_postt",
        effects: { trust: -10, tension: +10, decision: -5 },
      },
    ],
  },

  fr_a3_postt: {
    id: "fr_a3_postt",
    background: "assets/flash_royale/bg_bar_cafe_night.webp",
    phase: "Контакты · Монтаж",
    progress: "Акт 3 / 4",
    lines: [{ speaker: "narrator", text: "Клаус сильно стремился перевести отношения на неформальную основу. Он позвал вас поужинать в одном из столичных кафе." ,
voice: "assets/voices/flash-royale/fr_a3_post2.mp3",
}],
    next: "fr_a3_scene2",
  },

  fr_a3_scene2: {
    id: "fr_a3_scene2",
    background: "assets/flash_royale/bg_bar_cafe_night.webp",
    phase: "Контакты · Неформал",
    progress: "Акт 3 / 4",
    lines: [
      { speaker: "klaus", text: "Вам нравится ваша работа? Или все важное, по вашему, решается вне в кабинетов? И кстати, вы уже знакомы с нашей страной? Если нет, могу помочь с визой и показать столицу." ,
voice: "assets/voices/flash-royale/fr_a3_scene2_1.mp3",
},
    ],
    choices: [
      {
        label: "Подчеркнуть лояльность службе",
        note: "Клаус меняет тактику, проверка затягивается.",
        next: "fr_a3_offer",
        effects: { confidence: +10, trust: -10, decision: -5 },
      },
      {
        label: "Сыграть в разочарование системой",
        note: "Кажется безопасным, но если видел аномалии — ловушка.",
        next: "fr_a3_offer",
        effects: { pitfall_disillusion: true, tension: +10, trust: +5, decision: +5 },
      },
      {
        label: "Уклониться от прямого ответа",
        note: "Сохраняешь границы, но растёт напряжение проверки.",
        next: "fr_a3_offer",
        effects: { tension: +10, confidence: +10, decision: -5, trusrt: -5 },
      },
    ],
  },

//   fr_a3_post2: {
//     id: "fr_a3_post2",
//     background: "assets/flash_royale/bg_bar_cafe_night.webp",
//     phase: "Контакты · Неформал",
//     progress: "Акт 3 / 4",
//     lines: [{ speaker: "narrator", text: "Контакты регулярны. Атмосфера доверия. Процесс взаимного изучения был довольно продолжительным. Лишь спустя полтора года контрразведчикам улыбнулась заслуженная удача: Клаус предложил тебе предоставлять информацию за щедрые гонорары." ,
// voice: "assets/voices/flash-royale/fr_a3_post2_1.mp3",
// },
//     ],
//     next: "fr_a3_control_call",
//   },

//   fr_a3_control_call: {
//     id: "fr_a3_control_call",
//     background: "assets/flash_royale/bg_bar_cafe_out.webp",
//     phase: "Контакты · Контроль",
//     progress: "Акт 3 / 4",
//     lines: [
//       { speaker: "narrator", text: "После встречи — короткий звонок куратору. Голос сдержан, без эмоций." ,
// voice: "assets/voices/flash-royale/fr_a3_control_call_1.mp3",
// },
//       { speaker: "mentor", text: "Продолжай рутину. Не давай ему почувствовать спешку. И не путай уважение с дружбой." ,
// voice: "assets/voices/flash-royale/fr_a3_control_call_2.mp3",
// },
//     ],
//     next: "fr_a3_offer",
//   },

  fr_a3_offer: {
    id: "fr_a3_offer",
    background: "assets/flash_royale/bg_bar_cafe_out.webp",
    phase: "Контакты · Предложение",
    progress: "Акт 3 / 4",
    lines: [
      { speaker: "klaus", text: "Я работал с разными людьми и могу сказать что в тебе есть потенциал. Ты можешь добиться больших высот, причем не прилагая больших усилий. Я могу помочь, было бы желание…" ,
voice: "assets/voices/flash-royale/fr_a3_offer_1.mp3",
},
      { speaker: "mentor", text: "Запомни это ощущение. Так чувствуют себя те, кого вербуют." ,
voice: "assets/voices/flash-royale/fr_a3_offer_3.mp3",
},
      { speaker: "klaus", text: "Мне нужен человек, который может… поделиться кое-какой информацией. Ничего серьёзного. Просто копия справочника служебных телефонов вашего ведомства." ,
voice: "assets/voices/flash-royale/fr_a3_offer_1.mp3",
},
    ],
    choices: [
      {
        label: "Немедленно согласиться",
        note: "Ускорение финала, высокий риск провала.",
        next: "fr_a3_after_key",
        effects: { tension: +15, a3_agreedFast: true },
      },
      {
        label: "Попросить время",
        note: "Сохраняешь контроль ситуации.",
        next: "fr_a3_after_key",
        effects: { confidence: +10, trust: +5, recon: +5, a3_time: true },
      },
      {
        label: "Отказаться, сославшись на риск",
        note: "Клаус отходит, но не исчезает.",
        next: "fr_a3_after_key",
        effects: { confidence: +10, trust: -5, decision: -5, a3_refuse: true },
      },
    ],
  },

  fr_a3_after_key: {
    id: "fr_a3_after_key",
    background: "assets/flash_royale/bg_bar_cafe_night.webp",
    phase: "Контакты · Итог",
    progress: "Акт 3 / 4",
    lines: [
      { speaker: "mentor", text: "Ты всё ещё думаешь, что контролируешь ситуацию. Это нормально. Он тоже так думает." ,
voice: "assets/voices/flash-royale/fr_a3_after_key_3.mp3",
},
    ],
    next: "fr_a4_router",
  },

  // ------------------------------------------------------------------
  // АКТ 4: РОУТЕР (успех / «слишком ровная игра»)
  // ------------------------------------------------------------------
  fr_a4_router: {
    id: "fr_a4_router",
    background: "assets/flash_royale/street.webp",
    phase: "Финал · Роутер",
    progress: "Акт 4 / 4",
    lines: [{ speaker: "mentor", text: "Это был долгожданный флэш: ты внедрился в агентурный аппарат одной из ведущих спецслужб мира!" ,
voice: "assets/voices/flash-royale/fr_a4_router_1.mp3",
},

],
    next: "fr_a4_router2",
  },

  fr_a4_router2: {
    id: "fr_a4_router2",
    background: "assets/flash_royale/bg_outdoors_night.webp",
    phase: "Финал · Роутер",
    progress: "Акт 4 / 4",
    lines: [
{ speaker: "narrator", text: "Отрабатываемые тобой задания постепенно усложнялись, безобидные проверочные просьбы принести те или иные документы сменялись более серьезными поручениями. Явки проводились на окраине города в безлюдных местах, по классической схеме шпионских романов использовались пароли и условные фразы." ,
voice: "assets/voices/flash-royale/fr_a4_router2.mp3",
}
],
    next: "fr_a4_scene0",
  },

  // ------------------------------------------------------------------
  // АКТ 4: УСПЕШНАЯ ВЕТКА «ФЛЭШ»
  // ------------------------------------------------------------------
//   fr_a4_intro: {
//     id: "fr_a4_intro",
//     background: "assets/flash_royale/bg_mfa_corridor_day.png",
//     // Промпт: Government ministry corridor, cold daylight, strict modern interior, security blurred far, cinematic 2.5D, 16:9
//     phase: "Финал · «ФЛЭШ»",
//     progress: "Акт 4 / 4",
//     lines: [
//       { speaker: "narrator", text: "Время шло, служебный пропуск МИД, рабочие папки, приёмы, командировки, неформальные встречи, регулярные контакты с Клаусом." ,
// voice: "assets/voices/flash-royale/fr_a4_intro_1.mp3",
// },
//       { speaker: "mentor", text: "Ты вошёл в эту сферу, в их окружение, туда куда тебя не должны были пустить. Это была не удача. Это была работа." ,
// voice: "assets/voices/flash-royale/fr_a4_intro_2.mp3",
// },
//       { speaker: "mentor", text: "Клаус продолжал активно работать с тобой. Возможно он просто проверял тебя и твои возможности." ,
// voice: "assets/voices/flash-royale/fr_a4_intro_2.mp3",
// },
//     ],
//     next: "fr_a4_scene0",
//   },

  fr_a4_scene0: {
    id: "fr_a4_scene1",
    background: "assets/flash_royale/bg_mfa_desk_workday.webp",
    // Промпт: Ministry desk workspace, computer, folders, badge, cold light with warm accents, cinematic 2.5D, 16:9
    phase: "Финал · «Свой»",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Служебный день: реальные рабочие задачи и доступ к документам." ,
voice: "assets/voices/flash-royale/fr_a4_scene1_1.mp3",
},
    ],
    next: "fr_a4_scene1",
  },

  fr_a4_scene1: {
    id: "fr_a4_scene1",
    background: "assets/flash_royale/bg_mfa_desk_workday_office.webp",
    // Промпт: Ministry desk workspace, computer, folders, badge, cold light with warm accents, cinematic 2.5D, 16:9
    phase: "Финал · «Свой»",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Клаус замечает твои старания." ,
voice: "assets/voices/flash-royale/fr_a4_scene1_1.mp3",
},
      { speaker: "klaus", text: "А ты быстро осваиваешься. Далеко не все здесь понимают, что действительно важно." ,
voice: "assets/voices/flash-royale/fr_a4_scene1_2.mp3",
},
    ],
    next: "fr_a4_scene2",
  },

  fr_a4_scene2: {
    id: "fr_a4_scene2",
    background: "assets/flash_royale/bg_mfa_desk_cab.png",
    phase: "Финал · Смещение границ",
    progress: "Акт 4 / 4",
    lines: [{ speaker: "narrator", text: "Клаус интересуется деталями работы, задаёт вопросы «из любопытства», проверяет реакцию." ,
voice: "assets/voices/flash-royale/fr_a4_scene2_1.mp3",
}],
    choices: [
      {
        label: "Давать общие ответы",
        note: "Замедляет процесс, усиливает проверки.",
        next: "fr_a4_scene3",
        effects: { confidence: +10, recon: -5 },
      },
      {
        label: "Уклоняться",
        note: "Сохраняет границы, но растёт давление.",
        next: "fr_a4_scene3",
        effects: { confidence: +10, tension: +10, trust: -10 },
      },
      {
        label: "Чуть больше, чем положено",
        note: "Ускоряет вербовку.",
        next: "fr_a4_scene3",
        effects: { tension: +10, recon: +10, confidence: +10, trust: +10 },
      },
    ],
  },

//   fr_a4_postmicro: {
//     id: "fr_a4_postmicro",
//     background: "assets/flash_royale/bg_mfa_desk_cab.png",
//     phase: "Финал · Наблюдение",
//     progress: "Акт 4 / 4",
//     lines: [{ speaker: "narrator", text: "Он не торопится. Торопятся только те, кому нечего терять." ,
// voice: "assets/voices/flash-royale/fr_a4_postmicro_1.mp3",
// }],
//     next: "fr_a4_scene3",
//   },

  fr_a4_scene3: {
    id: "fr_a4_scene3",
    background: "assets/flash_royale/bg_mfa_desk_workday_end.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Клаус весь день провел рядом с тобой, наконец когда ваши пути расходились он произнес кое-что действительно инетерсное." ,
voice: "assets/voices/flash-royale/fr_a4_scene3_1.mp3",
},
      { speaker: "klaus", text: "Мне нужна копия документа с позицией Вашего государства, того самого документа, который не в тех руках поставит твою страну перед большими угрозами в экономике. Без оригинала. Без следов. Ты ведь понимаешь, что это формальность." ,
voice: "assets/voices/flash-royale/fr_a4_scene3_2.mp3",
},
    ],
    choices: [
      {
        label: "Сразу согласиться",
        note: "",
        next: "fr_a4_scene5",
        effects: { confidence: +10, trust: +10, recon: +10 },
      },
      {
        label: "Сказать что необходимо подумать, это серьёзное поручение",
        note: "",
        next: "fr_a4_scene4",
        effects: { confidence: +10, tension: +10, decision: +5 },
      },
      {
        label: "Отказаться, сославшись на риск для страны",
        note: "",
        next: "fr_end_neutral",
        effects: { tension: +10, trust: -10 },
      },
    ],
  },

  fr_a4_scene5: {
    id: "fr_a4_scene5",
    background: "assets/flash_royale/bg_airport.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Аэропорт. Раннее утро." ,
voice: "assets/voices/flash-royale/fr_a4_scene5_1.mp3",
},
    ],
    next: "fr_a4_scene6",
  },

  fr_a4_scene6: {
    id: "fr_a4_scene6",
    background: "assets/flash_royale/bg_airport.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Клаус в тёмном пальто проходит по терминалу с небольшим чемоданом. Он спокойно движется к зоне вылета." ,
voice: "assets/voices/flash-royale/fr_a4_scene6_1.mp3",
},
    ],
    next: "fr_a4_scene7",
  },

  fr_a4_scene7: {
    id: "fr_a4_scene7",
    background: "assets/flash_royale/bg_airport_posadka.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "На экране аэропорта появляется надпись: «Посадка»." ,
voice: "assets/voices/flash-royale/fr_a4_scene6_1.mp3",
},
    ],
    next: "fr_a4_scene8",
  },

  fr_a4_scene8: {
    id: "fr_a4_scene8",
    background: "assets/flash_royale/bg_airport_delete.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "klaus2", text: "* останавливается на секунду, смотрит на телефон и удаляет последнее сообщение. *" ,
voice: "assets/voices/flash-royale/fr_a4_scene6_1.mp3",
},
    ],
    next: "fr_a4_scene9",
  },

  fr_a4_scene9: {
    id: "fr_a4_scene9",
    background: "assets/flash_royale/bg_airport_gate.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "klaus3", text: "Это было слишком легко!" ,
voice: "assets/voices/flash-royale/fr_a4_scene6_1.mp3",
},
{ speaker: "narrator", text: "Он убирает телефон в карман и направляется к выходу на посадку." ,
voice: "assets/voices/flash-royale/fr_a4_scene6_1.mp3",
},
    ],
    next: "fr_end_fail",
  },

  fr_end_fail: {
    id: "fr_end_fail",
    background: "assets/common/bg_hq.lossless.webp",
    phase: "Финал · Итог",
    progress: "Исход: Провал",
    ending: true,
    lines: [
      { speaker: "mentor", text: "Ты слишком быстро согласился на передачу секретного документа, что позволило объекту понять, что ты действуешь под контролем." ,
voice: "assets/voices/flash-royale/fr_end_success_1.mp3",
},
      { speaker: "narrator", text: "Клаус прекратил контакты и покинул страну." ,
voice: "assets/voices/flash-royale/fr_end_success_2.mp3",
},
      {
        speaker: "mentor",
        text:
          "Разведчики проигрывают не потому, что их ловят.\n" +
          "А потому, что в какой-то момент они верят, что всё рассчитали.",
        voice: "assets/voices/flash-royale/fr_end_success_3.mp3",
      },
      { speaker: "mentor", text: "Твоя работа не заканчивается на этом. Теперь ты знаешь больше, чем раньше. Используй это." ,
voice: "assets/voices/flash-royale/fr_end_success_4.mp3",
},
    ],
  },

  fr_end_neutral: {
    id: "fr_end_neutral",
    background: "assets/common/bg_hq.lossless.webp",
    phase: "Финал · Итог",
    progress: "Исход: Провал",
    ending: true,
    lines: [
      { speaker: "mentor", text: "Ты отказался продолжать сотрудничать с Клаусом, от чего он вскоре и вовсе перестал просить что либо." ,
voice: "assets/voices/flash-royale/fr_end_success_1.mp3",
},
      { speaker: "narrator", text: "Клаус прекратил контакты с тобой, но возможно держит связь с другими, риск для утечки данных остается." ,
voice: "assets/voices/flash-royale/fr_end_success_2.mp3",
},
    ],
  },


  fr_a4_scene4: {
    id: "fr_a4_scene4",
    background: "assets/flash_royale/bg_mfa_desk_workday_end.webp",
    phase: "Финал · Зависимость",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Звонок куратору, ты обьяснил все что происходило. Ваше ведомство начало подготовку." ,
voice: "assets/voices/flash-royale/fr_a4_scene4_1.mp3",
},
    ],
    next: "fr_a4_key_after",
  },

  fr_a4_key_after: {
    id: "fr_a4_key_after",
    background: "assets/flash_royale/bg_mfa_desk_workday_end.webp",
    phase: "Финал · Формула",
    progress: "Акт 4 / 4",
    lines: [
        { speaker: "narrator", text: "Пройдя все согласования вы подготавливаете муляж документа для передачи его Клаусу." ,
voice: "assets/voices/flash-royale/fr_a4_key_after_1.mp3",
},
        { speaker: "mentor", text: "Самое главное чтобы все шло по его ожиданиям. Веди себя естественно, будь осторожен и не выдай нас раньше времени." ,
voice: "assets/voices/flash-royale/fr_a4_key_after_2.mp3",
}],
    next: "fr_a4_hourx",
  },

  fr_a4_hourx: {
    id: "fr_a4_hourx",
    background: "assets/flash_royale/bg_outdoors_night.webp",
    phase: "Финал · Час Икс",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Окраина города. Ночь. Тишина." ,
voice: "assets/voices/flash-royale/fr_a4_hourx_1.mp3",
},
      { speaker: "narrator", text: "Клаус подошел к тебе и, назвав пароль, начал беседу. Как и прежде, он выглядел уверенным в себе. Свет фар проезжающих автомобилей освещал его мужественные черты лица и светившиеся от предвкушения скорой победы глаза." ,
voice: "assets/voices/flash-royale/fr_a4_hourx_2.mp3",
},
    ],
    next: "fr_a4_hourx1",
  },

  fr_a4_hourx1: {
    id: "fr_a4_hourx1",
    background: "assets/flash_royale/transfer.webp",
    // Промпт: City outskirts at night, headlights, cold air, tense silence, cinematic 2.5D, 16:9
    phase: "Финал · Час Икс",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Ты передаешь ему муляж документа. В момент, когда он с жадностью читал переданный ему документ, казалось бы, ниоткуда появились группы захвата. Яркий свет заранее установленных и замаскированных софитов резко осветил окрестность." ,
voice: "assets/voices/flash-royale/fr_a4_hourx1_1.mp3",
},
    ],
    next: "fr_a4_hourx2",
  },

  fr_a4_hourx2: {
    id: "fr_a4_hourx2",
    background: "assets/flash_royale/bg_outskirts_night_fall.png",
    // Промпт: City outskirts at night, headlights, cold air, tense silence, cinematic 2.5D, 16:9
    phase: "Финал · Час Икс",
    progress: "Акт 4 / 4",
    lines: [
      { speaker: "narrator", text: "Документ выпадает из рук Клауса." ,
voice: "assets/voices/flash-royale/fr_a4_hourx1_1.mp3",
},
      { speaker: "narrator", text: "Он был ошеломлен происходящим, присущие ему самоуверенность и харизма испарились, в растерянном взгляде читались недоумение и шок." ,
voice: "assets/voices/flash-royale/fr_a4_hourx1_1.mp3",
},
      { speaker: "mentor", text: "Работа завершена." ,
voice: "assets/voices/flash-royale/fr_a4_hourx1_2.mp3",
},
    ],
    next: "fr_end_success",
    effects: { outcome: "success" },
  },

  fr_end_success: {
    id: "fr_end_success",
    background: "assets/flash_royale/bg_success.webp",
    phase: "Финал · Итог",
    progress: "Исход: Успех",
    ending: true,
    lines: [
      { speaker: "narrator", text: "Постфактум: Клаус — персона нон грата. 48 часов на выезд. Дело закрыто." ,
voice: "assets/voices/flash-royale/fr_end_success_1.mp3",
},
      { speaker: "narrator", text: "Ты видишь его уже не как образ — а как уставшего, растерянного человека." ,
voice: "assets/voices/flash-royale/fr_end_success_2.mp3",
},
      {
        speaker: "mentor",
        text:
          "Разведчики проигрывают не потому, что их ловят.\n" +
          "А потому, что в какой-то момент они верят, что всё рассчитали.",
        voice: "assets/voices/flash-royale/fr_end_success_3.mp3",
      },
      { speaker: "mentor", text: "Твоя работа не заканчивается на задержании. Теперь тебе доверяют больше, чем вчера. Используй это." ,
voice: "assets/voices/flash-royale/fr_end_success_4.mp3",
},
    ],
  },
};
