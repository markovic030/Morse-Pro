function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    masterCompressor = audioContext.createDynamicsCompressor();
    masterCompressor.threshold.value = -3;
    masterCompressor.knee.value = 10;
    masterCompressor.ratio.value = 12;
    masterCompressor.attack.value = 0.003;
    masterCompressor.release.value = 0.25;

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.8; // Prevent clipping before compressor

    masterGain.connect(masterCompressor);
    masterCompressor.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") {
    audioContext
      .resume()
      .then(() => console.log("Audio Context Force Resumed"));
  }
  if (osc) {
    try {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch (e) {}
  }
  osc = audioContext.createOscillator();
  gain = audioContext.createGain();
  osc.type = settings.toneType;
  osc.frequency.value = settings.tone;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
}

function playTone(pitchOffset = 0) {
  const indicator = document.getElementById("visual-indicator");
  indicator.style.background = `var(--primary)`;
  indicator.style.opacity = "1";

  if (!audioContext || !gain) {
    initAudio();
  }
  if (audioContext.state === "suspended") audioContext.resume();

  if (osc) {
    osc.frequency.setTargetAtTime(
      settings.tone + pitchOffset,
      audioContext.currentTime,
      0.01,
    );
  }

  const divider = settings.toneType === "sawtooth" ? 1000 : 200; // Increased divider to prevent clipping
  gain.gain.cancelScheduledValues(audioContext.currentTime);

  // Only apply QSB fade to the bot's transmission, not the user's sidetone
  const currentFade =
    typeof qsoState !== "undefined" && qsoState.botIsTyping ? qsbFade : 1.0;

  gain.gain.setTargetAtTime(
    (settings.vol / divider) * currentFade,
    audioContext.currentTime,
    0.005,
  );
}

function stopTone() {
  const indicator = document.getElementById("visual-indicator");
  indicator.style.background = `var(--primary)`;
  indicator.style.opacity = "0.3";

  if (!audioContext || !gain) return;
  gain.gain.setTargetAtTime(0.00001, audioContext.currentTime, 0.005);
}

async function playMorseWord(word) {
  if (isPlayingSequence) return;
  isPlayingSequence = true;
  await new Promise((r) => (audioQueueTimeout = setTimeout(r, 500)));
  for (let i = 0; i < word.length; i++) {
    if (!gameState.active) break;
    const char = word[i].toUpperCase();
    const code = MORSE_TABLE[char];
    if (code) {
      await playMorseChar(code);
      await wait(getTimings().letterGap);
    }
  }
  isPlayingSequence = false;
}

async function playMorseChar(
  code,
  wpmValue = 0,
  fistType = "paddle",
  pitchOffset = 0,
  isAbsolute = false,
) {
  for (let i = 0; i < code.length; i++) {
    if (!gameState.active) return;
    const symbol = code[i];
    const t = getTimings(wpmValue, isAbsolute);

    let duration = symbol === "." ? t.dit : t.dah;
    if (fistType === "straight") {
      duration += (Math.random() - 0.5) * t.dit * 0.2; // slight variance
    }

    playTone(pitchOffset);
    await wait(duration);
    stopTone();

    if (i < code.length - 1) {
      let gap = t.elementGap;
      if (fistType === "straight") {
        gap += Math.random() * t.dit * 0.5;
      }
      await wait(gap);
    }
  }
}

function wait(ms) {
  return new Promise(
    (resolve) => (audioQueueTimeout = setTimeout(resolve, ms)),
  );
}

function stopAudioPlayback() {
  clearTimeout(audioQueueTimeout);
  stopTone();
  isPlayingSequence = false;
}

function getTimings(wpmValue = 0, isAbsolute = false) {
  const isRx =
    (gameState.active && gameState.trainingType === "recv") ||
    isPlayingSequence;
  const baseWpm = isRx ? settings.rxWpm : settings.wpm;

  let charWpm = isAbsolute ? wpmValue : baseWpm + wpmValue;
  let spacingWpm = isAbsolute ? wpmValue : baseWpm + wpmValue;

  if (settings.farnsworth && isRx) {
    charWpm = isAbsolute
      ? Math.max(20, wpmValue)
      : Math.max(20, baseWpm) + wpmValue;
    spacingWpm = isAbsolute ? wpmValue : baseWpm + wpmValue;
  }

  const t_char = 1200 / charWpm;
  const t_space = 1200 / spacingWpm;

  const weight = settings.weighting || 3.0;
  const wSpace = settings.wordSpace || 7;

  return {
    dit: t_char,
    dah: t_char * weight,
    elementGap: t_char,
    letterGap: t_space * 3,
    wordGap: t_space * wSpace,
  };
}
