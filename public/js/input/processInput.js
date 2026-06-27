function processInput(char) {
    if(gameState.active && gameState.trainingType === 'send') {
        handleMinigameInput(char);
    } else if (gameState.active && gameState.trainingType === 'qso') {
        if (typeof handleQsoInput === 'function') {
            handleQsoInput(char);
        }
    } else {
        if(char && char !== '<ERR>') {
            const out = document.getElementById('output');
            out.textContent += char;
            out.scrollTop = out.scrollHeight;
        }
    }
}
