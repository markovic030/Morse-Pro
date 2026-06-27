function handlePaddle(side, pressed) {
  if (gameState.active && gameState.trainingType === "recv") return;

  if (pressed) {
    if (
      (typeof initAudio === "function" &&
        typeof audioContext === "undefined") ||
      !audioContext
    )
      initAudio();
    if (
      typeof audioContext !== "undefined" &&
      audioContext &&
      audioContext.state === "suspended"
    )
      audioContext.resume();
  }

  const paddle = document.getElementById(side + "-paddle");

  let isDit =
    (side === "left" && settings.polarity === "normal") ||
    (side === "right" && settings.polarity !== "normal");

  if (pressed) {
    if (paddle) paddle.classList.add("pressed");

    if (isDit) {
      paddleState.ditCurrentlyPressed = true;
      if (morseState.isTransmitting) paddleState.ditLatch = true;
    } else {
      paddleState.dahCurrentlyPressed = true;
      if (morseState.isTransmitting) paddleState.dahLatch = true;
    }

    if (settings.mode === "straight" && side === "left") {
      handleStraightKey(true);
      return;
    }
    if (!morseState.isTransmitting) startIambic();
  } else {
    if (paddle) paddle.classList.remove("pressed");

    if (isDit) paddleState.ditCurrentlyPressed = false;
    else paddleState.dahCurrentlyPressed = false;

    if (settings.mode === "straight" && side === "left") {
      handleStraightKey(false);
    }
  }
}
