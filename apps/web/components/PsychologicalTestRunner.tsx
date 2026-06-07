"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock3, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { primaryPsychologicalSections, type PrimaryPsychologicalQuestion } from "@/lib/primary-psychological-test";
import { getMe } from "@/lib/auth";

type TestSlug = "primary-selection" | "attention" | "memory" | "logic" | "stress-resilience";

type Question = {
  prompt: string;
  stimulus?: string;
  image?: string;
  options: Array<{
    text: string;
    score: number;
  }>;
};
type OpenQuestion = {
  prompt: string;
  stimulus?: string;
  image?: string;
  options?: never;
};

type RunnerQuestion = Question | OpenQuestion;
type TestBank = Record<Exclude<TestSlug, "primary-selection">, Question[]>;

const testBanks: Record<Locale, TestBank> = {
  ru: {
    attention: [
      {
        prompt: "В ряду 7842 7842 7842 7482 7842 найдите отличающуюся группу.",
        options: [
          { text: "7842", score: 0 },
          { text: "7482", score: 1 },
          { text: "7824", score: 0 },
          { text: "8742", score: 0 }
        ]
      },
      {
        prompt: "Какая пара символов отличается от остальных: AB-12, AB-12, AВ-12, AB-21?",
        options: [
          { text: "AB-12", score: 0 },
          { text: "AВ-12", score: 0 },
          { text: "AB-21", score: 1 },
          { text: "Все одинаковые", score: 0 }
        ]
      },
      {
        prompt: "Сколько раз встречается число 6: 263 619 846 106 652?",
        options: [
          { text: "3", score: 0 },
          { text: "4", score: 0 },
          { text: "5", score: 1 },
          { text: "6", score: 0 }
        ]
      },
      {
        prompt: "Выберите строку без ошибки: КНБ-2048, КНВ-2048, КНБ-2408, КНБ-204B.",
        options: [
          { text: "КНБ-2048", score: 1 },
          { text: "КНВ-2048", score: 0 },
          { text: "КНБ-2408", score: 0 },
          { text: "КНБ-204B", score: 0 }
        ]
      },
      {
        prompt: "Какая буква пропущена в последовательности А Б В Г _ Е?",
        options: [
          { text: "Д", score: 1 },
          { text: "Ж", score: 0 },
          { text: "З", score: 0 },
          { text: "И", score: 0 }
        ]
      }
    ],
    memory: [
      {
        prompt: "Запомните набор: Астана, щит, 47, синий. Какое число было в наборе?",
        options: [
          { text: "37", score: 0 },
          { text: "47", score: 1 },
          { text: "74", score: 0 },
          { text: "57", score: 0 }
        ]
      },
      {
        prompt: "Последовательность: 9-2-6-4. Выберите правильный порядок.",
        options: [
          { text: "9-2-6-4", score: 1 },
          { text: "9-6-2-4", score: 0 },
          { text: "2-9-6-4", score: 0 },
          { text: "9-2-4-6", score: 0 }
        ]
      },
      {
        prompt: "Пара была: ключ - дверь. Какое слово соответствовало слову ключ?",
        options: [
          { text: "окно", score: 0 },
          { text: "дверь", score: 1 },
          { text: "карта", score: 0 },
          { text: "сигнал", score: 0 }
        ]
      },
      {
        prompt: "Запомните: север, 18, рация. Какой предмет был указан?",
        options: [
          { text: "компас", score: 0 },
          { text: "рация", score: 1 },
          { text: "фонарь", score: 0 },
          { text: "карта", score: 0 }
        ]
      },
      {
        prompt: "Цвета шли так: зеленый, белый, золотой. Какой цвет был вторым?",
        options: [
          { text: "зеленый", score: 0 },
          { text: "белый", score: 1 },
          { text: "золотой", score: 0 },
          { text: "синий", score: 0 }
        ]
      }
    ],
    logic: [
      {
        prompt: "Продолжите ряд: 2, 4, 8, 16, ...",
        options: [
          { text: "20", score: 0 },
          { text: "24", score: 0 },
          { text: "32", score: 1 },
          { text: "36", score: 0 }
        ]
      },
      {
        prompt: "Все аналитики внимательны. Некоторые внимательные сотрудники работают с документами. Что следует точно?",
        options: [
          { text: "Все аналитики работают с документами", score: 0 },
          { text: "Некоторые сотрудники внимательны", score: 1 },
          { text: "Документы не требуют внимания", score: 0 },
          { text: "Нельзя сделать ни одного вывода", score: 0 }
        ]
      },
      {
        prompt: "Если А больше Б, а Б больше В, то...",
        options: [
          { text: "В больше А", score: 0 },
          { text: "А больше В", score: 1 },
          { text: "А равно В", score: 0 },
          { text: "сравнить нельзя", score: 0 }
        ]
      },
      {
        prompt: "Найдите лишнее: граница, режим, связь, яблоко.",
        options: [
          { text: "граница", score: 0 },
          { text: "режим", score: 0 },
          { text: "связь", score: 0 },
          { text: "яблоко", score: 1 }
        ]
      },
      {
        prompt: "Код строится по правилу: А=1, Б=2, В=3. Чему равно АВБ?",
        options: [
          { text: "132", score: 1 },
          { text: "123", score: 0 },
          { text: "213", score: 0 },
          { text: "312", score: 0 }
        ]
      }
    ],
    "stress-resilience": [
      {
        prompt: "Во время срочной задачи поступает новая вводная. Что вы сделаете первым?",
        options: [
          { text: "Уточню приоритет и скорректирую план", score: 2 },
          { text: "Продолжу прежнюю задачу без изменений", score: 1 },
          { text: "Отложу обе задачи до полного прояснения", score: 0 },
          { text: "Передам задачу без объяснений", score: 0 }
        ]
      },
      {
        prompt: "Коллега резко критикует вашу работу при группе.",
        options: [
          { text: "Спокойно уточню конкретные замечания", score: 2 },
          { text: "Отвечу тем же тоном", score: 0 },
          { text: "Полностью прекращу обсуждение", score: 1 },
          { text: "Игнорирую все замечания", score: 0 }
        ]
      },
      {
        prompt: "Срок короткий, информации недостаточно.",
        options: [
          { text: "Выделю известные факты, риски и варианты решения", score: 2 },
          { text: "Буду ждать полной информации", score: 1 },
          { text: "Приму первое решение без проверки", score: 0 },
          { text: "Откажусь от задачи", score: 0 }
        ]
      },
      {
        prompt: "После ошибки нужно быстро восстановить работу.",
        options: [
          { text: "Зафиксирую ошибку, устраню причину и сообщу статус", score: 2 },
          { text: "Скрою ошибку, если ее не заметили", score: 0 },
          { text: "Буду искать виновного до исправления", score: 0 },
          { text: "Исправлю молча без анализа причины", score: 1 }
        ]
      },
      {
        prompt: "В течение дня несколько задач конкурируют за внимание.",
        options: [
          { text: "Расставлю приоритеты по срочности и последствиям", score: 2 },
          { text: "Начну с самой простой задачи", score: 1 },
          { text: "Буду переключаться без плана", score: 0 },
          { text: "Отложу сложные задачи на неопределенный срок", score: 0 }
        ]
      }
    ]
  },
  kk: {
    attention: [
      {
        prompt: "7842 7842 7842 7482 7842 қатарынан өзгеше топты табыңыз.",
        options: [
          { text: "7842", score: 0 },
          { text: "7482", score: 1 },
          { text: "7824", score: 0 },
          { text: "8742", score: 0 }
        ]
      },
      {
        prompt: "Қай жұп өзгеше: AB-12, AB-12, AВ-12, AB-21?",
        options: [
          { text: "AB-12", score: 0 },
          { text: "AВ-12", score: 0 },
          { text: "AB-21", score: 1 },
          { text: "Барлығы бірдей", score: 0 }
        ]
      },
      {
        prompt: "6 саны неше рет кездеседі: 263 619 846 106 652?",
        options: [
          { text: "3", score: 0 },
          { text: "4", score: 0 },
          { text: "5", score: 1 },
          { text: "6", score: 0 }
        ]
      },
      {
        prompt: "Қатесіз жолды таңдаңыз: ҰҚК-2048, ҰҚК-2408, ҰҚҚ-2048, ҰҚК-204B.",
        options: [
          { text: "ҰҚК-2048", score: 1 },
          { text: "ҰҚК-2408", score: 0 },
          { text: "ҰҚҚ-2048", score: 0 },
          { text: "ҰҚК-204B", score: 0 }
        ]
      },
      {
        prompt: "А Ә Б В _ Ғ реттілігінде қандай әріп жетіспейді?",
        options: [
          { text: "Г", score: 1 },
          { text: "Д", score: 0 },
          { text: "Е", score: 0 },
          { text: "Ж", score: 0 }
        ]
      }
    ],
    memory: [
      {
        prompt: "Жинақты есте сақтаңыз: Астана, қалқан, 47, көк. Қай сан болды?",
        options: [
          { text: "37", score: 0 },
          { text: "47", score: 1 },
          { text: "74", score: 0 },
          { text: "57", score: 0 }
        ]
      },
      {
        prompt: "Реттілік: 9-2-6-4. Дұрыс тәртіпті таңдаңыз.",
        options: [
          { text: "9-2-6-4", score: 1 },
          { text: "9-6-2-4", score: 0 },
          { text: "2-9-6-4", score: 0 },
          { text: "9-2-4-6", score: 0 }
        ]
      },
      {
        prompt: "Жұп: кілт - есік. Кілт сөзіне қай сөз сәйкес болды?",
        options: [
          { text: "терезе", score: 0 },
          { text: "есік", score: 1 },
          { text: "карта", score: 0 },
          { text: "сигнал", score: 0 }
        ]
      },
      {
        prompt: "Есте сақтаңыз: солтүстік, 18, рация. Қай зат көрсетілді?",
        options: [
          { text: "компас", score: 0 },
          { text: "рация", score: 1 },
          { text: "шам", score: 0 },
          { text: "карта", score: 0 }
        ]
      },
      {
        prompt: "Түстер реті: жасыл, ақ, алтын. Екінші түс қандай?",
        options: [
          { text: "жасыл", score: 0 },
          { text: "ақ", score: 1 },
          { text: "алтын", score: 0 },
          { text: "көк", score: 0 }
        ]
      }
    ],
    logic: [
      {
        prompt: "Қатарды жалғастырыңыз: 2, 4, 8, 16, ...",
        options: [
          { text: "20", score: 0 },
          { text: "24", score: 0 },
          { text: "32", score: 1 },
          { text: "36", score: 0 }
        ]
      },
      {
        prompt: "Барлық талдаушылар мұқият. Кейбір мұқият қызметкерлер құжатпен жұмыс істейді. Қандай қорытынды нақты?",
        options: [
          { text: "Барлық талдаушылар құжатпен жұмыс істейді", score: 0 },
          { text: "Кейбір қызметкерлер мұқият", score: 1 },
          { text: "Құжат назарды қажет етпейді", score: 0 },
          { text: "Еш қорытынды жасауға болмайды", score: 0 }
        ]
      },
      {
        prompt: "Егер А Б-дан үлкен, ал Б В-дан үлкен болса...",
        options: [
          { text: "В А-дан үлкен", score: 0 },
          { text: "А В-дан үлкен", score: 1 },
          { text: "А В-ға тең", score: 0 },
          { text: "салыстыру мүмкін емес", score: 0 }
        ]
      },
      {
        prompt: "Артық сөзді табыңыз: шекара, режим, байланыс, алма.",
        options: [
          { text: "шекара", score: 0 },
          { text: "режим", score: 0 },
          { text: "байланыс", score: 0 },
          { text: "алма", score: 1 }
        ]
      },
      {
        prompt: "Код ережесі: А=1, Ә=2, Б=3. АБӘ мәні қандай?",
        options: [
          { text: "132", score: 1 },
          { text: "123", score: 0 },
          { text: "213", score: 0 },
          { text: "312", score: 0 }
        ]
      }
    ],
    "stress-resilience": [
      {
        prompt: "Шұғыл тапсырма кезінде жаңа мәлімет түсті. Алдымен не істейсіз?",
        options: [
          { text: "Басымдықты нақтылап, жоспарды түзетемін", score: 2 },
          { text: "Бұрынғы тапсырманы өзгеріссіз жалғастырамын", score: 1 },
          { text: "Екі тапсырманы да толық анықталғанша тоқтатамын", score: 0 },
          { text: "Тапсырманы түсіндірмей басқаға беремін", score: 0 }
        ]
      },
      {
        prompt: "Әріптесіңіз жұмысыңызды топ алдында қатты сынады.",
        options: [
          { text: "Нақты ескертулерді сабырмен нақтылаймын", score: 2 },
          { text: "Сол тонмен жауап беремін", score: 0 },
          { text: "Талқылауды толық тоқтатамын", score: 1 },
          { text: "Барлық ескертуді елемеймін", score: 0 }
        ]
      },
      {
        prompt: "Уақыт аз, ақпарат толық емес.",
        options: [
          { text: "Белгілі фактілерді, тәуекелдерді және шешімдерді бөлемін", score: 2 },
          { text: "Толық ақпаратты күтемін", score: 1 },
          { text: "Бірінші шешімді тексермей қабылдаймын", score: 0 },
          { text: "Тапсырмадан бас тартамын", score: 0 }
        ]
      },
      {
        prompt: "Қателіктен кейін жұмысты тез қалпына келтіру керек.",
        options: [
          { text: "Қатені тіркеп, себебін жойып, мәртебені хабарлаймын", score: 2 },
          { text: "Байқалмаса, қатені жасырамын", score: 0 },
          { text: "Алдымен кінәліні іздеймін", score: 0 },
          { text: "Себебін талдамай үнсіз түзетемін", score: 1 }
        ]
      },
      {
        prompt: "Күні бойы бірнеше тапсырма назарға таласады.",
        options: [
          { text: "Шұғылдығы мен салдары бойынша басымдық қоямын", score: 2 },
          { text: "Ең оңай тапсырмадан бастаймын", score: 1 },
          { text: "Жоспарсыз ауыса беремін", score: 0 },
          { text: "Күрделі тапсырмаларды белгісіз мерзімге қалдырамын", score: 0 }
        ]
      }
    ]
  }
};

