// Глобальные объекты из других файлов
const CHARACTERS = window.CHARACTERS || {};
const NODES = window.ALL_NODES || {};
const GAME_STATE = window.GAME_STATE;
const MinigameManager = window.MinigameManager;

// Начальное состояние
const state = {
  nodeId: "curator_intro",
  lineIndex: 0,
  isLocked: false,
  showStats: false,
  voiceQueued: true,
  isActive: false,
  choicesShown: false,
  timeoutHandled: false,
};

const CURATOR_BG = "assets/common/bg_hq.webp";

// DOM-элементы
const bgEl = document.getElementById("scene-bg");
const spriteEl = document.getElementById("character-sprite");
const nameEl = document.getElementById("speaker-name");
const textEl = document.getElementById("dialog-text");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const phaseLabel = document.getElementById("phase-label");
const progressLabel = document.getElementById("progress-label");
const menuBtn = document.getElementById("menu-btn");
const statsPanel = document.getElementById("stats-panel");
const transitionVeil = document.getElementById("transition-veil");
const preloadOverlay = document.getElementById("preload-overlay");
const choiceTimerEl = document.getElementById("choice-timer");
const choiceTimerFill = document.getElementById("choice-timer-fill");
const choiceTimerLabel = document.getElementById("choice-timer-label");
const statBars = {
  trust: {
    bar: document.querySelector('[data-stat="trust"]'),
    fill: document.getElementById("stat-trust-fill"),
    value: document.getElementById("stat-trust-value"),
  },
  tension: {
    bar: document.querySelector('[data-stat="tension"]'),
    fill: document.getElementById("stat-tension-fill"),
    value: document.getElementById("stat-tension-value"),
  },
  intel: {
    bar: document.querySelector('[data-stat="intel"]'),
    fill: document.getElementById("stat-intel-fill"),
    value: document.getElementById("stat-intel-value"),
  },
  analytics: {
    bar: document.querySelector('[data-stat="analytics"]'),
    fill: document.getElementById("stat-analytics-fill"),
    value: document.getElementById("stat-analytics-value"),
  },
  recon: {
    bar: document.querySelector('[data-stat="recon"]'),
    fill: document.getElementById("stat-recon-fill"),
    value: document.getElementById("stat-recon-value"),
  },
  decision: {
    bar: document.querySelector('[data-stat="decision"]'),
    fill: document.getElementById("stat-decision-fill"),
    value: document.getElementById("stat-decision-value"),
  },
  speed: {
    bar: document.querySelector('[data-stat="speed"]'),
    fill: document.getElementById("stat-speed-fill"),
    value: document.getElementById("stat-speed-value"),
  },
  confidence: {
    bar: document.querySelector('[data-stat="confidence"]'),
    fill: document.getElementById("stat-confidence-fill"),
    value: document.getElementById("stat-confidence-value"),
  },
};


let lastSpeakerSide = "right"; // значение не важно, фиксируем правую сторону

let assetLoadToken = 0;
let scenarioLoadToken = 0;
let serverGameState = null;
let saveErrorMessage = "";
let choiceTimerId = null;
let choiceTimerDeadline = 0;
const VEIL_FADE_MS = 550;
// Для каждого сценария перечислены ровно те статы (из 8 общих), которые
// реально меняются его choices/effects — чтобы на панели не было "мёртвых"
// полосок и не было скрытых изменений, которые игрок не видит.
const SCENARIO_STATS = {
  default: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "intel", label: "Разведданные" },
  ],
  antiterror: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "intel", label: "Разведданные" },
  ],
  corruption: [
    { key: "recon", label: "Разведка" },
    { key: "analytics", label: "Аналитика" },
    { key: "decision", label: "Решительность" },
    { key: "tension", label: "Напряжённость" },
    { key: "trust", label: "Доверие" },
  ],
  nabat: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "confidence", label: "Уверенность" },
    { key: "speed", label: "Скорость" },
  ],
  silentChannel: [
    { key: "analytics", label: "Аналитика" },
    { key: "recon", label: "Разведка" },
    { key: "decision", label: "Решительность" },
    { key: "speed", label: "Скорость" },
  ],
  drugTraffic: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "intel", label: "Данные" },
  ],
  borderGuard: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "decision", label: "Решительность" },
    { key: "confidence", label: "Уверенность" },
    { key: "speed", label: "Скорость" },
  ],
  flashRoyale: [
    { key: "trust", label: "Доверие" },
    { key: "tension", label: "Напряжённость" },
    { key: "confidence", label: "Уверенность" },
    { key: "analytics", label: "Аналитика" },
    { key: "recon", label: "Разведка" },
    { key: "intel", label: "Данные" },
    { key: "decision", label: "Решительность" },
  ],
  ntkCase: [
    { key: "analytics", label: "Аналитика" },
    { key: "tension", label: "Напряжённость" },
    { key: "intel", label: "Данные" },
    { key: "recon", label: "Разведка" },
  ],
};
const voicePlayer = new Audio();
const VOICE_MUTE_SPEAKERS = new Set(["system", "sfx"]);
const VOICE_ALIASES = {
  jandos: "zhandos",
  cybermentor: "mentor",
  mentor2: "mentor",
  phone_voice: "call",
};

