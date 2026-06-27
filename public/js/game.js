function startMinigame() {
  gameState.active = true;
  gameState.gameMode = setupMode;
  gameState.trainingType = setupType;
  gameState.hintsEnabled = setupHints;

  // Update lastPlayDate
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (userStats.lastPlayDate !== today) {
    userStats.lastPlayDate = today;
    saveStats();
  }

  if (setupMode === "learn") {
    let learnSeq = "";
    if (settings.customChars && settings.customChars.length > 0) {
      learnSeq = settings.customChars;
    } else {
      if (settings.charTypes.letters)
        learnSeq += LEARN_LEVELS.map((l) => l.chars).join("");
      if (settings.charTypes.numbers) learnSeq += CHAR_SETS.numbers;
      if (settings.charTypes.specials) learnSeq += CHAR_SETS.specials;
    }

    gameState.items = [];
    learnSeq.split("").forEach((c) => {
      for (let i = 0; i < 3; i++) {
        gameState.items.push({
          target: c,
          hint: MNEMONICS_DATA[c] || { phrase: "", hint: "" },
        });
      }
    });

    gameState.currentItemIndex = userStats.learnIndex || 0;
    if (gameState.currentItemIndex >= gameState.items.length) {
      gameState.currentItemIndex = 0;
    }
  } else if (setupMode === "callsigns") {
    gameState.items = [];
    for (let i = 0; i < gameState.targetCount; i++) {
      gameState.items.push({ target: generateCallsign(), hint: null });
    }
    gameState.currentItemIndex = 0;
  } else if (setupMode === "random") {
    const randomItems = [];
    const activePool = getSelectedPool();
    for (let i = 0; i < gameState.targetCount; i++) {
      randomItems.push({
        target: generateAdaptiveRandomString(5, activePool),
        hint: null,
      });
    }
    gameState.items = randomItems;
    gameState.currentItemIndex = 0;
  } else if (setupMode === "koch") {
    const kochItems = [];
    for (let i = 0; i < gameState.targetCount; i++) {
      // Use new adaptive logic for Koch
      kochItems.push({ target: generateAdaptiveKochString(), hint: null });
    }
    gameState.items = kochItems;
    gameState.currentItemIndex = 0;
  } else {
    // Use new adaptive logic for Q-Codes
    const adaptiveQCodes = getAdaptiveSubset(
      Q_CODES,
      gameState.targetCount,
      "code",
    );
    gameState.items = adaptiveQCodes.map((q) => ({
      target: q.code,
      hint: q.meaning,
    }));
    gameState.currentItemIndex = 0;
  }

  gameState.currentCharIndex = 0;
  gameState.mistakes = 0;
  gameState.totalChars = 0;
  gameState.sessionActiveTimeMs = 0;
  gameState.wordStartTime = null;
  gameState.hasStartedTyping = false;

  switchTab(null);

  document.getElementById("game-results-overlay")?.classList.remove("open");
  document.getElementById("output")?.style.setProperty("display", "none");

  if (setupType === "qso") {
    document
      .getElementById("game-active")
      ?.style.setProperty("display", "none");
    document.getElementById("qso-active")?.style.setProperty("display", "flex");
    updateInputMethod();
    if (typeof startQso === "function") startQso();
    return;
  }

  document.getElementById("game-active")?.style.setProperty("display", "flex");
  document.getElementById("qso-active")?.style.setProperty("display", "none");

  // Ensure standard game UI is visible and wordle is hidden
  const wordDisplay = document.getElementById("current-word-display");
  if (wordDisplay) wordDisplay.style.display = "flex";

  const wordleContainer = document.getElementById("wordle-container");
  if (wordleContainer) wordleContainer.style.display = "none";

  const rxInstr = document.getElementById("rx-instruction");
  if (rxInstr) rxInstr.style.display = setupType === "recv" ? "block" : "none";

  const wpmControls = document.getElementById("quick-wpm-control");
  if (wpmControls) wpmControls.style.display = "flex";

  const progCont = document.getElementById("game-progress-container");
  if (progCont) progCont.style.display = "block";

  updateInputMethod();

  loadNewWord();
}

function loadNewWord() {
  if (gameState.gameMode === "learn") {
    renderLearnScreen();
  } else {
    const shouldPlay = gameState.trainingType === "recv";
    renderGameWord(shouldPlay);
  }
  const display = document.getElementById("current-word-display");
  if (display) {
    display.style.animation = "none";
    void display.offsetWidth;
    display.style.animation = "popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
  }
}

