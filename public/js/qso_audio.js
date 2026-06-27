function startQsoAudio() {
  if (!audioContext) initAudio();
  qsoAudioContext = audioContext;

  // QRM (Noise) - Realistic CW Band Environment
  const qrmLevel = document.getElementById("qso-qrm")
    ? parseInt(document.getElementById("qso-qrm").value)
    : 30;

  qrmGain = qsoAudioContext.createGain();
  qrmGain.gain.value = (qrmLevel / 100) * 1.5; // Increased base volume
  // Connect to masterGain to prevent clipping with sidetone
  qrmGain.connect(masterGain ? masterGain : qsoAudioContext.destination);

  // 1. Ringing DSP Noise (White noise through tight bandpass filter)
  // This simulates the "hollow" or "ringing" sound of a tight CW filter
  const bufferSize = qsoAudioContext.sampleRate * 2;
  const buffer = qsoAudioContext.createBuffer(
    1,
    bufferSize,
    qsoAudioContext.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // White noise
  }
  qrmNode = qsoAudioContext.createBufferSource();
  qrmNode.buffer = buffer;
  qrmNode.loop = true;

  qrmFilter = qsoAudioContext.createBiquadFilter();
  qrmFilter.type = "bandpass";
  qrmFilter.frequency.value = settings.tone || 600; // Center on sidetone
  qrmFilter.Q.value = 15; // Tight Q for ringing sound (approx 40Hz bandwidth)

  const hissGain = qsoAudioContext.createGain();
  hissGain.gain.value = 0.8; // Balance hiss vs whistles

  qrmNode.connect(qrmFilter);
  qrmFilter.connect(hissGain);
  hissGain.connect(qrmGain);
  qrmNode.start();

  // 2. Heterodyne Whistles & Needley Sounds (Unmodulated carriers)
  qrmOscillators = [];

  // Whistle 1: Close to sidetone (beating effect)
  const osc1 = qsoAudioContext.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value =
    (settings.tone || 600) +
    (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 80);
  const osc1Gain = qsoAudioContext.createGain();
  osc1Gain.gain.value = 0.03 + Math.random() * 0.02;
  osc1.connect(osc1Gain);
  osc1Gain.connect(qrmGain);
  osc1.start();
  qrmOscillators.push({ osc: osc1, gain: osc1Gain });

  // Whistle 2: High-pitched "needley" sound
  const osc2 = qsoAudioContext.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 1500 + Math.random() * 1000; // High pitch
  const osc2Gain = qsoAudioContext.createGain();
  osc2Gain.gain.value = 0.01 + Math.random() * 0.01; // Very quiet but piercing
  osc2.connect(osc2Gain);
  osc2Gain.connect(qrmGain);
  osc2.start();
  qrmOscillators.push({ osc: osc2, gain: osc2Gain });

  // Whistle 3: Drifting carrier (tuning up)
  const osc3 = qsoAudioContext.createOscillator();
  osc3.type = "sine";
  osc3.frequency.value = (settings.tone || 600) - 200;
  const osc3Gain = qsoAudioContext.createGain();
  osc3Gain.gain.value = 0.02;

  const lfo = qsoAudioContext.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.02; // Very slow drift
  const lfoGain = qsoAudioContext.createGain();
  lfoGain.gain.value = 300; // Drift range

  lfo.connect(lfoGain);
  lfoGain.connect(osc3.frequency);
  lfo.start();

  osc3.connect(osc3Gain);
  osc3Gain.connect(qrmGain);
  osc3.start();
  qrmOscillators.push({ osc: osc3, gain: osc3Gain, lfo, lfoGain });

  // QSB (Fading)
  let time = 0;
  qsbInterval = setInterval(() => {
    time += 0.1;
    const currentQsb = document.getElementById("qso-qsb")
      ? parseInt(document.getElementById("qso-qsb").value)
      : 30;

    // Smooth fading using combined sine waves
    const wave1 = Math.sin(time * 0.5);
    const wave2 = Math.sin(time * 0.31);
    const wave3 = Math.sin(time * 0.73);
    const combined = (wave1 + wave2 * 0.5 + wave3 * 0.25) / 1.75; // -1 to 1

    // Map to fade depth (0 to 1)
    const fadeDepth = currentQsb / 100;
    // If combined is 1, fade is 1.0 (full volume). If combined is -1, fade is 1.0 - fadeDepth.
    qsbFade = 1.0 - (fadeDepth * (1 - combined)) / 2;

    if (qrmFilter) {
      qrmFilter.frequency.setTargetAtTime(
        settings.tone || 600,
        qsoAudioContext.currentTime,
        0.1,
      );
    }

    // Also apply QSB to crowded stations
    crowdedStations.forEach((station, index) => {
      const sTime = time + index * 10;
      const sWave1 = Math.sin(sTime * 0.4);
      const sWave2 = Math.sin(sTime * 0.27);
      const sCombined = (sWave1 + sWave2 * 0.5) / 1.5;
      station.currentQsbFade = 1.0 - (fadeDepth * (1 - sCombined)) / 2;
    });
  }, 100);

  // Crowded Stations
  const crowdLevel = document.getElementById("qso-crowd")
    ? parseInt(document.getElementById("qso-crowd").value)
    : 2;
  for (let i = 0; i < crowdLevel; i++) {
    startCrowdedStation(i);
  }

  // Add event listeners for dynamic updates
  const qrmSlider = document.getElementById("qso-qrm");
  if (qrmSlider) {
    qrmSlider.addEventListener("input", (e) => {
      if (qrmGain) {
        qrmGain.gain.setTargetAtTime(
          (parseInt(e.target.value) / 100) * 1.5,
          qsoAudioContext.currentTime,
          0.1,
        );
      }
    });
  }

  const crowdSlider = document.getElementById("qso-crowd");
  if (crowdSlider) {
    crowdSlider.addEventListener("input", (e) => {
      const newLevel = parseInt(e.target.value);
      while (crowdedStations.length < newLevel) {
        startCrowdedStation(crowdedStations.length);
      }
      while (crowdedStations.length > newLevel) {
        const station = crowdedStations.pop();
        if (station.timeout) clearTimeout(station.timeout);
        if (station.osc) {
          try {
            station.osc.stop();
            station.osc.disconnect();
          } catch (err) {}
        }
        if (station.gain) {
          try {
            station.gain.disconnect();
          } catch (err) {}
        }
      }
    });
  }

  const crowdVolSlider = document.getElementById("qso-crowd-vol");
  if (crowdVolSlider) {
    crowdVolSlider.addEventListener("input", (e) => {
      const volLevel = parseInt(e.target.value) / 100;
      crowdedStations.forEach((station) => {
        station.baseVol = volLevel * (0.1 + Math.random() * 0.3);
      });
    });
  }
}