function normalizeSpeakerId(speakerId) {
  const raw = String(speakerId || "").trim().toLowerCase();
  return VOICE_ALIASES[raw] || raw;
}

function safeSpeakerToken(speakerId) {
  return normalizeSpeakerId(speakerId).replace(/[^a-z0-9_-]/gi, "_");
}

function stopVoice() {
  voicePlayer.pause();
  voicePlayer.currentTime = 0;
  voicePlayer.onerror = null;
}

function buildGeneratedVoicePath(nodeId, lineIndex, speakerId) {
  const index = Number(lineIndex) + 1;
  const token = safeSpeakerToken(speakerId || "unknown");
  return `assets/voices/generated/${nodeId}/l${String(index).padStart(3, "0")}_${token}.mp3`;
}

function resolveLineVoicePath(line, nodeId, lineIndex) {
  if (line?.voice) return line.voice;
  const speakerId = normalizeSpeakerId(line?.speaker);
  if (VOICE_MUTE_SPEAKERS.has(speakerId)) return "";
  return buildGeneratedVoicePath(nodeId, lineIndex, speakerId);
}

function playLineVoice(line, nodeId, lineIndex) {
  stopVoice();
  const voicePath = resolveLineVoicePath(line, nodeId, lineIndex);
  if (!voicePath) return;
  voicePlayer.src = voicePath;
  voicePlayer.play().catch(() => {});
}

function valueToColor(value) {
  if (value >= 70) return "#22c55e"; // зелёный
  if (value >= 30) return "#eab308"; // жёлтый
  return "#ef4444"; // красный
}

function updateUIVisibility() {
  if (statsPanel) {
    statsPanel.classList.toggle("hidden", !state.showStats);
  }
  if (menuBtn) {
    menuBtn.classList.toggle("hidden", !state.showStats);
  }
  if (choiceTimerEl) {
    choiceTimerEl.classList.add("hidden");
  }
}

function renderStats() {
  if (!GAME_STATE || !GAME_STATE.stats) return;
  // Если статы скрыты для выбранного сценария — не обновляем панель и не показываем таймер
  if (!state.showStats) {
    updateUIVisibility();
    return;
  }
  updateUIVisibility();
  const scenarioKey = GAME_STATE.currentScenario || "default";
  const activeStats = SCENARIO_STATS[scenarioKey] || SCENARIO_STATS.default;
  const activeKeys = new Set(activeStats.map((stat) => stat.key));

  Object.entries(statBars).forEach(([key, els]) => {
    if (!els.bar) return;
    els.bar.classList.toggle("hidden", !activeKeys.has(key));
  });

  activeStats.forEach(({ key }) => {
    const value = Number(GAME_STATE.stats[key] || 0);
    const { fill, value: valueEl } = statBars[key] || {};
    if (fill) {
      fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
      fill.style.backgroundColor = valueToColor(value);
    }
    if (valueEl) {
      valueEl.textContent = value;
      valueEl.style.color = valueToColor(value);
    }
  });
}

function clearChoiceTimer() {
  if (choiceTimerId) {
    clearInterval(choiceTimerId);
    choiceTimerId = null;
  }
  if (choiceTimerEl) {
    choiceTimerEl.classList.add("hidden");
  }
}

function formatSeconds(msRemaining) {
  const secs = Math.max(0, Math.ceil(msRemaining / 1000));
  return String(Math.floor(secs / 60)).padStart(2, "0") + ":" + String(secs % 60).padStart(2, "0");
}

