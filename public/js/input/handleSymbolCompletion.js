function handleSymbolCompletion() {
    clearTimeout(morseState.wordTimeout);
    
    if(morseState.currentCode.length >= 8) {
        processInput('<ERR>');
        morseState.currentCode = '';
        return;
    }

    const t = getTimings();
    
    // Base character decoding strictly on dit speed for paddles.
    // After an element concludes, there is 1 dit of elementGap already waited natively by startIambic.
    // We add 1.2 dits of slack before declaring the character mathematically finished. Total gap: 2.2 dits.
    // This perfectly separates fast characters without blending them into a '?', just like VBand.
    let gapThreshold = t.dit * 1.2; 
    let silenceElapsed = t.elementGap;

    if(settings.mode === 'straight') {
        // Straight keys don't enforce element gaps automatically, and users are generally less precise.
        gapThreshold = t.letterGap * 0.8;
        silenceElapsed = 0; // handleStraightKey calls this immediately upon keyup
    }

    morseState.wordTimeout = setTimeout(() => {
        if(morseState.currentCode) {
            const char = REVERSE_MORSE[morseState.currentCode];
            if (char) {
                processInput(char);
            } else if (gameState.active && gameState.trainingType === 'send') {
                processInput('<UNRECOGNIZED>');
            }
            morseState.currentCode = '';
            
            // Handle Word Spacing
            if(!gameState.active || gameState.trainingType === 'qso') {
                
                const wordGapRemaining = Math.max(0, t.wordGap - (silenceElapsed + gapThreshold));
                
                morseState.wordTimeout = setTimeout(() => {
                    if (gameState.trainingType === 'qso') {
                        if (typeof handleQsoInput === 'function') handleQsoInput(' ');
                    } else {
                        const out = document.getElementById('output');
                        // Only add space if we haven't already
                        if(out && out.textContent.length > 0 && !out.textContent.endsWith(' ')) {
                            out.textContent += ' ';
                        }
                    }
                }, wordGapRemaining);
            }
        }
    }, gapThreshold);
}