function stopQsoAudio() {
  if (qrmNode) {
    try {
      qrmNode.stop();
      qrmNode.disconnect();
    } catch (e) {}
    qrmNode = null;
  }
  if (qrmFilter) {
    try {
      qrmFilter.disconnect();
    } catch (e) {}
    qrmFilter = null;
  }
  if (qrmGain) {
    try {
      qrmGain.disconnect();
    } catch (e) {}
    qrmGain = null;
  }
  if (qrmOscillators) {
    qrmOscillators.forEach((o) => {
      try {
        o.osc.stop();
        o.osc.disconnect();
      } catch (e) {}
      try {
        o.gain.disconnect();
      } catch (e) {}
      if (o.lfo) {
        try {
          o.lfo.stop();
          o.lfo.disconnect();
        } catch (e) {}
      }
      if (o.lfoGain) {
        try {
          o.lfoGain.disconnect();
        } catch (e) {}
      }
    });
    qrmOscillators = [];
  }
  if (qsbInterval) {
    clearInterval(qsbInterval);
    qsbInterval = null;
  }
  qsbFade = 1.0;
  crowdedStations.forEach((station) => {
    if (station.timeout) clearTimeout(station.timeout);
    if (station.osc) {
      try {
        station.osc.stop();
        station.osc.disconnect();
      } catch (e) {}
    }
    if (station.gain) {
      try {
        station.gain.disconnect();
      } catch (e) {}
    }
  });
  crowdedStations = [];
}

function startCrowdedStation(index) {
  const volLevel = document.getElementById("qso-crowd-vol")
    ? parseInt(document.getElementById("qso-crowd-vol").value) / 100
    : 0.3;
  const station = {
    osc: qsoAudioContext.createOscillator(),
    gain: qsoAudioContext.createGain(),
    timeout: null,
    freq: 400 + Math.random() * 600, // Random frequency between 400 and 1000 Hz
    wpm: 15 + Math.random() * 15, // Random WPM between 15 and 30
    baseVol: volLevel * (0.1 + Math.random() * 0.3), // Increased base volume scaled by slider
  };

  station.osc.type = "sine";
  station.osc.frequency.value = station.freq;
  station.gain.gain.value = 0;

  station.osc.connect(station.gain);
  station.gain.connect(masterGain ? masterGain : qsoAudioContext.destination);
  station.osc.start();

  crowdedStations.push(station);

  playCrowdedSequence(station);
}