function startChoiceTimer() {
  clearChoiceTimer();
  const progress = serverGameState?.game_progress;
  if (!state.isActive || !progress?.choicesShown || progress.timeoutHandled || progress.choiceDeadline === null) return;
  const duration = serverGameState.choice_duration_ms || 30000;
  choiceTimerDeadline = performance.now() + Math.max(0, progress.choiceDeadline - serverGameState.server_time);
  choiceTimerEl.classList.remove("hidden");
  let requested = false;
  const update = () => {
    if (!state.isActive) { clearChoiceTimer(); return; }
    const remaining = choiceTimerDeadline - performance.now();
    choiceTimerFill.style.width = Math.max(0, Math.min(1, remaining / duration)) * 100 + "%";
    choiceTimerLabel.textContent = formatSeconds(remaining);
    if (remaining <= 0 && !requested && !window.Auth?.isBusy()) {
      requested = true;
      window.Auth?.act("timeout");
    }
  };
  choiceTimerId = setInterval(update, 100);
  update();
}

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }
    const img = new Image();
    const finish = loaded => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(loaded);
    };
    const timer = setTimeout(() => { finish(false); img.src = ""; }, 60000);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
  });
}

function getSpeakerSide(speakerId) {
  if (
    speakerId === "curator" ||
    speakerId === "zhandos" ||
    speakerId === "mentor" ||
    speakerId === "klaus2"
  ) {
    return "left";
  }
  return "right";
}

function applySpeakerSide(side) {
  if (!spriteEl || !spriteEl.parentElement) return;
  const layer = spriteEl.parentElement;
  layer.classList.remove("character-left", "character-right");
  layer.classList.add(side === "right" ? "character-right" : "character-left");
}

function toggleVeil(active) {
  if (!transitionVeil) return;
  if (active) transitionVeil.classList.add("active");
  else transitionVeil.classList.remove("active");
}

function togglePreloadOverlay(active, label = "Загружаем сцену...") {
  if (!preloadOverlay) return;
  preloadOverlay.classList.toggle("hidden", !active);
  const textEl = preloadOverlay.querySelector(".preload-text");
  if (textEl) textEl.textContent = label;
}

function getCurrentNode() {
  return NODES[state.nodeId];
}

function showCurrentLine() {
  if (!state.isActive) return;
  const loadToken = ++assetLoadToken;
  const node = getCurrentNode();
  if (!node) {
    textEl.textContent = "Ошибка: узел не найден.";
    nameEl.textContent = "";
    return;
  }
  stopVoice();


  nameEl.style.opacity = "0";
  textEl.style.opacity = "0";



  const line = node.lines[state.lineIndex];
  const shouldPlayVoice = state.voiceQueued;
  state.voiceQueued = false;


  let bgPath = node.background || "";
  if (line.speaker === "curator") {
    bgPath = CURATOR_BG;
  }

  const ch =
    CHARACTERS[line.speaker] || CHARACTERS["narrator"] || { name: "", sprite: "" };
  const speakerId = line.speaker;
  const spritePath = ch.sprite || "";
  const isSameSprite =
    spriteEl.dataset.speakerId === speakerId &&
    spriteEl.dataset.spritePath === spritePath;


  phaseLabel.textContent = node.phase || "";
  renderProgressLabel();
  restartBtn.classList.toggle("hidden", !node.ending);
  choicesEl.innerHTML = "";
  nextBtn.disabled = Boolean(node.ending && state.lineIndex === node.lines.length - 1);
  nextBtn.textContent = nextBtn.disabled ? "СЦЕНАРИЙ ЗАВЕРШЁН" : "ДАЛЬШЕ";
  clearChoiceTimer();
  renderStats();

  const bgChanged = bgPath && bgEl.dataset.currentBg !== bgPath;
  const active = () => loadToken === assetLoadToken && state.isActive;
  applySpeakerSide(getSpeakerSide(speakerId));
  nameEl.textContent = ch.name || "";
  textEl.textContent = line.text;
  nameEl.style.opacity = "1";
  textEl.style.opacity = "1";
  if (shouldPlayVoice) playLineVoice(line, node.id, state.lineIndex);

  if (bgChanged) {
    toggleVeil(true);
    setTimeout(() => { if (active()) toggleVeil(false); }, VEIL_FADE_MS);
    preloadImage(bgPath).then(loaded => {
      if (!loaded || !active()) return;
      bgEl.dataset.currentBg = bgPath;
      bgEl.style.backgroundImage = `url("${bgPath}")`;
      bgEl.style.opacity = "1";
    });
  }
  if (!isSameSprite) {
    spriteEl.style.opacity = "0";
    spriteEl.style.transform = "translateY(30px)";
    spriteEl.removeAttribute("src");
    spriteEl.dataset.speakerId = "";
    spriteEl.dataset.spritePath = "";
    preloadImage(spritePath).then(loaded => {
      if (!loaded || !active()) return;
      spriteEl.dataset.speakerId = speakerId || "";
      spriteEl.dataset.spritePath = spritePath;
      spriteEl.src = spritePath;
      spriteEl.style.transform = "translateY(20px)";
      void spriteEl.offsetHeight;
      requestAnimationFrame(() => {
        if (!active()) return;
        spriteEl.style.opacity = "1";
        spriteEl.style.transform = "translateY(0)";
      });
    });
  }
}

