"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type { PrimaryPsychologicalQuestion } from "@/lib/primary-psychological-test";
import { primaryTestImageSizes } from "@/lib/psychological-test-images";
import { useTestAttempt } from "@/lib/use-test-attempt";

const primaryCopy = {
  ru: {
    testTitle: "Первичный психологический тест",
    section: "Раздел",
    question: "Вопрос",
    questions: "Вопросы",
    of: "из",
    timer: "Осталось",
    instructions: "Инструкция",
    timerPaused: "Таймер не идет, пока вы читаете информацию о разделе.",
    startSection: "Начать раздел",
    nextQuestion: "Следующий вопрос",
    nextSection: "Перейти к следующему разделу",
    saveAndExit: "Сохранить и выйти",
    progressSaved: "Прогресс сохранен. Вы сможете продолжить со следующего раздела позже.",
    progressSaveError: "Не удалось сохранить прогресс. Проверьте подключение и попробуйте еще раз.",
    progressLoadErrorTitle: "Не удалось загрузить прогресс",
    progressLoadError: "Проверьте подключение и обновите страницу, чтобы повторить загрузку сохраненных ответов.",
    exitWarningTitle: "ВНИМАНИЕ",
    exitWarningText:
      "Если вы выйдете сейчас, все неотвеченные вопросы текущего раздела будут зафиксированы как пустые. Вернуться к этому разделу и повторно решить его вопросы будет нельзя. Прогресс сохранится, и продолжить тестирование можно будет только со следующего раздела.",
    exitWarningLastSectionText:
      "Если вы выйдете сейчас, все неотвеченные вопросы текущего раздела будут зафиксированы как пустые. Так как это последний раздел, тестирование будет завершено, а итоговый результат сохранится без возможности повторного прохождения раздела.",
    stayInTest: "Остаться в тесте",
    confirmExit: "Сохранить раздел и выйти",
    sectionComplete: "Раздел завершен",
    sectionCompleteText: "Ответы этого раздела сохранены в текущем прохождении. Сейчас можно сделать паузу или перейти дальше.",
    finish: "Завершить тестирование",
    finished: "Тестирование завершено",
    finishedText: "Итоговые результаты сохраняются только после прохождения всего тестирования целиком.",
    checkingAuth: "Проверяем вход",
    loadingProgress: "Проверяем сохраненный прогресс",
    authRequired: "Для прохождения теста нужен вход",
    authRequiredText: "Психологическое тестирование доступно только пользователям, которые вошли на портал. Войдите по email, затем вернитесь к тесту.",
    login: "Войти",
    exitToTests: "Выйти на страницу психотестирования",
    saving: "Сохраняем результат...",
    saved: "Результат сохранен",
    saveError: "Не удалось сохранить результат. Проверьте подключение и повторите завершение позже.",
    textAnswer: "Ваш ответ",
    textPlaceholder: "Введите ответ",
    unanswered: "Если за 1 минуту ответ не выбран, вопрос будет отмечен как неотвеченный и тест перейдет дальше.",
    answered: "Отвечено",
    notAnswered: "Не отвечено",
    correct: "Верно",
    sectionInstructions: {
      numeric: [
        "В этом разделе 50 заданий на числовые закономерности, пропущенные числа и логические связи.",
        "На каждый вопрос дается 1 минута. После истечения времени вопрос автоматически пропускается как неотвеченный.",
        "Между разделами есть пауза без таймера, чтобы спокойно прочитать инструкцию."
      ],
      visual: [
        "В этом разделе 50 заданий с фигурами и наглядными закономерностями.",
        "Выберите номер фигуры или несколько номеров, если в формулировке требуется указать две или три лишние фигуры.",
        "После завершения раздела можно сохранить прогресс и выйти, чтобы продолжить позже со следующего раздела."
      ],
      verbal: [
        "В этом разделе 30 словесных заданий: анаграммы, подбор общего начала или окончания, вставка слова и короткие логические вопросы.",
        "Ответ вводится в текстовое поле под заданием.",
        "На каждый вопрос дается 1 минута. Если ответ не введен вовремя, вопрос будет отмечен как неотвеченный."
      ]
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
    timerPaused: "Бөлім туралы ақпаратты оқып отырған кезде таймер жүрмейді.",
    startSection: "Бөлімді бастау",
    nextQuestion: "Келесі сұрақ",
    nextSection: "Келесі бөлімге өту",
    saveAndExit: "Сақтап шығу",
    progressSaved: "Прогресс сақталды. Кейін келесі бөлімнен жалғастыра аласыз.",
    progressSaveError: "Прогресті сақтау мүмкін болмады. Қосылымды тексеріп, қайта көріңіз.",
    progressLoadErrorTitle: "Прогресті жүктеу мүмкін болмады",
    progressLoadError: "Сақталған жауаптарды қайта жүктеу үшін қосылымды тексеріп, бетті жаңартыңыз.",
    exitWarningTitle: "НАЗАР АУДАРЫҢЫЗ",
    exitWarningText:
      "Қазір шықсаңыз, ағымдағы бөлімдегі жауап берілмеген барлық сұрақтар бос деп белгіленеді. Бұл бөлімге қайта оралып, сұрақтарын қайта шешу мүмкін болмайды. Прогресс сақталып, тестілеуді тек келесі бөлімнен жалғастыра аласыз.",
    exitWarningLastSectionText:
      "Қазір шықсаңыз, ағымдағы бөлімдегі жауап берілмеген барлық сұрақтар бос деп белгіленеді. Бұл соңғы бөлім болғандықтан, тестілеу аяқталып, қорытынды нәтиже осы күйінде сақталады.",
    stayInTest: "Тестте қалу",
    confirmExit: "Бөлімді сақтап шығу",
    sectionComplete: "Бөлім аяқталды",
    sectionCompleteText: "Бұл бөлімнің жауаптары ағымдағы өту ішінде сақталды. Енді үзіліс жасауға немесе әрі қарай өтуге болады.",
    finish: "Тестілеуді аяқтау",
    finished: "Тестілеу аяқталды",
    finishedText: "Қорытынды нәтижелер барлық тестілеу толық өткеннен кейін ғана сақталады.",
    checkingAuth: "Кіру тексерілуде",
    loadingProgress: "Сақталған прогресс тексерілуде",
    authRequired: "Тесттен өту үшін кіру қажет",
    authRequiredText: "Психологиялық тестілеу порталға кірген пайдаланушыларға ғана қолжетімді. Email арқылы кіріп, тестке қайта оралыңыз.",
    login: "Кіру",
    exitToTests: "Психотест бетіне шығу",
    saving: "Нәтиже сақталуда...",
    saved: "Нәтиже сақталды",
    saveError: "Нәтижені сақтау мүмкін болмады. Қосылымды тексеріп, кейін қайта аяқтап көріңіз.",
    textAnswer: "Жауабыңыз",
    textPlaceholder: "Жауапты енгізіңіз",
    unanswered: "1 минут ішінде жауап таңдалмаса, сұрақ жауапсыз деп белгіленіп, тест келесі сұраққа өтеді.",
    answered: "Жауап берілді",
    notAnswered: "Жауап берілмеді",
    correct: "Дұрыс",
    sectionInstructions: {
      numeric: [
        "Бұл бөлімде сандық заңдылықтар, жетіспейтін сандар және логикалық байланыстар бойынша 50 тапсырма бар.",
        "Әр сұраққа 1 минут беріледі. Уақыт аяқталса, сұрақ автоматты түрде жауапсыз өткізіледі.",
        "Бөлімдер арасында нұсқаулықты тыныш оқу үшін таймерсіз үзіліс болады."
      ],
      visual: [
        "Бұл бөлімде фигуралар және көрнекі заңдылықтар бойынша 50 тапсырма бар.",
        "Егер тұжырымда екі немесе үш артық фигураны көрсету қажет болса, бір немесе бірнеше нөмірді таңдаңыз.",
        "Бөлім аяқталғаннан кейін прогресті сақтап, кейін келесі бөлімнен жалғастыруға болады."
      ],
      verbal: [
        "Бұл бөлімде 30 сөздік тапсырма бар: анаграммалар, ортақ басын немесе соңын табу, сөз енгізу және қысқа логикалық сұрақтар.",
        "Жауап тапсырманың астындағы мәтін өрісіне енгізіледі.",
        "Әр сұраққа 1 минут беріледі. Уақытында жауап берілмесе, сұрақ жауапсыз деп белгіленеді."
      ]
    }
  }
};

type AnswerValue = string | string[];

export function PsychologicalTestRunner({ locale }: { locale: Locale; slug: string }) {
  return <PrimarySelectionRunner locale={locale} />;
}

function hasAnswer(answer: AnswerValue | undefined) {
  return Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim().length > 0;
}

function TestLoadingScreen({ locale, checkingAuth }: { locale: Locale; checkingAuth: boolean }) {
  const t = primaryCopy[locale];
  return (
    <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center">
        <section role="status" className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.testTitle}</p>
          <div className="mt-4 grid text-3xl font-bold text-state-navy">
            <p aria-hidden={!checkingAuth} className={cn("col-start-1 row-start-1 self-center", !checkingAuth && "invisible")}>{t.checkingAuth}</p>
            <p aria-hidden={checkingAuth} className={cn("col-start-1 row-start-1 self-center", checkingAuth && "invisible")}>{t.loadingProgress}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function PrimarySelectionRunner({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = primaryCopy[locale];
  const flow = useTestAttempt(locale);
  const { attempt, authStatus, busy, run } = flow;
  const sectionIndex = attempt?.current_section_index ?? 0;
  const questionIndex = attempt?.current_question_index ?? 0;
  const mode = attempt?.status === "ready" || attempt?.status === "completed" ? "finished" : attempt?.status ?? "instructions";
  const readySections = attempt?.sections ?? [];
  const activeSection = readySections[sectionIndex];
  const activeQuestion = attempt?.current_question;
  const imageSize = activeQuestion?.image ? primaryTestImageSizes[activeQuestion.image] : undefined;
  const currentAnswer = flow.answer;
  const isCurrentAnswered = hasAnswer(currentAnswer);
  const totalQuestions = attempt?.total_questions ?? 130;
  const currentQuestionNumber = readySections.slice(0, sectionIndex).reduce((sum, section) => sum + section.total_questions, 0) + questionIndex + 1;
  const answeredTotal = attempt?.answered_questions ?? 0;
  const activeSectionAnswered = activeSection?.answered_questions ?? 0;
  const savedResult = attempt?.result;
  const totalCorrectAnswers = savedResult?.sections.reduce((sum, section) => sum + (section.correct_answers ?? 0), 0) ?? 0;
  const totalScoredQuestions = savedResult?.sections.reduce((sum, section) => sum + (section.scored_questions ?? 0), 0) ?? 0;
  const isLoadingProgress = flow.loading;
  const questionRemainingSeconds = flow.remaining;
  const formattedQuestionTime = String(Math.floor(questionRemainingSeconds / 60)).padStart(2, "0") + ":" + String(questionRemainingSeconds % 60).padStart(2, "0");
  const progressMessage = flow.message;
  const isSavingResult = busy;
  const saveError = flow.message;
  const isSavingProgress = busy;
  const isForcedExitSaving = busy;
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    if (authStatus !== "allowed" || mode !== "questions") return;
    window.history.pushState({ psychologicalTestGuard: true }, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState({ psychologicalTestGuard: true }, "", window.location.href);
      setShowExitWarning(true);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [authStatus, mode]);

  function setQuestionAnswer(question: PrimaryPsychologicalQuestion, value: string) {
    if (question.answerMode === "multi") {
      const values = Array.isArray(currentAnswer) ? currentAnswer : [];
      flow.changeAnswer(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
    } else flow.changeAnswer(value);
  }

  async function goNextQuestion() { await run("answer"); }
  async function continueToNextSection() { await run("continue"); }
  async function saveProgress(exitAfterSave: boolean) {
    const next = await run("continue");
    if (next?.status === "instructions" && exitAfterSave) router.push("/" + locale + "/psychological-testing");
  }
  async function saveCurrentSectionAndExit() {
    const next = await run("close-section");
    if (!next) return;
    setShowExitWarning(false);
    if (next.status === "sectionComplete") {
      const continued = await run("continue");
      if (continued?.status === "instructions") router.push("/" + locale + "/psychological-testing");
    }
  }
  const retryLabel = locale === "ru" ? "Повторить" : "Қайталау";
  const retryNotice = progressMessage ? <div role="alert" className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{progressMessage} <button type="button" disabled={busy} onClick={() => void flow.retry()} className="ml-3 font-bold text-state-tealDark">{retryLabel}</button></div> : null;

  if (authStatus === "checking" || (authStatus === "allowed" && isLoadingProgress)) {
    return <TestLoadingScreen locale={locale} checkingAuth={authStatus === "checking"} />;
  }

  if (authStatus === "denied") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center">
          <section className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{t.testTitle}</p>
            <h1 className="mt-4 text-3xl font-bold text-state-navy md:text-4xl">{progressMessage ? t.progressLoadErrorTitle : t.authRequired}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{progressMessage || t.authRequiredText}</p>
            <div className="mt-8">
              {savedResult ? <button disabled={busy} onClick={() => void flow.restart()} className="mr-3 inline-flex min-h-12 items-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold">{locale === "ru" ? "Пройти снова" : "Қайта өту"}</button> : null}
              <Link href={`/${locale}/login`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark">
                {t.login}
              </Link>
              {progressMessage ? <button onClick={() => void flow.retry()} className="ml-3 font-bold text-state-tealDark">{retryLabel}</button> : null}
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
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {isSavingResult ? t.saving : savedResult ? t.saved : saveError || t.saving}
            </div>
            {retryNotice}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.questions}</p>
                <p className="mt-2 text-3xl font-bold">{answeredTotal}/{totalQuestions}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.correct}</p>
                <p className="mt-2 text-3xl font-bold">{totalCorrectAnswers}/{totalScoredQuestions}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.section}</p>
                <p className="mt-2 text-3xl font-bold">{readySections.length}/{readySections.length}</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href={`/${locale}/psychological-testing`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark">
                {t.exitToTests}
              </Link>
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
                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-state-navy shadow-sm">
                  {t.section} {sectionIndex + 1} {t.of} {readySections.length}
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{activeSection.description}</p>
              <p className="mt-2 text-sm font-semibold text-state-tealDark">{t.timerPaused}</p>
              {retryNotice}
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
              <p className="text-sm font-semibold text-slate-600">{t.unanswered}</p>
              <button type="button" disabled={busy} onClick={() => void run("begin-section")} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark">
                {t.startSection}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (mode === "sectionComplete") {
    return (
      <div className="min-h-screen bg-[#f3f7f6] px-4 py-6 text-state-navy md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center">
          <section className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(6,24,45,0.08)] md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-state-tealDark">{activeSection.title}</p>
            <h1 className="mt-4 text-4xl font-bold text-state-navy">{t.sectionComplete}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{t.sectionCompleteText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.answered}</p>
                <p className="mt-2 text-3xl font-bold">{activeSectionAnswered}/{activeSection.total_questions}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.section}</p>
                <p className="mt-2 text-3xl font-bold">{sectionIndex + 1}/{readySections.length}</p>
              </div>
            </div>
            {retryNotice}
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" disabled={isSavingProgress} onClick={() => saveProgress(true)} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-state-teal/25 bg-white px-5 py-3 text-sm font-semibold text-state-tealDark transition hover:border-state-gold/50 hover:text-state-navy disabled:cursor-not-allowed disabled:opacity-60">
                {isSavingProgress ? t.saving : t.saveAndExit}
              </button>
              <button type="button" disabled={busy} onClick={continueToNextSection} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark">
                {t.nextSection}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!activeQuestion) return null;

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
              {t.question} {currentQuestionNumber} {t.of} {totalQuestions}
            </div>
            <div className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white", questionRemainingSeconds <= 10 ? "bg-red-700" : "bg-state-navy")}>
              <Clock3 className="h-4 w-4 text-state-gold" />
              {formattedQuestionTime}
            </div>
            <button
              type="button"
              onClick={() => setShowExitWarning(true)}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
            >
              {t.saveAndExit}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        {retryNotice}
        <fieldset disabled={busy} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <legend className="px-1 text-sm font-bold uppercase tracking-[0.16em] text-state-tealDark">
            {t.question} {questionIndex + 1} {t.of} {activeSection.total_questions}
          </legend>
          <p className="mt-3 text-2xl font-bold leading-8 text-state-navy">{activeQuestion.prompt}</p>
          {activeQuestion.stimulus ? <p className="mt-5 rounded-2xl bg-slate-50 px-5 py-5 text-2xl font-bold tracking-wide text-state-navy">{activeQuestion.stimulus}</p> : null}
          {activeQuestion.image ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <img src={activeQuestion.image} alt={`${t.question} ${currentQuestionNumber}`} width={imageSize?.width} height={imageSize?.height}
                style={imageSize ? { width: Math.min(imageSize.width, imageSize.width / imageSize.height * 512), height: "auto" } : undefined}
                className="mx-auto max-h-[32rem] w-auto max-w-full object-contain" />
            </div>
          ) : null}

          {activeQuestion.choices?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {activeQuestion.choices.map((choice) => {
                const selected = Array.isArray(currentAnswer) ? currentAnswer.includes(choice) : currentAnswer === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setQuestionAnswer(activeQuestion, choice)}
                    className={cn(
                      "grid h-12 min-w-12 place-items-center rounded-xl border px-4 text-sm font-bold transition",
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
            <label className="mt-5 grid gap-2 text-sm font-semibold text-state-navy">
              {t.textAnswer}
              <input
                maxLength={1000}
                value={typeof currentAnswer === "string" ? currentAnswer : ""}
                onChange={(event) => setQuestionAnswer(activeQuestion, event.target.value)}
                className="min-h-12 rounded-xl border border-slate-200 px-4 text-base font-semibold outline-none transition focus:border-state-teal focus:ring-4 focus:ring-state-teal/10"
                placeholder={t.textPlaceholder}
              />
            </label>
          )}
        </fieldset>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-600">
            {isCurrentAnswered ? t.answered : t.notAnswered}. {t.unanswered}
          </p>
          <button
            type="button"
            disabled={!isCurrentAnswered || busy || questionRemainingSeconds === 0}
            onClick={goNextQuestion}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-state-navy px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-state-tealDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {questionIndex >= activeSection.total_questions - 1 && sectionIndex >= readySections.length - 1 ? t.finish : t.nextQuestion}
          </button>
        </div>
      </div>

      {showExitWarning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-state-navy/65 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-[1.5rem] border border-red-200 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-700">{t.exitWarningTitle}</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-state-navy md:text-3xl">{t.saveAndExit}</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-red-700">
              {sectionIndex >= readySections.length - 1 ? t.exitWarningLastSectionText : t.exitWarningText}
            </p>
            {retryNotice}
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={isForcedExitSaving}
                onClick={() => {
                  setShowExitWarning(false);
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-state-navy transition hover:border-state-teal/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.stayInTest}
              </button>
              <button
                type="button"
                disabled={isForcedExitSaving}
                onClick={saveCurrentSectionAndExit}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isForcedExitSaving ? t.saving : t.confirmExit}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
