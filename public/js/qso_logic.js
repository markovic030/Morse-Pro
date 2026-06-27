function startQso() {
  const callsignInput = document.getElementById("qso-callsign");
  const userCall = callsignInput
    ? callsignInput.value.trim().toUpperCase()
    : "N0CALL";

  qsoState = {
    step: 0,
    botCallsign: generateCallsign(),
    botName: QSO_NAMES[Math.floor(Math.random() * QSO_NAMES.length)],
    botQth: QSO_QTHS[Math.floor(Math.random() * QSO_QTHS.length)],
    botWx: QSO_WX[Math.floor(Math.random() * QSO_WX.length)],
    botTemp: Math.floor(Math.random() * 28) + 3, // 3 to 30
    botRig: QSO_RIGS[Math.floor(Math.random() * QSO_RIGS.length)],
    botAnt: QSO_ANTS[Math.floor(Math.random() * QSO_ANTS.length)],
    botPwr: QSO_PWR[Math.floor(Math.random() * QSO_PWR.length)],
    botAge: Math.floor(Math.random() * 76) + 15, // 15 to 90
    botWpm: Math.floor(Math.random() * 21) + 10, // 10 to 30 WPM
    botPitchOffset: Math.floor(Math.random() * 100) - 50, // -50Hz to +50Hz
    fistType: Math.random() > 0.5 ? "straight" : "paddle",
    userCallsign: userCall,
    userName: null,
    userQth: null,
    userRst: null,
    userBuffer: "",
    botIsTyping: false,
    lastResponse: "",
    answeredQuestions: [],
    botSentInfo: [],
    botAskedQuestions: [],
  };

  const qsoOutput = document.getElementById("qso-output");
  qsoOutput.innerHTML = "";
  if (settings.hideQsoText) {
    qsoOutput.classList.add("hide-text");
  } else {
    qsoOutput.classList.remove("hide-text");
  }

  appendQsoText(
    `System: Send 'CQ CQ CQ DE ${qsoState.userCallsign} K' to begin.`,
    "system",
  );

  startQsoAudio();
}

function handleQsoInput(char) {
  if (qsoState.botIsTyping) return; // Ignore input while bot is typing

  if (!qsoState.txStartTime) {
    qsoState.txStartTime = Date.now();
  }

  if (!qsoState.currentUserMessage) {
    qsoState.currentUserMessage = appendQsoText("", "user");
  }

  if (char === "\b") {
    qsoState.userBuffer = qsoState.userBuffer.slice(0, -1);
    qsoState.currentUserMessage.textContent = qsoState.userBuffer;
    return;
  }

  if (char === "<ERR>") {
    // Delete the current word
    const words = qsoState.userBuffer.trimEnd().split(" ");
    words.pop();
    qsoState.userBuffer = words.length > 0 ? words.join(" ") + " " : "";
    qsoState.currentUserMessage.textContent = qsoState.userBuffer;
    return;
  }

  qsoState.userBuffer += char;
  qsoState.currentUserMessage.textContent = qsoState.userBuffer;

  const out = document.getElementById("qso-output");
  out.scrollTop = out.scrollHeight;

  // Check for end of transmission 'K' or 'KN' or 'AR'
  if (
    qsoState.userBuffer.endsWith(" K ") ||
    qsoState.userBuffer.endsWith(" KN ") ||
    qsoState.userBuffer.endsWith(" AR ")
  ) {
    qsoState.currentUserMessage = null;
    processQsoTurn();
  }
}