const copy = {
  ru: {
    title: "Базовый тест",
    note: "Результат является справочным и не заменяет официальную оценку специалиста.",
    question: "Вопрос",
    complete: "Завершить тест",
    restart: "Пройти заново",
    choose: "Выберите один вариант ответа.",
    answer: "Ваш ответ",
    answerPlaceholder: "Введите ответ",
    score: "Результат",
    submitted: "Ответы заполнены",
    submittedText: "Первые 50 заданий импортированы из документа. Автоматическая оценка будет включена после добавления ключей ответов.",
    low: "Есть зоны для тренировки. Повторите базовые упражнения и попробуйте пройти тест позже.",
    medium: "Хороший базовый уровень. Для устойчивого результата продолжайте регулярную самопроверку.",
    high: "Высокий результат в рамках демо-теста. Поддерживайте навык регулярной практикой."
  },
  kk: {
    title: "Базалық тест",
    note: "Нәтиже анықтамалық сипатта және маманның ресми бағалауын алмастырмайды.",
    question: "Сұрақ",
    complete: "Тестті аяқтау",
    restart: "Қайта өту",
    choose: "Бір жауап нұсқасын таңдаңыз.",
    answer: "Жауабыңыз",
    answerPlaceholder: "Жауапты енгізіңіз",
    score: "Нәтиже",
    submitted: "Жауаптар толтырылды",
    submittedText: "Алғашқы 50 тапсырма құжаттан импортталды. Автоматты бағалау жауап кілттері қосылғаннан кейін іске қосылады.",
    low: "Жаттығуды қажет ететін аймақтар бар. Негізгі тапсырмаларды қайталап, кейін қайта өтіп көріңіз.",
    medium: "Базалық деңгей жақсы. Тұрақты нәтиже үшін өзін-өзі тексеруді жалғастырыңыз.",
    high: "Демо-тест аясында жоғары нәтиже. Дағдыны тұрақты тәжірибемен сақтаңыз."
  }
};

