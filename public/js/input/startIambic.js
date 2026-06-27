function startIambic() {
    if (morseState.isTransmitting) return;

    clearTimeout(morseState.wordTimeout);

    let wantDit = paddleState.ditCurrentlyPressed || paddleState.ditLatch;
    let wantDah = paddleState.dahCurrentlyPressed || paddleState.dahLatch;
    let nextElement = null;

    if (wantDit && wantDah) {
        if (morseState.lastElement === '.') {
            nextElement = '-';
        } else {
            nextElement = '.';
        }
    } else if (wantDit) {
        nextElement = '.';
    } else if (wantDah) {
        nextElement = '-';
    }

    if (!nextElement) {
        morseState.elementQueue = [];
        handleSymbolCompletion();
        return;
    }

    if (nextElement === '.') paddleState.ditLatch = false;
    if (nextElement === '-') paddleState.dahLatch = false;

    // Iambic B extra element latching
    if (settings.mode === 'iambicB' && paddleState.ditCurrentlyPressed && paddleState.dahCurrentlyPressed) {
        if (nextElement === '.') paddleState.dahLatch = true;
        if (nextElement === '-') paddleState.ditLatch = true;
    }

    if (morseState.currentCode.length >= 8) {
        processInput('<ERR>');
        morseState.currentCode = '';
        morseState.isTransmitting = true;
        setTimeout(() => {
            morseState.isTransmitting = false;
            startIambic();
        }, getTimings().letterGap);
        return;
    }

    morseState.isTransmitting = true;
    morseState.lastElement = nextElement;
    morseState.currentCode += nextElement;

    playTone();

    const t = getTimings();
    const duration = nextElement === '.' ? t.dit : t.dah;

    setTimeout(() => {
        stopTone();
        setTimeout(() => {
            morseState.isTransmitting = false;
            startIambic();
        }, t.elementGap);
    }, duration);
}
