(function () {
  let currentUser = null;
  let currentState = null;
  let pending = null;
  let actionPromise = null;
  let bootstrapPromise = null;
  let logoutPromise = null;
  let syncPromise = null;
  let retryTimer = null;
  let retryDelay = 2000;
  const overlay = document.getElementById("auth-overlay");
  const root = document.getElementById("game-root");
  const loading = document.getElementById("auth-loading");
  const logoutBtn = document.getElementById("logout-btn");
  const emailLabel = document.getElementById("user-email-label");
  const error = message => window.setProgressSaveError?.(message);
  const key = () => "specgame-pending-action:v1:" + location.origin + ":" + currentUser.id;

  function readPending() {
    try { return JSON.parse(sessionStorage.getItem(key())) || null; } catch { return null; }
  }
  function storePending(value) {
    pending = value;
    if (!value) {
      clearTimeout(retryTimer);
      retryTimer = null;
      retryDelay = 2000;
    }
    try {
      if (value) sessionStorage.setItem(key(), JSON.stringify(value));
      else sessionStorage.removeItem(key());
    } catch { error("Не закрывайте страницу до подтверждения действия сервером."); }
  }
  function showState(snapshot, playVoice = true) {
    currentState = structuredClone(snapshot);
    window.applyServerGameState(snapshot, playVoice);
  }

  async function sendPending() {
    try {
      const snapshot = await window.PortalGame.request("action", pending);
      storePending(null);
      showState(snapshot);
      error("");
      return true;
    } catch (failure) {
      if ([400, 403, 409, 422].includes(failure.status)) {
        try {
          const snapshot = await window.PortalGame.request("load");
          storePending(null);
          showState(snapshot, false);
          error(failure.status === 409 ? "Прогресс изменён в другом окне. Загружено состояние с сервера." : "Действие отклонено сервером. Продолжите с текущей сцены.");
        } catch { error("Нет связи с сервером. Повторите действие после подключения."); }
      } else {
        error("Действие не подтверждено сервером. Проверьте сеть и повторите действие.");
      }
      return false;
    }
  }

  function act(action, choiceIndex) {
    if (!currentUser || !currentState || actionPromise || logoutPromise) return Promise.resolve(false);
    if (pending && (pending.action !== action || pending.choice_index !== (choiceIndex ?? null))) {
      error("Сначала повторите неподтверждённое действие или дождитесь восстановления связи.");
      return Promise.resolve(false);
    }
    if (!pending) storePending({ action, choice_index: choiceIndex ?? null, version: currentState.version,
      event_id: crypto.randomUUID(), node_id: currentState.game_progress.nodeId });
    clearTimeout(retryTimer);
    retryTimer = null;
    window.setGameControlsLocked(true);
    actionPromise = sendPending().finally(() => {
      actionPromise = null;
      if (currentState) window.setGameControlsLocked(false);
      scheduleRetry();
    });
    return actionPromise;
  }

  function retryPending() {
    if (!pending || actionPromise || logoutPromise || !currentState) return Promise.resolve(!pending);
    return act(pending.action, pending.choice_index);
  }

  function scheduleRetry() {
    if (!pending || retryTimer || !navigator.onLine || document.visibilityState !== "visible") return;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      retryDelay = Math.min(retryDelay * 2, 15000);
      resume();
    }, retryDelay);
  }

  function resume() {
    if (!navigator.onLine || document.visibilityState !== "visible" || actionPromise || logoutPromise || syncPromise) return;
    if (!currentState) { bootstrap(); return; }
    if (pending) { retryPending(); return; }
    syncPromise = (async () => {
      try {
        const snapshot = await window.PortalGame.request("load");
        if (actionPromise || logoutPromise || pending || snapshot.version < currentState.version) return;
        if (snapshot.version > currentState.version) showState(snapshot, false);
        else {
          currentState = structuredClone(snapshot);
          window.syncGameTimer(snapshot);
        }
        error("");
      } catch {
        if (!actionPromise && !pending && !logoutPromise) error("Не удалось обновить прогресс. Проверьте подключение и повторите действие.");
      }
    })().finally(() => {
      syncPromise = null;
    });
  }

  function logout() {
    if (logoutPromise) return logoutPromise;
    logoutPromise = (async () => {
      if (actionPromise) await actionPromise;
      if (syncPromise) await syncPromise;
      if (pending && !(await sendPending())) return false;
      window.stopGame();
      logoutBtn.disabled = true;
      try {
        await window.PortalGame.request("logout");
        return true;
      } catch {
        if (currentState) showState(currentState, false);
        error("Не удалось выйти. Повторите попытку.");
        return false;
      } finally { logoutBtn.disabled = false; }
    })().finally(() => { logoutPromise = null; scheduleRetry(); });
    return logoutPromise;
  }

  function bootstrap() {
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = (async () => {
      loading.classList.remove("hidden");
      try {
        const session = await window.PortalGame.request("session");
        currentUser = session.user;
        pending = readPending();
        const snapshot = await window.PortalGame.request("load");
        showState(snapshot);
        if (pending?.event_id === snapshot.last_event_id) storePending(null);
        overlay.classList.add("hidden");
        root.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        emailLabel.textContent = currentUser.email || "";
        if (pending) await retryPending();
      } catch {
        document.getElementById("auth-subtitle").textContent = "Не удалось загрузить игру. Проверьте подключение и обновите страницу.";
      } finally {
        loading.classList.add("hidden");
        bootstrapPromise = null;
      }
    })();
    return bootstrapPromise;
  }

  logoutBtn.addEventListener("click", logout);
  window.Auth = { isLoggedIn: () => Boolean(currentUser && currentState), isBusy: () => Boolean(actionPromise || logoutPromise || syncPromise), act, logout };
  window.addEventListener("online", resume);
  window.addEventListener("focus", resume);
  window.addEventListener("pageshow", event => { if (event.persisted) resume(); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") resume(); });
  document.addEventListener("DOMContentLoaded", bootstrap);
})();