const primaryCopy = {
  ru: {
    testTitle: "Первичный психологический тест",
    section: "Раздел",
    question: "Вопрос",
    questions: "Вопросы",
    of: "из",
    timer: "Осталось",
    instructions: "Инструкция",
    timerPaused: "Таймер начнется после перехода к вопросам этого раздела.",
    startSection: "Начать раздел",
    nextTen: "Следующие 10 вопросов",
    previousTen: "Предыдущие 10 вопросов",
    nextSection: "Следующий раздел",
    finish: "Завершить тестирование",
    finished: "Тестирование завершено",
    finishedText: "Ответы сохранены в текущей сессии. Передача результатов в личный кабинет будет подключена после серверного сохранения результатов.",
    checkingAuth: "Проверяем вход",
    authRequired: "Для прохождения теста нужен вход",
    authRequiredText: "Психологическое тестирование доступно только пользователям, которые вошли на портал. Войдите через Telegram или почту, затем вернитесь к тесту.",
    login: "Войти",
    incompletePage: "Ответьте на все вопросы этой страницы, чтобы перейти дальше.",
    textAnswer: "Ваш ответ",
    textPlaceholder: "Введите ответ",
    sectionInstructions: {
      numeric: [
        "В этом разделе 50 заданий на числовые закономерности, пропущенные числа и логические связи.",
        "Введите ответ в поле под заданием. Если на изображении требуется несколько чисел, укажите их в одном поле через пробел или запятую.",
        "Раздел разбит на страницы по 10 вопросов. Переход дальше доступен после заполнения всех вопросов текущей страницы."
      ],
      visual: [
        "В этом разделе 50 заданий с фигурами и наглядными закономерностями.",
        "Выберите номер фигуры или несколько номеров, если в формулировке требуется указать две или три лишние фигуры.",
        "Внимательно смотрите на изображение: варианты ответа находятся внутри самого задания."
      ],
      memory: ["Раздел на память будет добавлен отдельным этапом."],
      interpretation: ["Итоговая интерпретация будет включена после добавления ключей и шкал оценки."]
    }
  },
  kk: {
    testTitle: "Бастапқы психологиялық тест",
    section: "Бөлім",
    question: "Сұрақ",
    questions: "Сұрақтар",
    of: "ішінен",
    timer: "Қалды",
    instructions: "Нұсқаулық",
    timerPaused: "Таймер осы бөлімнің сұрақтарына өткеннен кейін басталады.",
    startSection: "Бөлімді бастау",
    nextTen: "Келесі 10 сұрақ",
    previousTen: "Алдыңғы 10 сұрақ",
    nextSection: "Келесі бөлім",
    finish: "Тестілеуді аяқтау",
    finished: "Тестілеу аяқталды",
    finishedText: "Жауаптар ағымдағы сессияда сақталды. Нәтижелерді жеке кабинетке жіберу серверлік сақтау қосылғаннан кейін іске асады.",
    checkingAuth: "Кіру тексерілуде",
    authRequired: "Тесттен өту үшін кіру қажет",
    authRequiredText: "Психологиялық тестілеу порталға кірген пайдаланушыларға ғана қолжетімді. Telegram немесе пошта арқылы кіріп, тестке қайта оралыңыз.",
    login: "Кіру",
    incompletePage: "Әрі қарай өту үшін осы беттегі барлық сұраққа жауап беріңіз.",
    textAnswer: "Жауабыңыз",
    textPlaceholder: "Жауапты енгізіңіз",
    sectionInstructions: {
      numeric: [
        "Бұл бөлімде сандық заңдылықтар, жетіспейтін сандар және логикалық байланыстар бойынша 50 тапсырма бар.",
        "Жауапты тапсырма астындағы өріске енгізіңіз. Егер суретте бірнеше сан керек болса, оларды бір өріске бос орынмен немесе үтірмен жазыңыз.",
        "Бөлім 10 сұрақтан тұратын беттерге бөлінген. Келесі бетке өту ағымдағы беттегі барлық сұрақ толтырылғаннан кейін қолжетімді."
      ],
      visual: [
        "Бұл бөлімде фигуралар және көрнекі заңдылықтар бойынша 50 тапсырма бар.",
        "Егер тұжырымда екі немесе үш артық фигураны көрсету қажет болса, бір немесе бірнеше нөмірді таңдаңыз.",
        "Суретке мұқият қараңыз: жауап нұсқалары тапсырманың ішінде орналасқан."
      ],
      memory: ["Жад бөлімі бөлек кезеңде қосылады."],
      interpretation: ["Қорытынды интерпретация жауап кілттері мен бағалау шкалалары қосылғаннан кейін іске қосылады."]
    }
  }
};

