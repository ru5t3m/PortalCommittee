export type PrimaryPsychologicalQuestion = {
  id: string;
  prompt: string;
  stimulus?: string;
  image?: string;
  answerMode?: "text" | "single" | "multi";
  choices?: string[];
};
export type PrimaryPsychologicalSection = {
  id: "numeric" | "visual" | "memory" | "interpretation";
  title: string;
  description: string;
  questions: PrimaryPsychologicalQuestion[];
  status?: "ready" | "planned";
};

const imageBase = "/psychological-tests/primary-selection";

const numericQuestions: PrimaryPsychologicalQuestion[] = [
  { id: "q01", prompt: "Продолжите числовой ряд.", stimulus: "18 20 24 32 ?" },
  { id: "q02", prompt: "Вставьте недостающее число.", image: `${imageBase}/q02.jpeg` },
  { id: "q03", prompt: "Продолжите числовой ряд.", stimulus: "212 179 146 113 ?" },
  { id: "q04", prompt: "Вставьте недостающее число.", image: `${imageBase}/q04.jpeg` },
  { id: "q05", prompt: "Продолжите числовой ряд.", stimulus: "6 8 10 11 14 14 ?" },
  { id: "q06", prompt: "Вставьте пропущенное число.", stimulus: "17 (112) 39 28 (   ) 49" },
  { id: "q07", prompt: "Вставьте пропущенное число.", stimulus: "3 9 35 7 17 1 ?" },
  { id: "q08", prompt: "Продолжите числовой ряд.", stimulus: "7 13 24 45 ?" },
  { id: "q09", prompt: "Вставьте пропущенное число.", stimulus: "234 (333) 567 345 (   ) 678" },
  { id: "q10", prompt: "Вставьте пропущенное число.", stimulus: "4 5 7 11 19 ?" },
  { id: "q11", prompt: "Вставьте недостающее число.", image: `${imageBase}/q11.jpeg` },
  { id: "q12", prompt: "Продолжите числовой ряд.", stimulus: "6 7 9 13 21 ?" },
  { id: "q13", prompt: "Вставьте пропущенное число.", stimulus: "4 8 66 2 48 6 ?" },
  { id: "q14", prompt: "Продолжите числовой ряд.", stimulus: "64 48 40 36 34 ?" },
  { id: "q15", prompt: "Вставьте недостающее число.", image: `${imageBase}/q15.jpeg` },
  { id: "q16", prompt: "Вставьте пропущенное число.", stimulus: "718 (26) 582 474 (   ) 226" },
  { id: "q17", prompt: "Продолжите числовой ряд.", stimulus: "15 13 12 11 9 9 ?" },
  { id: "q18", prompt: "Вставьте пропущенное число.", stimulus: "9 4 16 6 21 9 ?" },
  { id: "q19", prompt: "Вставьте пропущенное число.", stimulus: "11 12 14 ? 26 42" },
  { id: "q20", prompt: "Вставьте пропущенное число.", stimulus: "8 5 24 2 09 6 ?" },
  { id: "q21", prompt: "Вставьте пропущенное число.", image: `${imageBase}/q21.jpeg` },
  { id: "q22", prompt: "Вставьте пропущенное число.", stimulus: "341 (250) 466 282 (   ) 398" },
  { id: "q23", prompt: "Вставьте пропущенное число.", image: `${imageBase}/q23.jpeg` },
  { id: "q24", prompt: "Вставьте пропущенное число.", stimulus: "12 (336) 14 15 (   ) 16" },
  { id: "q25", prompt: "Вставьте пропущенное число.", stimulus: "4 7 68 4 86 5 ?" },
  { id: "q26", prompt: "Продолжите числовой ряд.", stimulus: "7 14 10 12 14 9 ?" },
  { id: "q27", prompt: "Вставьте недостающее число.", image: `${imageBase}/q27.jpeg` },
  { id: "q28", prompt: "Вставьте пропущенное число.", stimulus: "17 (102) 12 14 ( ) 11" },
  { id: "q29", prompt: "Продолжите числовой ряд.", stimulus: "172 84 40 18 ?" },
  { id: "q30", prompt: "Продолжите числовой ряд.", stimulus: "1 5 13 29 ?" },
  { id: "q31", prompt: "Вставьте недостающее число.", image: `${imageBase}/q31.jpeg` },
  { id: "q32", prompt: "Вставьте недостающее число.", image: `${imageBase}/q32.jpeg` },
  { id: "q33", prompt: "Продолжите числовой ряд.", stimulus: "0 3 8 15 ?" },
  { id: "q34", prompt: "Вставьте пропущенное число.", stimulus: "1 3 2 ? 3 7" },
  { id: "q35", prompt: "Вставьте пропущенное число.", stimulus: "447 (366) 264 262 ( ) 521" },
  { id: "q36", prompt: "Вставьте недостающее число.", image: `${imageBase}/q36.jpeg` },
  { id: "q37", prompt: "Продолжите числовой ряд.", stimulus: "4 7 9 11 14 15 19 ?" },
  { id: "q38", prompt: "Вставьте недостающее число.", image: `${imageBase}/q38.jpeg` },
  { id: "q39", prompt: "Вставьте пропущенное число.", stimulus: "3 7 166 13 289 19 ?" },
  { id: "q40", prompt: "Вставьте недостающие числа.", image: `${imageBase}/q40.jpeg` },
  { id: "q41", prompt: "Вставьте пропущенное число.", image: `${imageBase}/q41.jpeg` },
  { id: "q42", prompt: "Вставьте пропущенное число.", image: `${imageBase}/q42.jpeg` },
  { id: "q43", prompt: "Вставьте недостающее число.", image: `${imageBase}/q43.jpeg` },
  { id: "q44", prompt: "Вставьте пропущенное число.", stimulus: "643 (111) 421 269 (   ) 491" },
  { id: "q45", prompt: "Продолжите числовой ряд.", stimulus: "857 969 745 1193 ?" },
  { id: "q46", prompt: "Вставьте недостающее число.", image: `${imageBase}/q46.jpeg` },
  { id: "q47", prompt: "Вставьте пропущенные числа.", stimulus: "9 (45) 8 18 (36) 64 10 (  ) ?" },
  { id: "q48", prompt: "Продолжите числовой ряд.", stimulus: "7 19 37 61 ?" },
  { id: "q49", prompt: "Продолжите числовой ряд.", stimulus: "5 41 149 329 ?" },
  { id: "q50", prompt: "Вставьте пропущенное число.", image: `${imageBase}/q50.jpeg` }
];