async function playCrowdedSequence(station) {
  if (!gameState.active || gameState.trainingType !== "qso") return;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const char = chars[Math.floor(Math.random() * chars.length)];
  const code = MORSE_TABLE[char];

  if (code) {
    const t_char = 1200 / station.wpm;
    const dit = t_char;
    const dah = t_char * 3;
    const elementGap = t_char;
    const letterGap = t_char * 3;

    // Randomly adjust base volume slightly for each word to simulate movement/fading
    const wordVol = station.baseVol * (0.3 + Math.random() * 0.7);

    for (let i = 0; i < code.length; i++) {
      if (!gameState.active || gameState.trainingType !== "qso") break;

      const symbol = code[i];
      const duration = symbol === "." ? dit : dah;

      // Apply QSB to this station
      const currentVol = wordVol * (station.currentQsbFade || 1.0);

      station.gain.gain.setTargetAtTime(
        currentVol,
        qsoAudioContext.currentTime,
        0.005,
      );
      await wait(duration);
      station.gain.gain.setTargetAtTime(
        0.00001,
        qsoAudioContext.currentTime,
        0.005,
      );

      if (i < code.length - 1) {
        await wait(elementGap);
      }
    }

    await wait(letterGap + Math.random() * letterGap * 2); // Random pauses between letters
  }

  if (gameState.active && gameState.trainingType === "qso") {
    station.timeout = setTimeout(
      () => playCrowdedSequence(station),
      Math.random() * 2000,
    );
  }
}

async function playBackgroundMorse(
  msg,
  wpmValue = 0,
  fistType = "paddle",
  pitchOffset = 0,
  isAbsolute = false,
) {
  if (!qsoAudioContext) return;

  const bgOsc = qsoAudioContext.createOscillator();
  const bgGain = qsoAudioContext.createGain();

  bgOsc.type = "sine";
  bgOsc.frequency.value = (settings.tone || 600) + pitchOffset;
  bgGain.gain.value = 0;

  bgOsc.connect(bgGain);
  bgGain.connect(masterGain ? masterGain : qsoAudioContext.destination);
  bgOsc.start();

  const volLevel = document.getElementById("qso-crowd-vol")
    ? parseInt(document.getElementById("qso-crowd-vol").value) / 100
    : 0.3;
  const baseVol = volLevel * 0.5; // Slightly quieter than main bot

  const playBgChar = async (code) => {
    for (let i = 0; i < code.length; i++) {
      if (!gameState.active) break;
      const symbol = code[i];
      const t = getTimings(wpmValue, isAbsolute);

      let duration = symbol === "." ? t.dit : t.dah;
      if (fistType === "straight") {
        duration += (Math.random() - 0.5) * t.dit * 0.2;
      }

      bgGain.gain.setTargetAtTime(baseVol, qsoAudioContext.currentTime, 0.005);
      await wait(duration);
      bgGain.gain.setTargetAtTime(0.00001, qsoAudioContext.currentTime, 0.005);

      if (i < code.length - 1) {
        let gap = t.elementGap;
        if (fistType === "straight") gap += Math.random() * t.dit * 0.5;
        await wait(gap);
      }
    }
  };

  const words = msg.split(" ");

  for (let w = 0; w < words.length; w++) {
    if (!gameState.active) break;

    const word = words[w];
    if (!word) continue;

    if (word === "<BT>") {
      await playBgChar("-...-");
      await wait(getTimings(wpmValue, isAbsolute).wordGap);
      continue;
    }

    for (let i = 0; i < word.length; i++) {
      if (!gameState.active) break;
      const char = word[i].toUpperCase();
      const code = MORSE_TABLE[char];
      if (code) {
        await playBgChar(code);
        let gap = getTimings(wpmValue, isAbsolute).letterGap;
        if (fistType === "straight")
          gap += Math.random() * getTimings(wpmValue, isAbsolute).dit * 2;
        await wait(gap);
      }
    }

    if (w < words.length - 1) {
      let wGap = getTimings(wpmValue, isAbsolute).wordGap;
      if (fistType === "straight")
        wGap += Math.random() * getTimings(wpmValue, isAbsolute).dit * 4;
      await wait(wGap);
    }
  }

  try {
    bgOsc.stop();
    bgOsc.disconnect();
    bgGain.disconnect();
  } catch (e) {}
}