function finishGame() {
  try {
    gameState.active = false;
    stopAudioPlayback();
    if (typeof stopQsoAudio === "function") stopQsoAudio();

    if (gameState.wordStartTime) {
      gameState.sessionActiveTimeMs += Date.now() - gameState.wordStartTime;
      gameState.wordStartTime = null;
    }

    const rxInstruction = document.getElementById("rx-instruction");
    if (rxInstruction) rxInstruction.style.opacity = "0";

    const elapsedTime = gameState.sessionActiveTimeMs;
    userStats.totalPlayTime = (userStats.totalPlayTime || 0) + elapsedTime;

    // Track completed sessions for CTA logic
    userStats.sessionsCompleted = (userStats.sessionsCompleted || 0) + 1;

    if (gameState.gameMode === "callsigns")
      userStats.sessionsCallsigns = (userStats.sessionsCallsigns || 0) + 1;
    if (gameState.gameMode === "qcodes")
      userStats.sessionsQcodes = (userStats.sessionsQcodes || 0) + 1;

    const mins = elapsedTime / 60000;

    const sessionAcc =
      gameState.totalChars > 0
        ? Math.max(
            0,
            100 - Math.round((gameState.mistakes / gameState.totalChars) * 100),
          )
        : 100;

    let val = 0;
    if (gameState.trainingType === "recv") {
      if (sessionAcc >= 90) {
        val = settings.rxWpm || settings.wpm;
      }
    } else {
      const wpm = mins > 0 ? Math.round(gameState.totalChars / 5 / mins) : 0;
      val = isFinite(wpm) ? wpm : 0;
    }

    if (val > (userStats.bestWpm || 0)) {
      userStats.bestWpm = val;
    }

    const elWpm = document.getElementById("result-wpm");
    if (elWpm)
      elWpm.innerHTML =
        val +
        '<span style="font-size:0.9rem; margin-left:4px; font-weight:600; color:var(--text-muted);">WPM</span>';

    const elMistakes = document.getElementById("result-mistakes");
    if (elMistakes) elMistakes.textContent = gameState.mistakes;

    const elAcc = document.getElementById("result-accuracy");
    if (elAcc) elAcc.textContent = sessionAcc + "%";

    const secs = Math.floor(elapsedTime / 1000);
    const elTime = document.getElementById("result-time");
    if (elTime)
      elTime.textContent = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;

    // GAMIFICATION CHECKS
    if (sessionAcc === 100 && gameState.totalChars > 0) {
      userStats.perfectSessions = (userStats.perfectSessions || 0) + 1;
    }

    const checkAndAwardBadge = (id, condition) => {
      if (!userStats.badges) userStats.badges = [];
      if (condition && !userStats.badges.includes(id)) {
        userStats.badges.push(id);
        showToast(
          `Unlocked: ${BADGES_INFO[id].name}`,
          BADGES_INFO[id].icon,
          BADGES_INFO[id].color,
        );
      }
    };

    const hr = new Date().getHours();

    checkAndAwardBadge("first_blood", userStats.sessionsCompleted > 0);
    checkAndAwardBadge("apprentice", userStats.sessionsCompleted >= 10);
    checkAndAwardBadge("speed_demon", val >= 20);
    checkAndAwardBadge(
      "flawless",
      sessionAcc === 100 && gameState.totalChars > 0,
    );
    checkAndAwardBadge("sniper", userStats.perfectSessions >= 10);
    // NEW ACHIEVEMENTS
    checkAndAwardBadge("lightning", val >= 30);
    checkAndAwardBadge("qrq_master", val >= 40);
    checkAndAwardBadge("century", userStats.sessionsCompleted >= 100);
    checkAndAwardBadge("veteran", userStats.sessionsCompleted >= 500);
    checkAndAwardBadge("brass_pounder", userStats.tx.totalChars >= 1000);
    checkAndAwardBadge("golden_ear", userStats.rx.totalChars >= 1000);
    checkAndAwardBadge("marathoner", userStats.totalPlayTime >= 3600000); // 1 hr
    checkAndAwardBadge("fanatic", userStats.totalPlayTime >= 36000000); // 10 hrs
    checkAndAwardBadge("night_owl", hr >= 0 && hr < 4);
    checkAndAwardBadge("early_bird", hr >= 4 && hr < 8);
    checkAndAwardBadge("hawkeye", userStats.perfectSessions >= 50);
    checkAndAwardBadge(
      "endurance",
      sessionAcc === 100 && gameState.targetCount >= 50,
    );
    checkAndAwardBadge("dx_hunter", userStats.sessionsCallsigns >= 25);
    checkAndAwardBadge("radio_lingo", userStats.sessionsQcodes >= 25);
    checkAndAwardBadge(
      "koch_grad",
      gameState.gameMode === "koch" && userStats.kochLevel >= 40,
    );

    if (
      gameState.gameMode === "koch" &&
      userStats.kochLevel === userStats.maxKochLevel
    ) {
      if (userStats.maxKochLevel < KOCH_ORDER.length) {
        userStats.maxKochLevel++;
        userStats.kochLevel++;
        showToast(
          `Koch Level ${userStats.maxKochLevel} Unlocked!`,
          "unlock",
          "var(--accent-success)",
        );

        // Update UI
        const levelVal = document.getElementById("koch-level-val");
        if (levelVal) levelVal.textContent = userStats.kochLevel;

        const charsDisplay = document.getElementById("koch-chars-display");
        if (charsDisplay)
          charsDisplay.textContent = KOCH_ORDER.slice(
            0,
            userStats.kochLevel,
          ).join(" ");

        const slider = document.getElementById("koch-slider");
        if (slider) slider.value = userStats.kochLevel;
      }
    }

    checkAndAwardBadge(
      "alpha_soup",
      gameState.gameMode === "random" &&
        settings.charTypes.letters &&
        settings.charTypes.numbers &&
        settings.charTypes.specials &&
        (!settings.customChars || settings.customChars.length === 0),
    );
    checkAndAwardBadge(
      "old_school",
      sessionAcc === 100 &&
        settings.mode === "straight" &&
        gameState.trainingType === "send",
    );
    checkAndAwardBadge(
      "strict_disc",
      sessionAcc === 100 &&
        settings.strict &&
        gameState.trainingType === "send",
    );

    if (gameState.trainingType === "qso") {
      document
        .getElementById("qso-active")
        ?.style.setProperty("display", "none");
      document.getElementById("minigame-btn")?.classList.remove("active-state");
      document.getElementById("buttons")?.style.setProperty("display", "flex");
      document
        .getElementById("virtual-keyboard")
        ?.style.setProperty("display", "none");
      document.getElementById("output")?.style.setProperty("display", "flex");
      saveStats();
      return;
    }

    document
      .getElementById("game-active")
      ?.style.setProperty("display", "none");
    document.getElementById("minigame-btn")?.classList.remove("active-state");
    document.getElementById("buttons")?.style.setProperty("display", "flex");
    document
      .getElementById("virtual-keyboard")
      ?.style.setProperty("display", "none");
    document.getElementById("output")?.style.setProperty("display", "flex");

    if (gameState.gameMode === "qcodes") {
      if (!Array.isArray(userStats.qcodeHistory)) userStats.qcodeHistory = [];
      userStats.qcodeHistory.push(val);
      if (userStats.qcodeHistory.length > 50) userStats.qcodeHistory.shift();
    } else if (
      gameState.gameMode === "callsigns" ||
      gameState.gameMode === "random"
    ) {
      if (!Array.isArray(userStats.wpmHistory)) userStats.wpmHistory = [];
      userStats.wpmHistory.push(val);
      if (userStats.wpmHistory.length > 50) userStats.wpmHistory.shift();

      if (gameState.trainingType === "send") {
        if (!Array.isArray(userStats.txWpmHistory)) userStats.txWpmHistory = [];
        userStats.txWpmHistory.push(val);
        if (userStats.txWpmHistory.length > 50) userStats.txWpmHistory.shift();
        if (val > (userStats.bestTxWpm || 0)) userStats.bestTxWpm = val;
      } else if (gameState.trainingType === "recv") {
        if (!Array.isArray(userStats.rxWpmHistory)) userStats.rxWpmHistory = [];
        userStats.rxWpmHistory.push(val);
        if (userStats.rxWpmHistory.length > 50) userStats.rxWpmHistory.shift();
        if (val > (userStats.bestRxWpm || 0)) userStats.bestRxWpm = val;
      }
    }

    document.getElementById("game-results-overlay")?.classList.add("open");

    saveStats();
  } catch (e) {
    console.error("Game Finish Error", e);
    document
      .getElementById("game-active")
      ?.style.setProperty("display", "none");
    document.getElementById("game-results-overlay")?.classList.add("open");
  }
}
