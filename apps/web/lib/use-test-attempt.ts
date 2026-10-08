"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMe } from "@/lib/auth";
import { AttemptApiError, changeTestAttempt, getTestAttempt, startTestAttempt, type AttemptActionName, type AttemptActionPayload, type TestAttempt } from "@/lib/psychological-tests";

type Answer = string | string[];
type Pending = { id: string; action: AttemptActionName; payload: AttemptActionPayload };

function readStored<T>(key: string): T | null {
  try { return JSON.parse(window.sessionStorage.getItem(key) ?? "null") as T | null; } catch { return null; }
}

function writeStored(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useTestAttempt(locale: "ru" | "kk") {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answer, setAnswer] = useState<Answer>("");
  const [authStatus, setAuthStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(60);
  const triedFinish = useRef(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const current = useRef<TestAttempt | null>(null);
  const answerRef = useRef<Answer>("");
  const userId = useRef<number>(0);
  const pending = useRef<Pending | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const clockOffset = useRef(0);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerSync = useRef(false);
  const failureMessage = locale === "ru" ? "Не удалось сохранить изменения. Ответ сохранён в этой вкладке. Проверьте подключение и нажмите «Повторить»." : "Өзгерістерді сақтау мүмкін болмады. Жауап осы қойындыда сақталды. Қосылымды тексеріп, «Қайталау» түймесін басыңыз.";
  const pendingKey = useCallback(() => `knb-attempt-pending-${userId.current}`, []);
  const draftKey = useCallback((id: string) => `knb-attempt-draft-${userId.current}-${id}`, []);

  const apply = useCallback((next: TestAttempt) => {
    const changed = current.current?.current_question?.id !== next.current_question?.id || current.current?.id !== next.id;
    clockOffset.current = new Date(next.server_time).getTime() - Date.now();
    if (changed) {
      const local = readStored<{ question_id: string; answer: Answer }>(draftKey(next.id));
      const value = local && local.question_id === next.current_question?.id ? local.answer : next.current_answer ?? (next.current_question?.answerMode === "multi" ? [] : "");
      answerRef.current = value;
      setAnswer(value);
    }
    current.current = next;
    setAttempt(next);
    setAuthStatus("allowed");
    setRemaining(next.question_deadline ? Math.max(0, Math.ceil((Date.parse(next.question_deadline) - Date.now() - clockOffset.current) / 1000)) : 60);
  }, [draftKey]);

  const reportError = useCallback((error: unknown) => {
    if (error instanceof AttemptApiError && error.status === 401) {
      setAuthStatus("denied");
      setMessage("");
    } else setMessage(failureMessage);
  }, [failureMessage]);

  const sendPending = useCallback(async () => {
    const item = pending.current;
    if (!item) return current.current;
    try {
      const next = await changeTestAttempt(item.id, item.action, item.payload);
      pending.current = null;
      writeStored(pendingKey(), null);
      apply(next);
      setMessage("");
      return next;
    } catch (error) {
      if (error instanceof AttemptApiError && error.status === 409) {
        const next = await getTestAttempt(item.id);
        pending.current = null;
        writeStored(pendingKey(), null);
        apply(next);
        setMessage("");
        return next;
      }
      throw error;
    }
  }, [apply, pendingKey]);

  const run = useCallback((action?: AttemptActionName) => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    const requestedQuestion = current.current?.current_question?.id;
    const requestedAnswer = answerRef.current;
    const work = queue.current.catch(() => undefined).then(async () => {
      if (action !== "draft") setBusy(true);
      try {
        const prior = pending.current;
        if (prior) {
          await sendPending();
          if (!action || (prior.action === action && (action !== "draft" || JSON.stringify(prior.payload.answer) === JSON.stringify(requestedAnswer)))) return current.current;
        }
        const row = current.current;
        if (!row) return null;
        if (!action) {
          const next = await getTestAttempt(row.id);
          apply(next);
          setMessage("");
          return next;
        }
        const withAnswer = ["answer", "draft", "close-section"].includes(action);
        if (withAnswer && requestedQuestion !== row.current_question?.id) return row;
        const payload: AttemptActionPayload = { version: row.version, event_id: crypto.randomUUID() };
        if (withAnswer) { payload.question_id = requestedQuestion; payload.answer = requestedAnswer; }
        pending.current = { id: row.id, action, payload };
        writeStored(pendingKey(), pending.current);
        return await sendPending();
      } catch (error) {
        reportError(error);
        return null;
      } finally {
        if (action !== "draft") setBusy(false);
      }
    });
    queue.current = work;
    return work;
  }, [apply, pendingKey, reportError, sendPending]);

  useEffect(() => {
    let active = true;
    (async () => {
      let authenticated = false;
      try {
        const profile = await getMe();
        if (!active) return;
        authenticated = true;
        userId.current = profile.user.id;
        pending.current = readStored<Pending>(pendingKey());
        const next = await startTestAttempt(locale);
        if (!active) return;
        apply(next);
        if (pending.current?.id === next.id) await run();
        else { pending.current = null; writeStored(pendingKey(), null); }
      } catch (error) {
        if (active) {
          setAuthStatus("denied");
          setMessage(authenticated && !(error instanceof AttemptApiError && error.status === 401) ? failureMessage : "");
        }
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [apply, failureMessage, loadRevision, locale, pendingKey, run]);

  useEffect(() => {
    if (attempt?.status !== "questions" || JSON.stringify(answer) === JSON.stringify(attempt.current_answer ?? "")) return;
    draftTimer.current = setTimeout(() => { void run("draft"); }, 400);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [answer, attempt?.current_answer, attempt?.current_question?.id, attempt?.status, run]);

  useEffect(() => {
    if (attempt?.status !== "questions") return;
    const interval = setInterval(() => {
      const row = current.current;
      if (!row?.question_deadline) return;
      const value = Math.max(0, Math.ceil((Date.parse(row.question_deadline) - Date.now() - clockOffset.current) / 1000));
      setRemaining(value);
      if (value === 0 && !timerSync.current && !message) {
        timerSync.current = true;
        void run().finally(() => { timerSync.current = false; });
      }
    }, 250);
    return () => clearInterval(interval);
  }, [attempt?.status, message, run]);

  useEffect(() => {
    if (attempt?.status !== "ready" || triedFinish.current) return;
    triedFinish.current = true;
    void run("finish");
  }, [attempt?.status, run]);

  function changeAnswer(value: Answer) {
    answerRef.current = value;
    setAnswer(value);
    const row = current.current;
    if (row?.current_question) writeStored(draftKey(row.id), { question_id: row.current_question.id, answer: value });
  }

  async function restart() {
    setBusy(true);
    try {
      apply(await startTestAttempt(locale, true));
      triedFinish.current = false;
      setMessage("");
    } catch (error) { reportError(error); } finally { setBusy(false); }
  }

  async function retry() {
    if (!current.current) { setLoading(true); setAuthStatus("checking"); setLoadRevision(value => value + 1); return; }
    if (current.current.status === "ready") await run("finish");
    else await run();
  }

  return { attempt, answer, changeAnswer, authStatus, loading, busy, message, remaining, run, retry, restart };
}
