function handleKeyboardRx(key) {
    if (!gameState.active || gameState.trainingType !== 'recv') return;
    const char = key.toUpperCase();
    if (!/^[A-Z0-9.,?'!/()&:;=+-_"$@]$/.test(char)) return;
    handleMinigameInput(char);
}