function setControlsLocked(locked) {
  state.isLocked = locked;
  const node = getCurrentNode();
  nextBtn.disabled = locked || state.choicesShown || Boolean(node?.ending && state.lineIndex === node.lines.length - 1);
  restartBtn.disabled = locked;
  if (menuBtn) menuBtn.disabled = locked;
  choicesEl.querySelectorAll("button").forEach(button => {
    button.disabled = locked || button.dataset.available !== "true";
  });
}

function renderChoices(choices) {
  choicesEl.innerHTML = "";
  const available = new Set(serverGameState.available_choices);
  choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.dataset.available = String(available.has(index));
    btn.disabled = !available.has(index);
    if (btn.disabled) {
      btn.style.opacity = "0.5";
      btn.setAttribute("aria-disabled", "true");
      if (choice.scenario) btn.title = "Направление временно недоступно";
    }
    const label = document.createElement("div");
    label.className = "choice-label";
    label.textContent = choice.label;
    const note = document.createElement("div");
    note.className = "choice-note";
    note.textContent = choice.note || "";
    btn.append(label, note);
    btn.addEventListener("click", () => {
      if (!state.isActive || state.isLocked || !available.has(index)) return;
      window.Auth?.act("choice", index);
    });
    choicesEl.appendChild(btn);
  });
  nextBtn.disabled = true;
  nextBtn.textContent = "ВЫБЕРИТЕ ОТВЕТ";
  startChoiceTimer();
}

function renderProgressLabel() {
  if (progressLabel) progressLabel.textContent = [getCurrentNode()?.progress, saveErrorMessage].filter(Boolean).join(" · ");
}
window.setProgressSaveError = function(message) {
  saveErrorMessage = message || "";
  progressLabel?.setAttribute("role", "status");
  progressLabel?.setAttribute("aria-live", "polite");
  renderProgressLabel();
};

function stopGame() {
  setControlsLocked(true);
  state.isActive = false;
  clearChoiceTimer();
  stopVoice();
  assetLoadToken += 1;
  scenarioLoadToken += 1;
  togglePreloadOverlay(false);
  toggleVeil(false);
  MinigameManager?.stop?.();
}

function applyServerGameState(snapshot, playVoice = true) {
  stopGame();
  serverGameState = structuredClone(snapshot);
  const progress = snapshot.game_progress;
  state.nodeId = progress.nodeId;
  state.lineIndex = progress.lineIndex;
  state.choicesShown = progress.choicesShown;
  state.timeoutHandled = progress.timeoutHandled;
  state.showStats = Boolean(progress.currentScenario);
  state.voiceQueued = playVoice;
  GAME_STATE.stats = { ...snapshot.skills };
  GAME_STATE.currentScenario = progress.currentScenario;
  GAME_STATE.startNodeForCurrent = progress.startNodeForCurrent;
  state.isActive = true;
  state.isLocked = false;
  updateUIVisibility();
  showCurrentLine();
  if (state.choicesShown) renderChoices(getCurrentNode().choices || []);
  setControlsLocked(false);
}

nextBtn.addEventListener("click", () => {
  if (state.isActive && !state.isLocked && !state.choicesShown) window.Auth?.act("next");
});
restartBtn.addEventListener("click", () => {
  if (state.isActive && !state.isLocked) window.Auth?.act("restart");
});
menuBtn?.addEventListener("click", () => {
  if (state.isActive && !state.isLocked) window.Auth?.act("menu");
});
window.applyServerGameState = applyServerGameState;
window.setGameControlsLocked = setControlsLocked;
window.getGameProgress = () => structuredClone(serverGameState?.game_progress || null);
window.renderGameStats = renderStats;
window.stopGame = stopGame;

window.syncGameTimer = function(snapshot) {
  if (!state.isActive || snapshot.version !== serverGameState?.version) return;
  serverGameState = structuredClone(snapshot);
  if (state.choicesShown) startChoiceTimer();
};
