function initUI() {
  if (!settings.hasSeenSplash) {
    document.getElementById("start-overlay").classList.add("open");
  } else {
    document.getElementById("start-overlay").style.display = "none";
  }

  const drawer = document.getElementById("control-drawer");
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  const closeBtn = document.getElementById("drawer-close-btn");

  const toggleMenu = () => {
    drawer.classList.toggle("open");
  };

  toggleBtn.onclick = toggleMenu;
  closeBtn.onclick = () => {
    drawer.classList.remove("open");
    switchTab(null);
  };

  // Initialize sub-modules
  initSettingsModal();
  initSetupModal();
  initKeyboardAndTable();

  document.getElementById("clear-output-btn").onclick = () =>
    (document.getElementById("output").textContent = "");
  document.getElementById("backspace-btn").onclick = () => {
    if (gameState.active && gameState.trainingType === "qso") {
      if (typeof handleQsoInput === "function") handleQsoInput("\b");
    } else {
      const out = document.getElementById("output");
      out.textContent = out.textContent.slice(0, -1);
    }
  };

  const donate = () => {
    document.getElementById("cta-overlay").classList.add("open");
    document.getElementById("cta-overlay").style.display = "flex";
  };

  document.getElementById("cta-later-btn").onclick = () => {
    document.getElementById("cta-overlay").classList.remove("open");
    setTimeout(() => {
      document.getElementById("cta-overlay").style.display = "none";
    }, 300);
  };

  document.getElementById("cta-donate-btn").onclick = () => {
    document.getElementById("cta-overlay").classList.remove("open");
    setTimeout(() => {
      document.getElementById("cta-overlay").style.display = "none";
    }, 300);
  };

  const handleTrainClick = () => {
    if (uiState.activeTab === "train") {
      switchTab("train"); // This will close it
    } else {
      switchTab("train");
    }
  };

  document.getElementById("minigame-btn").onclick = handleTrainClick;
  document.getElementById("analytics-btn").onclick = () => switchTab("stats");
  document.getElementById("table-btn").onclick = () => switchTab("ref");
  document.getElementById("donate-btn").onclick = donate;

  document.getElementById("mob-train").onclick = handleTrainClick;
  document.getElementById("mob-stats").onclick = () => switchTab("stats");
  document.getElementById("mob-ref").onclick = () => switchTab("ref");
  document.getElementById("mob-controls").onclick = () => switchTab("controls");
  document.getElementById("mob-donate").onclick = donate;

  document.getElementById("close-analytics-btn").onclick = () =>
    switchTab(null);
  document.getElementById("close-table-btn").onclick = () => switchTab(null);

  document.getElementById("help-btn").onclick = () => window.openHelp();
  document.getElementById("close-help-btn").onclick = () => window.closeHelp();
  document.getElementById("close-help-btn-mobile").onclick = () =>
    window.closeHelp();

  let resetConfirmTimeout;
  document.getElementById("reset-stats-btn").onclick = (e) => {
    const btn = e.currentTarget;
    if (btn.dataset.confirming === "true") {
      btn.dataset.confirming = "false";
      btn.innerHTML = "Reset All Statistics";
      btn.style.color = "var(--danger)";
      btn.style.backgroundColor = "rgba(var(--danger-rgb), 0.1)";
      clearTimeout(resetConfirmTimeout);

      Object.assign(userStats, {
        wpmHistory: [],
        txWpmHistory: [],
        rxWpmHistory: [],
        qcodeHistory: [],
        tx: { totalChars: 0, totalErrors: 0, heat: {} },
        rx: { totalChars: 0, totalErrors: 0, heat: {} },
        learnIndex: 0,
        totalPlayTime: 0,
        kochLevel: 1,
        maxKochLevel: 1,
        sessionsCompleted: 0,
        lastCtaSession: 0,
        hasDonated: false,
        lastPlayDate: null,
        perfectSessions: 0,
        badges: [],
        sessionsCallsigns: 0,
        sessionsQcodes: 0,
        sessionsRandom: 0,
        sessionsLearn: 0,
        bestWpm: 0,
      });
      saveStats();
      renderAnalytics();
      if (typeof window.renderKochConfig === "function")
        window.renderKochConfig();
    } else {
      btn.dataset.confirming = "true";
      btn.innerHTML = "Click again to confirm";
      btn.style.color = "white";
      btn.style.backgroundColor = "var(--danger)";

      resetConfirmTimeout = setTimeout(() => {
        btn.dataset.confirming = "false";
        btn.innerHTML = "Reset All Statistics";
        btn.style.color = "var(--danger)";
        btn.style.backgroundColor = "rgba(var(--danger-rgb), 0.1)";
      }, 3000);
    }
  };

  document.getElementById("replay-result-btn").onclick = () => {
    startMinigame();
  };

  const statTxBtn = document.getElementById("stat-mode-tx");
  const statRxBtn = document.getElementById("stat-mode-rx");

  statTxBtn.onclick = () => {
    statsViewMode = "tx";
    statTxBtn.classList.add("selected");
    statRxBtn.classList.remove("selected");
    renderAnalytics();
  };
  statRxBtn.onclick = () => {
    statsViewMode = "rx";
    statRxBtn.classList.add("selected");
    statTxBtn.classList.remove("selected");
    renderAnalytics();
  };

  document.getElementById("quit-game-btn").onclick = () => {
    gameState.active = false;
    stopAudioPlayback();
    if (gameState.wordStartTime) {
      gameState.sessionActiveTimeMs += Date.now() - gameState.wordStartTime;
      gameState.wordStartTime = null;
    }
    document
      .getElementById("rx-instruction")
      ?.style.setProperty("opacity", "0");
    document
      .getElementById("game-active")
      ?.style.setProperty("display", "none");
    document.getElementById("output")?.style.setProperty("display", "flex");
    document.getElementById("minigame-btn")?.classList.remove("active-state");
    document.getElementById("buttons")?.style.setProperty("display", "flex");
    document
      .getElementById("virtual-keyboard")
      ?.style.setProperty("display", "none");

    const numSwitch = document.getElementById("kb-switch-num");
    if (numSwitch) {
      numSwitch.textContent = "?123";
      numSwitch.style.backgroundColor = "";
      numSwitch.style.color = "";
    }
  };

  document.getElementById("replay-btn").onclick = () => {
    if (gameState.active && gameState.trainingType === "recv") {
      stopAudioPlayback();
      playMorseWord(gameState.items[gameState.currentItemIndex].target);
    }
  };

  document.getElementById("init-btn").onclick = () => {
    settings.hasSeenSplash = true;
    saveData();
    document.getElementById("start-overlay").classList.remove("open");
    setTimeout(() => {
      document.getElementById("start-overlay").style.display = "none";
    }, 300);
  };
}
