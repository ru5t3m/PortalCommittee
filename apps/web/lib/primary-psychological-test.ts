export type PrimaryPsychologicalQuestion = {
  id: string;
  prompt: string;
  stimulus?: string;
  image?: string;
  answerMode?: "text" | "single" | "multi";
  choices?: string[];
};
export type PrimaryPsychologicalSection = {
  id: "numeric" | "visual" | "verbal";
  title: string;
  description: string;
  questions: PrimaryPsychologicalQuestion[];
};

export const primaryPsychologicalSections: PrimaryPsychologicalSection[] = [
  {
    "id": "numeric",
    "title": "Числовые закономерности",
    "description": "50 заданий на числовые ряды, пропущенные числа и формально-логическое мышление.",
    "questions": [
      {
        "id": "q01",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "18 20 24 32 ?"
      },
      {
        "id": "q02",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q02.jpeg"
      },
      {
        "id": "q03",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "212 179 146 113 ?"
      },
      {
        "id": "q04",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q04.jpeg"
      },
      {
        "id": "q05",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "6 8 10 11 14 14 ?"
      },
      {
        "id": "q06",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "17 (112) 39 28 (   ) 49"
      },
      {
        "id": "q07",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "3 9 35 7 17 1 ?"
      },
      {
        "id": "q08",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "7 13 24 45 ?"
      },
      {
        "id": "q09",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "234 (333) 567 345 (   ) 678"
      },
      {
        "id": "q10",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "4 5 7 11 19 ?"
      },
      {
        "id": "q11",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q11.jpeg"
      },
      {
        "id": "q12",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "6 7 9 13 21 ?"
      },
      {
        "id": "q13",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "4 8 66 2 48 6 ?"
      },
      {
        "id": "q14",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "64 48 40 36 34 ?"
      },
      {
        "id": "q15",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q15.jpeg"
      },
      {
        "id": "q16",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "718 (26) 582 474 (   ) 226"
      },
      {
        "id": "q17",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "15 13 12 11 9 9 ?"
      },
      {
        "id": "q18",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "9 4 16 6 21 9 ?"
      },
      {
        "id": "q19",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "11 12 14 ? 26 42"
      },
      {
        "id": "q20",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "8 5 24 2 09 6 ?"
      },
      {
        "id": "q21",
        "prompt": "Вставьте пропущенное число.",
        "image": "/psychological-tests/primary-selection/q21.jpeg"
      },
      {
        "id": "q22",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "341 (250) 466 282 (   ) 398"
      },
      {
        "id": "q23",
        "prompt": "Вставьте пропущенное число.",
        "image": "/psychological-tests/primary-selection/q23.jpeg"
      },
      {
        "id": "q24",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "12 (336) 14 15 (   ) 16"
      },
      {
        "id": "q25",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "4 7 68 4 86 5 ?"
      },
      {
        "id": "q26",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "7 14 10 12 14 9 ?"
      },
      {
        "id": "q27",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q27.jpeg"
      },
      {
        "id": "q28",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "17 (102) 12 14 ( ) 11"
      },
      {
        "id": "q29",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "172 84 40 18 ?"
      },
      {
        "id": "q30",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "1 5 13 29 ?"
      },
      {
        "id": "q31",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q31.jpeg"
      },
      {
        "id": "q32",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q32.jpeg"
      },
      {
        "id": "q33",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "0 3 8 15 ?"
      },
      {
        "id": "q34",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "1 3 2 ? 3 7"
      },
      {
        "id": "q35",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "447 (366) 264 262 ( ) 521"
      },
      {
        "id": "q36",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q36.jpeg"
      },
      {
        "id": "q37",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "4 7 9 11 14 15 19 ?"
      },
      {
        "id": "q38",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q38.jpeg"
      },
      {
        "id": "q39",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "3 7 166 13 289 19 ?"
      },
      {
        "id": "q40",
        "prompt": "Вставьте недостающие числа.",
        "image": "/psychological-tests/primary-selection/q40.jpeg"
      },
      {
        "id": "q41",
        "prompt": "Вставьте пропущенное число.",
        "image": "/psychological-tests/primary-selection/q41.jpeg"
      },
      {
        "id": "q42",
        "prompt": "Вставьте пропущенное число.",
        "image": "/psychological-tests/primary-selection/q42.jpeg"
      },
      {
        "id": "q43",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q43.jpeg"
      },
      {
        "id": "q44",
        "prompt": "Вставьте пропущенное число.",
        "stimulus": "643 (111) 421 269 (   ) 491"
      },
      {
        "id": "q45",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "857 969 745 1193 ?"
      },
      {
        "id": "q46",
        "prompt": "Вставьте недостающее число.",
        "image": "/psychological-tests/primary-selection/q46.jpeg"
      },
      {
        "id": "q47",
        "prompt": "Вставьте пропущенные числа.",
        "stimulus": "9 (45) 8 18 (36) 64 10 (  ) ?"
      },
      {
        "id": "q48",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "7 19 37 61 ?"
      },
      {
        "id": "q49",
        "prompt": "Продолжите числовой ряд.",
        "stimulus": "5 41 149 329 ?"
      },
      {
        "id": "q50",
        "prompt": "Вставьте пропущенное число.",
        "image": "/psychological-tests/primary-selection/q50.jpeg"
      }
    ]
  },
  {
    "id": "visual",
    "title": "Наглядно-образные задания",
    "description": "50 заданий с фигурами: исключение лишней фигуры и выбор пропущенного элемента.",
    "questions": [
      {
        "id": "v01",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v01.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v02",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v02.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v03",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v03.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v04",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v04.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v05",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v05.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v06",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v06.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v07",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v07.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v08",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v08.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v09",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v09.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v10",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v10.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v11",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v11.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v12",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v12.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v13",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v13.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v14",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v14.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v15",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v15.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v16",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v16.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v17",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v17.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v18",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v18.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v19",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v19.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v20",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v20.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "v21",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v21.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v22",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v22.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v23",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v23.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v24",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v24.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v25",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v25.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v26",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v26.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v27",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v27.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v28",
        "prompt": "Вставьте пропущенную фигуру из четырех пронумерованных, имея в виду, что в верхнем ряду первая фигура относится ко второй так же, как третья к пропущенной.",
        "image": "/psychological-tests/primary-selection/v28.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v29",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v29.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v30",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v30.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v31",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v31.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v32",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v32.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "v33",
        "prompt": "Укажите лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v33.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "v34",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v34.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v35",
        "prompt": "Укажите лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v35.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "v36",
        "prompt": "Исключите лишнюю фигуру.",
        "image": "/psychological-tests/primary-selection/v36.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v37",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v37.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v38",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v38.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v39",
        "prompt": "Укажите две лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v39.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7"
        ]
      },
      {
        "id": "v40",
        "prompt": "Найдите три лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v40.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7"
        ]
      },
      {
        "id": "v41",
        "prompt": "Найдите три лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v41.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7"
        ]
      },
      {
        "id": "v42",
        "prompt": "Укажите две лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v42.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "v43",
        "prompt": "Исключите лишнюю фигурку.",
        "image": "/psychological-tests/primary-selection/v43.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8"
        ]
      },
      {
        "id": "v44",
        "prompt": "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
        "image": "/psychological-tests/primary-selection/v44.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4"
        ]
      },
      {
        "id": "v45",
        "prompt": "Найдите три лишние фигуры.",
        "image": "/psychological-tests/primary-selection/v45.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8"
        ]
      },
      {
        "id": "v46",
        "prompt": "Исключите лишнюю фигурку.",
        "image": "/psychological-tests/primary-selection/v46.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7"
        ]
      },
      {
        "id": "v47",
        "prompt": "Найдите три лишние фигурки.",
        "image": "/psychological-tests/primary-selection/v47.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ]
      },
      {
        "id": "v48",
        "prompt": "Найдите три лишние фигурки.",
        "image": "/psychological-tests/primary-selection/v48.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ]
      },
      {
        "id": "v49",
        "prompt": "Исключите лишнюю фигурку.",
        "image": "/psychological-tests/primary-selection/v49.jpeg",
        "answerMode": "single",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6"
        ]
      },
      {
        "id": "v50",
        "prompt": "Найдите три лишние фигурки.",
        "image": "/psychological-tests/primary-selection/v50.jpeg",
        "answerMode": "multi",
        "choices": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ]
      }
    ]
  },
  {
    "id": "verbal",
    "title": "Словесный",
    "description": "30 заданий на словесные связи, анаграммы, обобщение и логические вопросы.",
    "questions": [
      {
        "id": "w01",
        "prompt": "Найдите общее окончание для всех перечисленных слов."
      },
      {
        "id": "w02",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "ЖИВОТНОЕ (...) МОНАХ"
      },
      {
        "id": "w03",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "СНА (...) ОВОЙ"
      },
      {
        "id": "w04",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "ОЗУКРАНИШПАЯЛНИБОВОСНИШКУП"
      },
      {
        "id": "w05",
        "prompt": "Найдите общее начало для трех следующих слов."
      },
      {
        "id": "w06",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "РОДНИК (...) ОТМЫЧКА"
      },
      {
        "id": "w07",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "ПЕ (...) ОЛ"
      },
      {
        "id": "w08",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "АЧТПОАИДРОФАГРЕЛТЕКТЕВПНЦ"
      },
      {
        "id": "w09",
        "prompt": "Найдите общее начало для трех следующих слов."
      },
      {
        "id": "w10",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "ТА (...) AT"
      },
      {
        "id": "w11",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "БИТВА (.....) РУГАНЬ"
      },
      {
        "id": "w12",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "АПНИСЕЛЬЯШВИНТАСУПАКАКАЧКБОШУРГА"
      },
      {
        "id": "w13",
        "prompt": "Найдите общее окончание для следующих слов."
      },
      {
        "id": "w14",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "БАЛ (...) ЕДА"
      },
      {
        "id": "w15",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "ЮКИЛТЛЮТАНЬПАЛИФАКОЗАРЛОТУ"
      },
      {
        "id": "w16",
        "prompt": "Найдите общее окончание для всех перечисленных слов."
      },
      {
        "id": "w17",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "РЫБА (....) НАКЛОННАЯ ПОВЕРХНОСТЬ"
      },
      {
        "id": "w18",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "ДИК (.....) ЕЦ"
      },
      {
        "id": "w19",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "РАКОЧВАЛЬБГДОУEXPOЛУПЕДЬ"
      },
      {
        "id": "w20",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "НАСЫПЬ (...) ВРАЩАЮЩИЙСЯ СТЕРЖЕНЬ"
      },
      {
        "id": "w21",
        "prompt": "Найдите общее окончание для всех последующих слов."
      },
      {
        "id": "w22",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "СА (...) ОН"
      },
      {
        "id": "w23",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "ЗМАТЕРАЖПИАГОВЛИНЕРГ"
      },
      {
        "id": "w24",
        "prompt": "Вставьте слово, которое означало бы то же, что и слова, стоящие вне скобок.",
        "stimulus": "ЧАСТЬ ОДЕЖДЫ (.....) ГРУЗОПОДЪЕМНЫЙ МЕХАНИЗМ"
      },
      {
        "id": "w25",
        "prompt": "Вставьте слово, которое служило бы окончанием первого слова и началом второго.",
        "stimulus": "У (....) Ь"
      },
      {
        "id": "w26",
        "prompt": "Решите анаграммы и исключите лишнее слово.",
        "stimulus": "СЛОООКОТИООТРОНТРЕБЛАГД"
      },
      {
        "id": "w27",
        "prompt": "Найдите общее окончание для всех последующих слов."
      },
      {
        "id": "w28",
        "prompt": "Каких камней нет в море?"
      },
      {
        "id": "w29",
        "prompt": "Когда мне было 6, моя сестра была вдвое младше меня. Сейчас мне 70. Сколько лет моей сестре?"
      },
      {
        "id": "w30",
        "prompt": "Как 2 литра молока поместить в 1-литровую банку?"
      }
    ]
  }
];
