function handleStraightKey(down) {
    if(down) {
        if(!morseState.isTransmitting) {
            playTone();
            morseState.isTransmitting = true;
            morseState.elementStartTime = Date.now();
            clearTimeout(morseState.wordTimeout);
        }
    } else {
        if(morseState.isTransmitting) {
            stopTone();
            morseState.isTransmitting = false;
            const duration = Date.now() - morseState.elementStartTime;
            
            const t = getTimings();
            let symbol = duration > t.dit * 1.5 ? '-' : '.';
            
            morseState.currentCode += symbol;
            
            clearTimeout(morseState.wordTimeout);
            handleSymbolCompletion();
        }
    }
}
