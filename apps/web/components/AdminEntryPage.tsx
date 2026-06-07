"use client";

import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Container } from "@/components/ui/Container";
import { getMe, hasAdminPanelSession, loginAdminPanel } from "@/lib/auth";

const allowedUserEmail = process.env.NEXT_PUBLIC_ADMIN_PORTAL_ALLOWED_USER_EMAIL ?? "test@gmail.com";

export function AdminEntryPage() {
  const [accessState, setAccessState] = useState<"checking" | "denied" | "login" | "panel">("checking");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const auth = await getMe();
        if (!active) return;
        if ((auth.user.email ?? "").toLowerCase() !== allowedUserEmail.toLowerCase()) {
          setAccessState("denied");
          return;
        }
        setAccessState(hasAdminPanelSession() ? "panel" : "login");
      } catch {
        if (active) setAccessState("denied");
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    try {
      await loginAdminPanel(email, password);
      setAccessState("panel");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось войти в админ-панель.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (accessState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="rounded-lg border border-white/10 px-5 py-4 text-sm font-semibold text-white/75">Проверка доступа</div>
      </main>
    );
  }

  if (accessState === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="max-w-md text-center">
          <p className="text-7xl font-bold text-white">404</p>
          <h1 className="mt-5 text-2xl font-bold">Страница не найдена</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Запрошенный раздел недоступен для текущей учетной записи.</p>
        </div>
      </main>
    );
  }

  if (accessState === "panel") {
    return (
      <main className="min-h-screen bg-slate-100">
        <AdminPanel locale="ru" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06182d] text-white">
      <div className="security-grid absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,169,155,0.28),transparent_26rem),linear-gradient(130deg,rgba(6,24,45,0.98),rgba(5,36,55,0.9)_58%,rgba(0,125,115,0.55))]" />
      <Container className="relative grid min-h-screen place-items-center py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/15 bg-white p-7 text-state-navy shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
          <div className="mb-7">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-state-teal/10 text-state-tealDark">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Вход в админ-панель</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Введите отдельные учетные данные администратора.</p>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Email администратора
              <span className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 px-3">
                <Mail className="h-5 w-5 text-state-tealDark" />
                <input name="email" type="email" autoComplete="username" className="w-full bg-transparent outline-none" required />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Пароль администратора
              <span className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 px-3">
                <LockKeyhole className="h-5 w-5 text-state-tealDark" />
                <input name="password" type="password" autoComplete="current-password" className="w-full bg-transparent outline-none" required />
              </span>
            </label>
            <button disabled={isSubmitting} className="min-h-12 rounded-lg bg-state-navy px-4 text-sm font-bold text-white transition hover:bg-state-tealDark disabled:opacity-60" type="submit">
              {isSubmitting ? "Проверка..." : "Войти"}
            </button>
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          </div>
        </form>
      </Container>
    </main>
  );
}
