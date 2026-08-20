"use client";

import { Bot, Loader2, MessageCircle, Minus, Send, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { askFaqAssistant, type FaqAssistantResponse } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  meta?: string;
  suggestions?: FaqAssistantResponse["suggestions"];
};

const copy = {
  ru: {
    title: "FAQ-ассистент",
    subtitle: "Ответы только по документу FAQ",
    placeholder: "Напишите вопрос...",
    open: "Открыть FAQ-ассистента",
    close: "Закрыть FAQ-ассистента",
    collapse: "Свернуть",
    send: "Отправить",
    empty: "Введите вопрос.",
    initial: "Здравствуйте. Я отвечаю только по утвержденному FAQ-документу о поступлении на службу и учебу.",
    noAnswer: "В документе FAQ нет точного ответа на этот вопрос. Уточните формулировку или обратитесь в кадровое подразделение.",
    source: "Источник",
    matched: "Найденный вопрос",
    suggestions: "Похожие вопросы",
    error: "Не удалось получить ответ. Попробуйте еще раз."
  },
  kk: {
    title: "FAQ-ассистент",
    subtitle: "Жауаптар тек FAQ құжаты бойынша",
    placeholder: "Сұрақ жазыңыз...",
    open: "FAQ-ассистентті ашу",
    close: "FAQ-ассистентті жабу",
    collapse: "Жасыру",
    send: "Жіберу",
    empty: "Сұрақ енгізіңіз.",
    initial: "Сәлеметсіз бе. Мен қызметке және оқуға қабылдау туралы бекітілген FAQ құжаты бойынша ғана жауап беремін.",
    noAnswer: "FAQ құжатында бұл сұраққа нақты жауап жоқ. Сұрақты нақтылаңыз немесе кадр бөлімшесіне хабарласыңыз.",
    source: "Дереккөз",
    matched: "Табылған сұрақ",
    suggestions: "Ұқсас сұрақтар",
    error: "Жауап алу мүмкін болмады. Қайталап көріңіз."
  }
} as const;

function buildAssistantText(response: FaqAssistantResponse, locale: Locale) {
  if (!response.answer) return copy[locale].noAnswer;
  return response.answer;
}

export function FaqAssistantWidget({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(2);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: text.initial
    }
  ]);

  const canSend = useMemo(() => question.trim().length >= 2 && !isLoading, [isLoading, question]);

  const submitQuestion = async (event?: FormEvent<HTMLFormElement>, overrideQuestion?: string) => {
    event?.preventDefault();
    const value = (overrideQuestion ?? question).trim();
    if (!value) {
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: text.empty }]);
      return;
    }
    if (value.length < 2 || isLoading) return;

    setIsLoading(true);
    setQuestion("");
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: value }]);

    try {
      const response = await askFaqAssistant(value, locale);
      const meta = response.matched_question
        ? `${text.matched}: ${response.matched_question}\n${text.source}: ${response.source}`
        : `${text.source}: ${response.source}`;
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: buildAssistantText(response, locale),
          meta,
          suggestions: response.answer ? [] : response.suggestions
        }
      ]);
    } catch {
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: text.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[1300] grid h-14 w-14 place-items-center rounded-full bg-state-navy text-white shadow-[0_18px_46px_rgba(6,27,51,0.28)] ring-1 ring-white/20 transition hover:bg-[#0b2b4d] focus-visible:outline-state-gold"
        aria-label={text.open}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section className="fixed bottom-4 right-4 z-[1300] flex h-[min(42rem,calc(100vh-2rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(6,27,51,0.26)]" aria-label={text.title}>
      <div className="flex items-center justify-between gap-3 bg-state-navy px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-state-gold text-state-navy">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{text.title}</h2>
            <p className="truncate text-xs text-white/68">{text.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => setIsOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white" aria-label={text.collapse}>
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white" aria-label={text.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${message.role === "user" ? "bg-state-navy text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
              <p className="whitespace-pre-line">{message.text}</p>
              {message.meta ? <p className="mt-2 whitespace-pre-line border-t border-slate-200 pt-2 text-[11px] leading-relaxed text-slate-500">{message.meta}</p> : null}
              {message.suggestions?.length ? (
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <p className="mb-2 text-[11px] font-semibold uppercase text-slate-500">{text.suggestions}</p>
                  <div className="space-y-1.5">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={`${message.id}-${suggestion.question}`}
                        type="button"
                        onClick={() => void submitQuestion(undefined, suggestion.question)}
                        className="block w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-state-gold hover:bg-white"
                      >
                        {suggestion.question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {text.title}
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={submitQuestion} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
        <label className="sr-only" htmlFor="faq-assistant-question">
          {text.placeholder}
        </label>
        <textarea
          id="faq-assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={text.placeholder}
          rows={2}
          className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-state-gold focus:ring-2 focus:ring-state-gold/25"
        />
        <button type="submit" disabled={!canSend} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-state-gold text-state-navy transition hover:bg-[#e5bd55] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label={text.send}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </section>
  );
}
