(function () {
  const layer = document.getElementById("minigame-layer");
  const questionEl = document.getElementById("minigame-question");
  const optionsEl = document.getElementById("minigame-options");

  if (!layer || !questionEl || !optionsEl) {
    console.warn("Minigame UI elements not found in DOM");
  }

  function showLayer() {
    if (!layer) return;
    layer.classList.remove("hidden");
    layer.classList.add("active");
  }

  function hideLayer() {
    if (!layer) return;
    layer.classList.remove("active");
    layer.classList.add("hidden");
    if (optionsEl) {
      optionsEl.innerHTML = "";
    }
  }

  // Простой вариант — один правильный ответ
  function startSingleChoice(config, onFinish) {
    if (!layer || !questionEl || !optionsEl) {
      console.warn("No minigame layer. Finishing immediately.");
      onFinish &&
        onFinish({
          success: true,
          effects: config.effectsOnSuccess || {},
          nextNodeId: config.nextOnSuccess,
        });
      return;
    }

    showLayer();
    questionEl.textContent = config.question || "Выберите вариант:";

    optionsEl.innerHTML = "";
    (config.options || []).forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "minigame-option-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        const success = opt.id === config.correctId;
        const effects = success
          ? config.effectsOnSuccess || {}
          : config.effectsOnFail || {};
        const nextNodeId = success
          ? config.nextOnSuccess
          : config.nextOnFail;

        hideLayer();
        onFinish &&
          onFinish({
            success,
            effects,
            nextNodeId,
          });
      });
      optionsEl.appendChild(btn);
    });
  }

  // Новый вариант — можно выбрать несколько документов
  function startMultiSelect(config, onFinish) {
    if (!layer || !questionEl || !optionsEl) {
      console.warn("No minigame layer. Finishing immediately.");
      onFinish &&
        onFinish({
          success: true,
          effects: config.effectsOnSuccess || {},
          nextNodeId: config.nextOnSuccess,
        });
      return;
    }

    showLayer();
    questionEl.textContent = config.question || "Выберите нужные элементы:";

    const correctSet = new Set(config.correctIds || []);
    const selected = new Set();

    optionsEl.innerHTML = "";

    (config.options || []).forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "minigame-option-btn";
      btn.textContent = opt.label;

      btn.addEventListener("click", () => {
        if (selected.has(opt.id)) {
          selected.delete(opt.id);
          btn.classList.remove("selected");
        } else {
          selected.add(opt.id);
          btn.classList.add("selected");
        }
      });

      optionsEl.appendChild(btn);
    });

    // Кнопка подтверждения
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "minigame-option-btn";
    confirmBtn.style.marginTop = "10px";
    confirmBtn.textContent = config.confirmLabel || "Подтвердить выбор";

    confirmBtn.addEventListener("click", () => {
      // успех: выбран не пустой набор, все выбранные — правильные, и выбраны все правильные
      let success = true;

      if (selected.size === 0) {
        success = false;
      } else {
        // все выбранные входят в correctSet?
        for (const id of selected) {
          if (!correctSet.has(id)) {
            success = false;
            break;
          }
        }
        // и все правильные выбраны?
        if (success && correctSet.size !== selected.size) {
          success = false;
        }
      }

      const effects = success
        ? config.effectsOnSuccess || {}
        : config.effectsOnFail || {};
      const nextNodeId = success
        ? config.nextOnSuccess
        : config.nextOnFail;

      hideLayer();
      onFinish &&
        onFinish({
          success,
          effects,
          nextNodeId,
        });
    });

    optionsEl.appendChild(confirmBtn);
  }

  window.MinigameManager = {
    stop: hideLayer,
    start(minigameConfig, onFinish) {
      if (!minigameConfig) {
        console.warn("Minigame config is empty");
        onFinish && onFinish(null);
        return;
      }

      switch (minigameConfig.kind) {
        case "singleChoice":
          startSingleChoice(minigameConfig, onFinish);
          break;
        case "multiSelect":
          startMultiSelect(minigameConfig, onFinish);
          break;
        default:
          console.warn("Unknown minigame kind:", minigameConfig.kind);
          onFinish && onFinish(null);
      }
    },
  };
})();