async function processQsoTurn() {
  let text = qsoState.userBuffer.trim().toUpperCase();
  qsoState.userBuffer = "";

  if (qsoState.txStartTime) {
    qsoState.txStartTime = null;
  }

  const cleaned = cleanUserBuffer(text);
  text = cleaned.text;
  const hints = cleaned.hints;

  let response = "";

  const sendResponse = async (resp, isRepeat = false) => {
    qsoState.lastResponse = resp;
    if (hints.length > 0 && !isRepeat) {
      hints.forEach((hint) => {
        appendQsoText(`System: ${hint}`, "system");
      });
    }
    await playQsoMessage(resp);
  };

  // Check for Q-codes first so they can be processed even on repeats
  let qCodes = [];
  if (/\bQRM\b/.test(text)) qCodes.push("QRM");
  if (/\bQSB\b/.test(text)) qCodes.push("QSB");
  if (/\bQSY\b/.test(text)) qCodes.push("QSY");
  if (/\bQRT\b/.test(text)) qCodes.push("QRT");
  if (/\bQRZ\b/.test(text)) qCodes.push("QRZ");
  if (/\bQSL\b/.test(text) || /\bQSL\?/.test(text)) qCodes.push("QSL");
  if (/\bQRS\b/.test(text)) qCodes.push("QRS");
  if (/\bQRQ\b/.test(text)) qCodes.push("QRQ");

  if (qCodes.includes("QRS")) {
    qsoState.botWpm = Math.max(5, qsoState.botWpm - 2);
  }
  if (qCodes.includes("QRQ")) {
    qsoState.botWpm = Math.min(60, qsoState.botWpm + 2);
  }

  // Check for repeat request
  const isRepeatRequest =
    text === "?" ||
    text === "? K" ||
    text === "? KN" ||
    text === "? AR" ||
    /\bAGN\b/.test(text) ||
    /\bRPT\b/.test(text) ||
    /\bREPEAT\b/.test(text) ||
    /\bSAY AGN\b/.test(text);

  if (isRepeatRequest) {
    if (qsoState.lastResponse) {
      response = qsoState.lastResponse;
      // Acknowledge speed changes if requested with repeat
      let prefix = "";
      if (qCodes.includes("QRS")) prefix += "RR QRS <BT> ";
      if (qCodes.includes("QRQ")) prefix += "RR QRQ <BT> ";
      response = prefix + response;
    } else {
      response = `? K`;
    }
    await sendResponse(response, true);
    return;
  }

  // Check for 73 or SK to end QSO early
  if ((text.includes("73") || text.includes("SK")) && qsoState.step > 0) {
    const nameStr = qsoState.userName ? ` ${qsoState.userName}` : "";
    response = `${qsoState.userCallsign} DE ${qsoState.botCallsign} RR TU FOR QSO${nameStr} 73 SK`;
    qsoState.step = 4;
    await sendResponse(response);
    return;
  }

  // Check for specific questions
  let askedQuestions = [];

  const isQuestion = (keyword) => {
    const hasQMark = new RegExp(`\\b${keyword}\\?`).test(text);
    const hasUr = new RegExp(`\\bUR ${keyword}\\b`).test(text);
    const hasHw = new RegExp(`\\bHW ${keyword}\\b`).test(text);
    const hasAgn =
      new RegExp(`\\bAGN ${keyword}\\b`).test(text) ||
      new RegExp(`\\b${keyword} AGN\\b`).test(text);
    const justKeyword = new RegExp(`\\b${keyword}\\b`).test(text);
    const isMy =
      new RegExp(`\\bMY ${keyword}\\b`).test(text) ||
      new RegExp(`\\b${keyword} IS\\b`).test(text) ||
      new RegExp(`\\b${keyword} HERE\\b`).test(text);

    if (hasAgn) return true; // Always answer if AGN
    if (isMy) return false; // Definitely not asking us

    if (hasQMark || hasUr || hasHw) {
      return (
        !qsoState.answeredQuestions.includes(keyword) || hasAgn || hasQMark
      );
    }

    // If just the keyword, only treat as question if we haven't answered it yet
    if (justKeyword && !qsoState.answeredQuestions.includes(keyword)) {
      return true;
    }

    return false;
  };

  if (/\bHW\b/.test(text) && !text.includes("HW?")) askedQuestions.push("HW");
  if (isQuestion("RST")) askedQuestions.push("RST");
  if (isQuestion("NAME")) askedQuestions.push("NAME");
  if (isQuestion("QTH")) askedQuestions.push("QTH");
  if (isQuestion("WX")) askedQuestions.push("WX");
  if (isQuestion("RIG")) askedQuestions.push("RIG");
  if (isQuestion("ANT")) askedQuestions.push("ANT");
  if (isQuestion("AGE")) askedQuestions.push("AGE");
  if (isQuestion("PWR")) askedQuestions.push("PWR");

  // Check for greetings
  let greeting = "";
  if (text.includes("GM")) greeting = "GM";
  else if (text.includes("GA")) greeting = "GA";
  else if (text.includes("GE")) greeting = "GE";
  else if (text.includes("GN")) greeting = "GN";

  let hasTu = text.includes("TU");

  let userSentRst = null;
  const rstPatterns = [
    /(?:UR\s+)?RST(?:\s+IS)?\s+(\d{3})/,
    /UR\s+(?:\s+IS)?\s*(\d{3})/,
    /(\d{3})\s+HR/,
  ];
  for (let p of rstPatterns) {
    let match = text.match(p);
    if (match) {
      userSentRst = simulateCopyFailure(match[1], "RST");
      if (userSentRst) qsoState.userRst = userSentRst;
      break;
    }
  }

  let userSentName = null;
  const namePatterns = [
    /(?:MY\s+)?(?:OP\s+)?(?:NAME|HANDLE|OP)(?:\s+IS)?\s+([A-Z]+)/,
  ];
  for (let p of namePatterns) {
    let match = text.match(p);
    if (match) {
      userSentName = simulateCopyFailure(match[1], "NAME");
      if (userSentName) qsoState.userName = userSentName;
      break;
    }
  }

  let userSentQth = null;
  const qthPatterns = [
    /(?:MY\s+)?(?:QTH|LOC)(?:\s+IS)?\s+([A-Z]+)/,
    /(?:HR|HERE)\s+IN\s+([A-Z]+)/,
  ];
  for (let p of qthPatterns) {
    let match = text.match(p);
    if (match) {
      userSentQth = simulateCopyFailure(match[1], "QTH");
      if (userSentQth) qsoState.userQth = userSentQth;
      break;
    }
  }

  let userSentWx = null;
  if (text.includes("WX IS") || text.includes("MY WX")) userSentWx = true;
  let userSentRig = null;
  if (text.includes("RIG IS") || text.includes("MY RIG")) userSentRig = true;
  let userSentAnt = null;
  if (text.includes("ANT IS") || text.includes("MY ANT")) userSentAnt = true;
  let userSentAge = null;
  if (text.includes("AGE IS") || text.includes("MY AGE")) userSentAge = true;
  let userSentPwr = null;
  if (text.includes("PWR IS") || text.includes("MY PWR")) userSentPwr = true;

  let reaction = "";
  if (text.includes("WX RAIN") || text.includes("WX SNOW")) {
    reaction = "SRI BAD WX <BT> ";
  } else if (text.includes("HI HI") || text.includes("HIHI")) {
    reaction = "HI HI <BT> ";
  } else if (text.includes("FB")) {
    reaction = "FB <BT> ";
  }

  const addressTerms = ["OM", "DR OP", ""];
  const address = addressTerms[Math.floor(Math.random() * addressTerms.length)];

  if (qCodes.includes("QRT")) {
    const nameStr = qsoState.userName ? ` ${qsoState.userName}` : "";
    response = `${qsoState.userCallsign} DE ${qsoState.botCallsign} RR QRT${nameStr} 73 SK`;
    qsoState.step = 4;
    await sendResponse(response);
    return;
  }

  if (qsoState.step === 0) {
    // Looking for CQ
    if (text.includes("CQ")) {
      response = `${qsoState.userCallsign} DE ${qsoState.botCallsign} K`;
      qsoState.step = 1;

      // 20% chance of a pile-up (another bot answering simultaneously)
      if (Math.random() < 0.2) {
        const secondBotCallsign = generateCallsign();
        const secondBotWpm = Math.floor(Math.random() * 20) + 10;
        const secondBotPitchOffset = Math.floor(Math.random() * 100) - 50;
        const secondBotResponse = `${qsoState.userCallsign} DE ${secondBotCallsign} K`;

        // Play second bot in background without awaiting
        playBackgroundMorse(
          secondBotResponse,
          secondBotWpm,
          "paddle",
          secondBotPitchOffset,
          true,
        );
      }
    } else {
      response = `? K`;
    }
  } else if (qsoState.step === 4) {
    const nameStr = qsoState.userName ? ` ${qsoState.userName}` : "";
    response = `73${nameStr} SK`;
  } else {
    // Dynamic conversational step
    response =
      qsoState.step === 1
        ? `${qsoState.userCallsign} DE ${qsoState.botCallsign} `
        : "";

    if (qsoState.step === 1 && greeting) response += `${greeting} `;
    if (qsoState.step === 1 && address) response += `${address} <BT> `;
    else response += `RR <BT> `;

    if (reaction) response += reaction;

    // Acknowledge user's info
    if (userSentRst) response += `TU FOR ${userSentRst} <BT> `;
    else if (hasTu) response += `TU <BT> `;

    if (userSentName) {
      const greetings = ["NICE TO MEET U", "GLD TO MEET U", "NICE TO WORK U"];
      const greet = greetings[Math.floor(Math.random() * greetings.length)];
      response += `${greet} ${userSentName} <BT> `;
    } else if (qsoState.missedInfo === "NAME") {
      response += `SRI QRM LOST UR NAME <BT> NAME AGN? K `;
      qsoState.missedInfo = null;
      await sendResponse(response);
      return;
    }

    if (userSentQth) {
      const qthComments = [
        "IS A NICE PLACE",
        "IS BEAUTIFUL",
        "IS A GREAT CITY",
      ];
      const comment =
        qthComments[Math.floor(Math.random() * qthComments.length)];
      response += `${userSentQth} ${comment} <BT> `;
    } else if (qsoState.missedInfo === "QTH") {
      response += `SRI QSB LOST UR QTH <BT> QTH AGN? K `;
      qsoState.missedInfo = null;
      await sendResponse(response);
      return;
    }

    // Answer questions
    let answered = false;
    askedQuestions.forEach((q) => {
      if (q === "WX") {
        response += `WX IS ${qsoState.botWx} TEMP ${qsoState.botTemp}C <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("WX");
        qsoState.botSentInfo.push("WX");
      }
      if (q === "RIG") {
        response += `RIG IS ${qsoState.botRig} PWR ${qsoState.botPwr} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("RIG");
        qsoState.botSentInfo.push("RIG");
      }
      if (q === "ANT") {
        response += `ANT IS ${qsoState.botAnt} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("ANT");
        qsoState.botSentInfo.push("ANT");
      }
      if (q === "AGE") {
        response += `AGE IS ${qsoState.botAge} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("AGE");
        qsoState.botSentInfo.push("AGE");
      }
      if (q === "PWR") {
        response += `PWR IS ${qsoState.botPwr} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("PWR");
        qsoState.botSentInfo.push("PWR");
      }
      if (q === "NAME") {
        response += `NAME IS ${qsoState.botName} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("NAME");
        qsoState.botSentInfo.push("NAME");
      }
      if (q === "QTH") {
        response += `QTH IS ${qsoState.botQth} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("QTH");
        qsoState.botSentInfo.push("QTH");
      }
      if (q === "RST") {
        const rst = generateRST();
        response += `UR RST ${rst} ${rst} <BT> `;
        answered = true;
        qsoState.answeredQuestions.push("RST");
        qsoState.botSentInfo.push("RST");
      }
    });

    // Reciprocate info
    if (userSentRst && !qsoState.botSentInfo.includes("RST")) {
      const rst = generateRST();
      response += `UR RST ${rst} ${rst} <BT> `;
      qsoState.botSentInfo.push("RST");
      answered = true;
    }
    if (userSentName && !qsoState.botSentInfo.includes("NAME")) {
      response += `NAME IS ${qsoState.botName} <BT> `;
      qsoState.botSentInfo.push("NAME");
      answered = true;
    }
    if (userSentQth && !qsoState.botSentInfo.includes("QTH")) {
      response += `QTH IS ${qsoState.botQth} <BT> `;
      qsoState.botSentInfo.push("QTH");
      answered = true;
    }
    if (userSentWx && !qsoState.botSentInfo.includes("WX")) {
      response += `WX IS ${qsoState.botWx} TEMP ${qsoState.botTemp}C <BT> `;
      qsoState.botSentInfo.push("WX");
      answered = true;
    }
    if (userSentRig && !qsoState.botSentInfo.includes("RIG")) {
      response += `RIG IS ${qsoState.botRig} PWR ${qsoState.botPwr} <BT> `;
      qsoState.botSentInfo.push("RIG");
      answered = true;
    }
    if (userSentAnt && !qsoState.botSentInfo.includes("ANT")) {
      response += `ANT IS ${qsoState.botAnt} <BT> `;
      qsoState.botSentInfo.push("ANT");
      answered = true;
    }
    if (userSentAge && !qsoState.botSentInfo.includes("AGE")) {
      response += `AGE IS ${qsoState.botAge} <BT> `;
      qsoState.botSentInfo.push("AGE");
      answered = true;
    }
    if (userSentPwr && !qsoState.botSentInfo.includes("PWR")) {
      response += `PWR IS ${qsoState.botPwr} <BT> `;
      qsoState.botSentInfo.push("PWR");
      answered = true;
    }

    // Handle Q-codes
    qCodes.forEach((q) => {
      if (q === "QRM") {
        response += `SRI FOR QRM <BT> `;
        answered = true;
      }
      if (q === "QSB") {
        response += `SRI FOR QSB <BT> `;
        answered = true;
      }
      if (q === "QSY") {
        response += `CANNOT QSY <BT> `;
        answered = true;
      }
      if (q === "QRZ") {
        response += `DE ${qsoState.botCallsign} <BT> `;
        answered = true;
      }
      if (q === "QSL") {
        response += `QSL QSL <BT> `;
        answered = true;
      }
      if (q === "QRS") {
        response += `RR QRS <BT> `;
        answered = true;
      }
      if (q === "QRQ") {
        response += `RR QRQ <BT> `;
        answered = true;
      }
    });

    // If we haven't sent much, volunteer some info or ask a question
    if (!answered && qsoState.step === 1) {
      // Fallback for step 1 if user didn't send anything useful
      const rst = generateRST();
      response += `UR RST ${rst} ${rst} <BT> NAME IS ${qsoState.botName} <BT> QTH IS ${qsoState.botQth} <BT> `;
      qsoState.botSentInfo.push("RST", "NAME", "QTH");
    }

    // Ask a question back
    const possibleQuestions = ["RST", "NAME", "QTH", "WX", "RIG", "ANT", "AGE"];
    let questionToAsk = null;

    // Prioritize basic info
    if (
      !qsoState.botAskedQuestions.includes("RST") &&
      !userSentRst &&
      !qsoState.userRst
    )
      questionToAsk = "RST";
    else if (
      !qsoState.botAskedQuestions.includes("NAME") &&
      !userSentName &&
      !qsoState.userName
    )
      questionToAsk = "NAME";
    else if (
      !qsoState.botAskedQuestions.includes("QTH") &&
      !userSentQth &&
      !qsoState.userQth
    )
      questionToAsk = "QTH";
    else {
      // Ask random advanced question
      const advanced = ["WX", "RIG", "ANT", "AGE"];
      const unasked = advanced.filter(
        (q) => !qsoState.botAskedQuestions.includes(q),
      );
      if (unasked.length > 0 && Math.random() > 0.5) {
        questionToAsk = unasked[Math.floor(Math.random() * unasked.length)];
      }
    }

    if (questionToAsk) {
      if (questionToAsk === "RST") response += `UR RST? `;
      else if (questionToAsk === "NAME") response += `UR NAME? `;
      else if (questionToAsk === "QTH") response += `UR QTH? `;
      else if (questionToAsk === "WX") response += `HW WX? `;
      else if (questionToAsk === "RIG") response += `UR RIG? `;
      else if (questionToAsk === "ANT") response += `UR ANT? `;
      else if (questionToAsk === "AGE") response += `UR AGE? `;

      qsoState.botAskedQuestions.push(questionToAsk);
    }

    const endMarkers = ["K", "KN", "BK"];
    const endMarker = endMarkers[Math.floor(Math.random() * endMarkers.length)];
    response += `${endMarker}`;

    qsoState.step = 2; // We stay in step 2 for conversational loop
  }

  await sendResponse(response);
}

async function playQsoMessage(msg) {
  qsoState.botIsTyping = true;
  const out = document.getElementById("qso-output");

  // Wait a bit before replying
  await new Promise((r) => setTimeout(r, 1000));

  let botMsgElement = appendQsoText("", "bot");
  let currentText = "";

  const botWpm = qsoState.botWpm;
  const fistType = qsoState.fistType || "paddle";
  const pitchOffset = qsoState.botPitchOffset || 0;
  const words = msg.split(" ");

  for (let w = 0; w < words.length; w++) {
    if (!gameState.active) break;

    const word = words[w];
    if (!word) continue;

    if (word === "<BT>") {
      currentText += "<BT>";
      botMsgElement.textContent = currentText;
      out.scrollTop = out.scrollHeight;
      await playMorseChar("-...-", botWpm, fistType, pitchOffset, true);
      await wait(getTimings(botWpm, true).wordGap);
      if (w < words.length - 1) {
        currentText += " ";
        botMsgElement.textContent = currentText;
      }
      continue;
    }

    // 5% chance to make a mistake on words longer than 3 chars
    if (word.length > 3 && Math.random() < 0.05) {
      // Send first 2-3 chars
      const errLen = Math.floor(Math.random() * 2) + 2;
      const errPart = word.substring(0, errLen);

      for (let i = 0; i < errPart.length; i++) {
        if (!gameState.active) break;
        const char = errPart[i].toUpperCase();
        currentText += char;
        botMsgElement.textContent = currentText;
        out.scrollTop = out.scrollHeight;
        const code = MORSE_TABLE[char];
        if (code) {
          await playMorseChar(code, botWpm, fistType, pitchOffset, true);
          let gap = getTimings(botWpm, true).letterGap;
          if (fistType === "straight")
            gap += Math.random() * getTimings(botWpm, true).dit * 2;
          await wait(gap);
        }
      }

      // Send error signal (8 dits)
      if (!gameState.active) break;
      currentText += " ........ ";
      botMsgElement.textContent = currentText;
      out.scrollTop = out.scrollHeight;
      await playMorseChar("........", botWpm, fistType, pitchOffset, true);
      let wGap = getTimings(botWpm, true).wordGap;
      if (fistType === "straight")
        wGap += Math.random() * getTimings(botWpm, true).dit * 4;
      await wait(wGap);
    }

    // Send the actual word
    for (let i = 0; i < word.length; i++) {
      if (!gameState.active) break;
      const char = word[i].toUpperCase();
      currentText += char;
      botMsgElement.textContent = currentText;
      out.scrollTop = out.scrollHeight;
      const code = MORSE_TABLE[char];
      if (code) {
        await playMorseChar(code, botWpm, fistType, pitchOffset, true);
        let gap = getTimings(botWpm, true).letterGap;
        if (fistType === "straight")
          gap += Math.random() * getTimings(botWpm, true).dit * 2;
        await wait(gap);
      }
    }

    // Space after word
    if (w < words.length - 1) {
      currentText += " ";
      botMsgElement.textContent = currentText;
      out.scrollTop = out.scrollHeight;
      let wGap = getTimings(botWpm, true).wordGap;
      if (fistType === "straight")
        wGap += Math.random() * getTimings(botWpm, true).dit * 4;
      await wait(wGap);
    }
  }

  qsoState.botIsTyping = false;
}

function appendQsoText(text, type) {
  const out = document.getElementById("qso-output");
  const div = document.createElement("div");
  div.className = `qso-msg qso-msg-${type}`;
  div.textContent = text;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
  return div;
}

document.getElementById("quit-qso-btn").onclick = () => {
  finishGame();
};