const visualPrompts = [
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Вставьте пропущенную фигуру из четырех пронумерованных, имея в виду, что в верхнем ряду первая фигура относится ко второй так же, как третья к пропущенной.",
  "Исключите лишнюю фигуру.",
  "Исключите лишнюю фигуру.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Исключите лишнюю фигуру.",
  "Укажите лишние фигуры.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Укажите лишние фигуры.",
  "Исключите лишнюю фигуру.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Укажите две лишние фигуры.",
  "Найдите три лишние фигуры.",
  "Найдите три лишние фигуры.",
  "Укажите две лишние фигуры.",
  "Исключите лишнюю фигурку.",
  "Вставьте пропущенную фигуру, выбрав ее из четырех пронумерованных.",
  "Найдите три лишние фигуры.",
  "Исключите лишнюю фигурку.",
  "Найдите три лишние фигурки.",
  "Найдите три лишние фигурки.",
  "Исключите лишнюю фигурку.",
  "Найдите три лишние фигурки."
];

function visualMode(prompt: string): "single" | "multi" {
  return prompt.includes("две") || prompt.includes("три") || prompt.includes("лишние") || prompt.includes("лишние фигур") ? "multi" : "single";
}

const visualQuestions: PrimaryPsychologicalQuestion[] = visualPrompts.map((prompt, index) => {
  const questionNumber = index + 1;
  const mode = visualMode(prompt);
  return {
    id: `v${String(questionNumber).padStart(2, "0")}`,
    prompt,
    image: `${imageBase}/v${String(questionNumber).padStart(2, "0")}.jpeg`,
    answerMode: mode,
    choices: mode === "single" ? ["1", "2", "3", "4"] : ["1", "2", "3", "4", "5", "6"]
  };
});

export const primaryPsychologicalSections: PrimaryPsychologicalSection[] = [
  {
    id: "numeric",
    title: "Числовые закономерности",
    description: "50 заданий на числовые ряды, пропущенные числа и формально-логическое мышление.",
    questions: numericQuestions,
    status: "ready"
  },
  {
    id: "visual",
    title: "Наглядно-образные задания",
    description: "50 заданий с фигурами: исключение лишней фигуры и выбор пропущенного элемента.",
    questions: visualQuestions,
    status: "ready"
  },
  {
    id: "memory",
    title: "Память",
    description: "Секция для заданий на кратковременную память будет добавлена следующим этапом.",
    questions: [],
    status: "planned"
  },
  {
    id: "interpretation",
    title: "Интерпретация",
    description: "Итоговая интерпретация появится после внесения ключей ответов и шкал оценки.",
    questions: [],
    status: "planned"
  }
];
