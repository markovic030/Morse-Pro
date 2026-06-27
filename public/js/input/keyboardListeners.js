let activeKeyboardKeys = { key1: false, key2: false };

document.addEventListener("keydown", (e) => {
  // Only intercept paddle keys if not in an input field and not tracking specific keyboard logic
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (gameState.active && gameState.trainingType === "recv") {
    handleKeyboardRx(e.key);
    return;
  }

  if (e.repeat) return; // Prevent key repeat events from messing up timings

  if (
    (typeof initAudio === "function" && typeof audioContext === "undefined") ||
    !audioContext
  )
    initAudio();
  if (
    typeof audioContext !== "undefined" &&
    audioContext &&
    audioContext.state === "suspended"
  )
    audioContext.resume();

  let isLeft =
    e.key === "," ||
    e.key === "[" ||
    e.key === "ArrowLeft" ||
    e.code === "ControlLeft" ||
    e.key.toLowerCase() === "š";
  let isRight =
    e.key === "." ||
    e.key === "]" ||
    e.key === "ArrowRight" ||
    e.code === "ControlRight" ||
    e.key.toLowerCase() === "đ";

  // Make spacebar fire straight-key optionally over in left-paddle if needed,
  // but in straight mode space usually maps to left internally
  if (settings.mode === "straight" && e.code === "Space") {
    isLeft = true;
    // Don't swallow space if typing in QSO unless it's handled by paddle
    if (gameState.trainingType === "qso") {
      // Keep default? Let's just let it act as paddle
    }
  }

  if (isLeft) {
      // DEFINITIVE FIX: Only fire if the key wasn't already held down
      if (!activeKeyboardKeys.key1) { 
        activeKeyboardKeys.key1 = true;
        handlePaddle("left", true);
      }
      e.preventDefault();
    } else if (isRight) {
      // DEFINITIVE FIX: Only fire if the key wasn't already held down
      if (!activeKeyboardKeys.key2) {
        activeKeyboardKeys.key2 = true;
        handlePaddle("right", true);
      }
    e.preventDefault();
  } else if (e.key === "Backspace" && gameState.trainingType === "qso") {
    processInput("<ERR>");
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  let isLeft =
    e.key === "," ||
    e.key === "[" ||
    e.key === "ArrowLeft" ||
    e.code === "ControlLeft" ||
    e.key.toLowerCase() === "š";
  let isRight =
    e.key === "." ||
    e.key === "]" ||
    e.key === "ArrowRight" ||
    e.code === "ControlRight" ||
    e.key.toLowerCase() === "đ";

  if (settings.mode === "straight" && e.code === "Space") {
    isLeft = true;
  }

  if (isLeft) {
    activeKeyboardKeys.key1 = false;
    handlePaddle("left", false);
  } else if (isRight) {
    activeKeyboardKeys.key2 = false;
    handlePaddle("right", false);
  }
});