const PRIMARY_TEST_SECONDS = 60 * 60;
const PRIMARY_PAGE_SIZE = 10;

export function PsychologicalTestRunner({ locale, slug }: { locale: Locale; slug: string }) {
  if (slug === "primary-selection") {
    return <PrimarySelectionRunner locale={locale} />;
  }

  const questions: RunnerQuestion[] = slug === "primary-selection"
    ? []
    : testBanks[locale][slug as Exclude<TestSlug, "primary-selection">] ?? [];
  const t = copy[locale];
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const hasScoredOptions = questions.some((question) => "options" in question && Array.isArray(question.options));

  const maxScore = useMemo(
    () => questions.reduce((sum, question) => {
      if (!("options" in question) || !question.options) return sum;
      return sum + Math.max(...question.options.map((option) => option.score));
    }, 0),
    [questions]
  );
  const score = questions.reduce((sum, question, index) => {
    const answerIndex = answers[index];
    if (!("options" in question) || !question.options) return sum;
    return sum + (typeof answerIndex === "number" ? question.options[answerIndex]?.score ?? 0 : 0);
  }, 0);
  const answeredCount = questions.filter((_, index) => {
    const value = answers[index];
    return typeof value === "number" || (typeof value === "string" && value.trim().length > 0);
  }).length;
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const resultText = percent >= 80 ? t.high : percent >= 50 ? t.medium : t.low;

  function restart() {
    setAnswers({});
    setIsComplete(false);
  }

  if (!questions.length) return null;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(6,24,45,0.07)]">
      <div className="border-b border-slate-200 bg-[#f7fbf9] p-6 md:p-8">
        <h2 className="text-3xl font-bold text-state-navy">{t.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.note}</p>
      </div>

      <div className="grid gap-4 p-6 md:p-8">
        {questions.map((question, questionIndex) => (
          <fieldset key={`${question.prompt}-${questionIndex}`} className="rounded-2xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-bold uppercase tracking-[0.16em] text-state-tealDark">
              {t.question} {questionIndex + 1}
            </legend>
            <p className="mt-3 text-lg font-bold leading-7 text-state-navy">{question.prompt}</p>
            {question.stimulus ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-xl font-bold tracking-wide text-state-navy">{question.stimulus}</p> : null}
            {question.image ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img src={question.image} alt={`${t.question} ${questionIndex + 1}`} className="mx-auto max-h-[22rem] w-auto max-w-full object-contain" />
              </div>
            ) : null}
            {"options" in question && question.options ? (
              <>
                <p className="mt-2 text-sm text-slate-500">{t.choose}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[questionIndex] === optionIndex;
                    return (
                      <button
                        key={option.text}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                          selected
                            ? "border-state-teal bg-state-teal/10 text-state-navy"
                            : "border-slate-200 bg-white text-slate-600 hover:border-state-teal/40 hover:bg-state-teal/5"
                        )}
                        aria-pressed={selected}
                      >
                        {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-state-tealDark" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <label className="mt-4 grid gap-2 text-sm font-semibold text-state-navy">
                {t.answer}
                <input
                  value={typeof answers[questionIndex] === "string" ? answers[questionIndex] : ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [questionIndex]: event.target.value }))}
                  className="min-h-12 rounded-xl border border-slate-200 px-4 text-base font-semibold outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10"
                  placeholder={t.answerPlaceholder}
                />
              </label>
            )}
          </fieldset>
        ))}
      </div>

      <div className="grid gap-4 border-t border-slate-200 bg-[#f7fbf9] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        {isComplete && hasScoredOptions ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-gold">{t.score}</p>
            <p className="mt-2 text-4xl font-bold text-state-navy">{percent}%</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{resultText}</p>
          </div>
        ) : isComplete ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-state-gold">{t.submitted}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t.submittedText}</p>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-600">
            {answeredCount} / {questions.length}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {isComplete ? (
            <button type="button" onClick={restart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-state-teal/25 bg-white px-5 py-3 text-sm font-semibold text-state-tealDark transition hover:border-state-gold/50 hover:text-state-navy">
              <RotateCcw className="h-4 w-4" />
              {t.restart}
            </button>
          ) : (
            <button
              type="button"
              disabled={answeredCount < questions.length}
              onClick={() => setIsComplete(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.complete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimarySelectionRunner({ locale }: { locale: Locale }) {
  const t = primaryCopy[locale];
  const readySections = primaryPsychologicalSections.filter((section) => section.status === "ready");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<"instructions" | "questions" | "finished">("instructions");
  const [authStatus, setAuthStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [remainingSeconds, setRemainingSeconds] = useState(PRIMARY_TEST_SECONDS);
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const activeSection = readySections[sectionIndex] ?? readySections[0];
  const activeAnswers = sectionAnswers[activeSection.id] ?? {};
  const totalQuestions = readySections.reduce((sum, section) => sum + section.questions.length, 0);
  const completedBeforeActive = readySections.slice(0, sectionIndex).reduce((sum, section) => sum + section.questions.length, 0);
  const pageStart = pageIndex * PRIMARY_PAGE_SIZE;
  const pageQuestions = activeSection.questions.slice(pageStart, pageStart + PRIMARY_PAGE_SIZE);
  const pageEnd = pageStart + pageQuestions.length;
  const totalPages = Math.ceil(activeSection.questions.length / PRIMARY_PAGE_SIZE);
  const pageAnsweredCount = pageQuestions.filter((question) => {
    const answer = activeAnswers[question.id];
    return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim().length > 0;
  }).length;
  const answeredTotal = readySections.reduce((sum, section) => {
    const answers = sectionAnswers[section.id] ?? {};
    return sum + section.questions.filter((question) => {
      const answer = answers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim().length > 0;
    }).length;
  }, 0);
  const isPageComplete = pageQuestions.length > 0 && pageAnsweredCount === pageQuestions.length;
  const isLastPage = pageIndex >= totalPages - 1;
  const isLastSection = sectionIndex >= readySections.length - 1;

  useEffect(() => {
    let active = true;
    getMe()
      .then(() => {
        if (active) setAuthStatus("allowed");
      })
      .catch(() => {
        if (active) setAuthStatus("denied");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "allowed" || mode !== "questions") return;
    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          setMode("finished");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [authStatus, mode]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingSeconds]);

  function setQuestionAnswer(question: PrimaryPsychologicalQuestion, value: string) {
    setSectionAnswers((current) => {
      const currentSection = current[activeSection.id] ?? {};
      if (question.answerMode === "multi") {
        const currentValues = Array.isArray(currentSection[question.id]) ? currentSection[question.id] as string[] : [];
        const nextValues = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value];
        return { ...current, [activeSection.id]: { ...currentSection, [question.id]: nextValues } };
      }
      return { ...current, [activeSection.id]: { ...currentSection, [question.id]: value } };
    });
  }

  function goNext() {
    if (!isPageComplete) return;
    if (!isLastPage) {
      setPageIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!isLastSection) {
      setSectionIndex((current) => current + 1);
      setPageIndex(0);
      setMode("instructions");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMode("finished");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPreviousPage() {
    setPageIndex((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center">
          <section className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.testTitle}</p>
            <h1 className="mt-4 text-3xl font-bold text-state-navy">{t.checkingAuth}</h1>
          </section>
        </div>
      </div>
    );
  }

  if (authStatus === "denied") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center">
          <section className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.testTitle}</p>
            <h1 className="mt-4 text-3xl font-bold text-state-navy md:text-4xl">{t.authRequired}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{t.authRequiredText}</p>
            <div className="mt-8">
              <Link
                href={`/${locale}/login`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark"
              >
                {t.login}
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (mode === "finished") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center">
          <section className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.testTitle}</p>
            <h1 className="mt-4 text-4xl font-bold text-state-navy">{t.finished}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{t.finishedText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.questions}</p>
                <p className="mt-2 text-3xl font-bold">{answeredTotal}/{totalQuestions}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.timer}</p>
                <p className="mt-2 text-3xl font-bold">{formattedTime}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.section}</p>
                <p className="mt-2 text-3xl font-bold">{Math.min(sectionIndex + 1, readySections.length)}/{readySections.length}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (mode === "instructions") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center">
          <section className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(6,24,45,0.08)]">
            <div className="border-b border-slate-200 bg-[#f7fbf9] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.instructions}</p>
                  <h1 className="mt-3 text-3xl font-bold text-state-navy md:text-4xl">{activeSection.title}</h1>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-state-navy shadow-sm">
                  <Clock3 className="h-4 w-4 text-state-tealDark" />
                  {t.timer}: {formattedTime}
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{activeSection.description}</p>
              <p className="mt-2 text-sm font-semibold text-state-tealDark">{t.timerPaused}</p>
            </div>

            <div className="grid gap-4 p-6 md:p-8">
              {t.sectionInstructions[activeSection.id].map((instruction, index) => (
                <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5" key={instruction}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-state-navy text-sm font-bold text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-700">{instruction}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-[#f7fbf9] p-6 md:p-8">
              <p className="text-sm font-semibold text-slate-600">
                {t.section} {sectionIndex + 1} {t.of} {readySections.length}
              </p>
              <button
                type="button"
                onClick={() => setMode("questions")}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark"
              >
                {t.startSection}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7f6] text-state-navy">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-state-tealDark">
              {t.section} {sectionIndex + 1} {t.of} {readySections.length}
            </p>
            <h1 className="text-lg font-bold text-state-navy md:text-xl">{activeSection.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-state-navy">
              {t.questions} {completedBeforeActive + pageStart + 1}-{completedBeforeActive + pageEnd} {t.of} {totalQuestions}
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-state-navy px-4 py-2 text-sm font-bold text-white">
              <Clock3 className="h-4 w-4 text-state-gold" />
              {formattedTime}
            </div>
            <button
              type="button"
              onClick={() => setMode("finished")}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
            >
              {t.finish}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:px-8">
        {pageQuestions.map((question, questionIndex) => {
          const absoluteQuestionNumber = pageStart + questionIndex + 1;
          const answer = activeAnswers[question.id];
          return (
            <fieldset key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <legend className="px-1 text-sm font-bold uppercase tracking-[0.16em] text-state-tealDark">
                {t.question} {absoluteQuestionNumber}
              </legend>
              <p className="mt-3 text-lg font-bold leading-7 text-state-navy">{question.prompt}</p>
              {question.stimulus ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-xl font-bold tracking-wide text-state-navy">{question.stimulus}</p> : null}
              {question.image ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img src={question.image} alt={`${t.question} ${absoluteQuestionNumber}`} className="mx-auto max-h-[24rem] w-auto max-w-full object-contain" />
                </div>
              ) : null}

              {question.choices?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.choices.map((choice) => {
                    const selected = Array.isArray(answer) ? answer.includes(choice) : answer === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setQuestionAnswer(question, choice)}
                        className={cn(
                          "grid h-11 min-w-11 place-items-center rounded-xl border px-4 text-sm font-bold transition",
                          selected ? "border-state-teal bg-state-teal/10 text-state-navy" : "border-slate-200 bg-white text-slate-600 hover:border-state-teal/40"
                        )}
                        aria-pressed={selected}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <label className="mt-4 grid gap-2 text-sm font-semibold text-state-navy">
                  {t.textAnswer}
                  <input
                    value={typeof answer === "string" ? answer : ""}
                    onChange={(event) => setQuestionAnswer(question, event.target.value)}
                    className="min-h-12 rounded-xl border border-slate-200 px-4 text-base font-semibold outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10"
                    placeholder={t.textPlaceholder}
                  />
                </label>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-600">
            {pageAnsweredCount}/{pageQuestions.length}. {!isPageComplete ? t.incompletePage : null}
          </p>
          <div className="flex flex-wrap gap-3">
            {pageIndex > 0 ? (
              <button type="button" onClick={goPreviousPage} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-state-teal/25 bg-white px-5 py-3 text-sm font-semibold text-state-tealDark transition hover:border-state-gold/50 hover:text-state-navy">
                {t.previousTen}
              </button>
            ) : null}
            <button
              type="button"
              disabled={!isPageComplete}
              onClick={goNext}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!isLastPage ? t.nextTen : isLastSection ? t.finish : t.nextSection}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
