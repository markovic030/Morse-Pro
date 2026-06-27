function loadData() {
  try {
    const s = localStorage.getItem("morseProSettings");
    if (s) {
      const parsedS = JSON.parse(s);
      settings = { ...settings, ...parsedS };
      if (!settings.weighting) settings.weighting = 3.0;
      if (!settings.wordSpace) settings.wordSpace = 7;
      if (!settings.rxWpm) settings.rxWpm = settings.wpm || 15;
      if (!settings.farnsworthWpm) settings.farnsworthWpm = 10;
      if (!settings.sessionLength) settings.sessionLength = 10;
      if (settings.customChars === undefined) settings.customChars = "";
    }
    if (settings.polarity !== "normal" && settings.polarity !== "inverse")
      settings.polarity = "normal";
    if (!settings.charTypes)
      settings.charTypes = { letters: true, numbers: false, specials: false };

    const st = localStorage.getItem("morseProStats");
    if (st) {
      const parsed = JSON.parse(st);
      let txData = parsed.tx || { totalChars: 0, totalErrors: 0, heat: {} };
      if (!txData.heat) txData.heat = {};
      if (typeof txData.totalChars !== "number") txData.totalChars = 0;
      if (typeof txData.totalErrors !== "number") txData.totalErrors = 0;

      let rxData = parsed.rx || { totalChars: 0, totalErrors: 0, heat: {} };
      if (!rxData.heat) rxData.heat = {};
      if (typeof rxData.totalChars !== "number") rxData.totalChars = 0;
      if (typeof rxData.totalErrors !== "number") rxData.totalErrors = 0;

      if (
        parsed.missedLetters &&
        (!parsed.tx || Object.keys(parsed.tx.heat).length === 0)
      ) {
        Object.assign(txData.heat, parsed.missedLetters);
      }

      userStats = {
        wpmHistory: Array.isArray(parsed.wpmHistory) ? parsed.wpmHistory : [],
        txWpmHistory: Array.isArray(parsed.txWpmHistory)
          ? parsed.txWpmHistory
          : [],
        rxWpmHistory: Array.isArray(parsed.rxWpmHistory)
          ? parsed.rxWpmHistory
          : [],
        qcodeHistory: Array.isArray(parsed.qcodeHistory)
          ? parsed.qcodeHistory
          : [],
        tx: txData,
        rx: rxData,
        learnIndex: parsed.learnIndex || 0,
        totalPlayTime: parsed.totalPlayTime || 0,
        kochLevel: parsed.kochLevel || 1,
        maxKochLevel: parsed.maxKochLevel || parsed.kochLevel || 1,
        sessionsCompleted: parsed.sessionsCompleted || 0,
        lastCtaSession: parsed.lastCtaSession || 0,
        hasDonated: parsed.hasDonated || false,
        lastPlayDate: parsed.lastPlayDate || null,
        perfectSessions: parsed.perfectSessions || 0,
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        sessionsCallsigns: parsed.sessionsCallsigns || 0,
        sessionsQcodes: parsed.sessionsQcodes || 0,
        bestWpm: parsed.bestWpm || 0,
        bestTxWpm: parsed.bestTxWpm || 0,
        bestRxWpm: parsed.bestRxWpm || 0,
      };
    }
  } catch (e) {
    console.warn("Stats Load Error", e);
  }
}

function saveData() {
  localStorage.setItem("morseProSettings", JSON.stringify(settings));
}

function saveStats() {
  localStorage.setItem("morseProStats", JSON.stringify(userStats));
}
