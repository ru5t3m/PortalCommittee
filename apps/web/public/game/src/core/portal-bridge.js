(function () {
  const pending = new Map();
  window.addEventListener("message", event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    const message = event.data;
    if (message?.type !== "specgame:response" || !pending.has(message.id)) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) {
      const error = new Error(message.error);
      error.status = message.status;
      request.reject(error);
    } else request.resolve(message.result);
  });
  window.PortalGame = {
    request(method, payload) {
      if (parent === window) {
        location.replace("/ru/game");
        return Promise.reject(new Error("Откройте игру через портал"));
      }
      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error("Сервер не ответил. Проверьте подключение."));
        }, 20000);
        pending.set(id, { resolve, reject, timer });
        parent.postMessage({ type: "specgame:request", id, method, payload }, location.origin);
      });
    },
  };
})();
