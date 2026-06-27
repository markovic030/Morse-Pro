function handleMinigameInput(char) {
    if (!gameState.active) return;
    
    if (!gameState.hasStartedTyping) {
        gameState.hasStartedTyping = true;
        gameState.wordStartTime = Date.now();
    }
    
    const item = gameState.items[gameState.currentItemIndex];
    if (!item) return; 
    
    let targetChar;
    if (gameState.gameMode === 'learn') targetChar = item.target; 
    else targetChar = item.target[gameState.currentCharIndex];
    
    const targetCharUpper = targetChar.toUpperCase();
    const charUpper = char.toUpperCase();
    
    const modeKey = (gameState.trainingType === 'send') ? 'tx' : 'rx';
    
    if (!userStats[modeKey]) userStats[modeKey] = { totalChars: 0, totalErrors: 0, heat: {} };
    
    if(charUpper === targetCharUpper) {
        userStats[modeKey].totalChars++;
        gameState.totalChars++;
        
        // Update heat map (decrease heat for correct)
        if(!userStats[modeKey].heat[targetChar]) userStats[modeKey].heat[targetChar] = 0;
        userStats[modeKey].heat[targetChar] = Math.max(0, userStats[modeKey].heat[targetChar] - 1);
        
        const keyEl = document.getElementById(`learn-key-${targetChar}`);
        if(keyEl) {
            keyEl.classList.remove('error');
            keyEl.style.transform = 'scale(1.1)';
            keyEl.style.boxShadow = '0 0 15px var(--accent-success)';
            setTimeout(() => {
                keyEl.style.transform = '';
                keyEl.style.boxShadow = '';
            }, 200);
        }

        gameState.currentCharIndex++;
        
        if (gameState.gameMode === 'learn' || gameState.currentCharIndex >= item.target.length) {
            // Item completed
            const textDisplay = document.getElementById('target-text');
            if(textDisplay && gameState.trainingType === 'send') {
                const typed = item.target.substring(0, gameState.currentCharIndex);
                const remaining = item.target.substring(gameState.currentCharIndex);
                textDisplay.innerHTML = `<span style="color:var(--primary);">${typed}</span><span>${remaining}</span>`;
            }
            
            gameState.currentItemIndex++;
            gameState.currentCharIndex = 0;
            
            if (gameState.currentItemIndex >= gameState.items.length) {
                finishGame();
            } else {
                loadNewWord();
            }
        } else {
            // Partial completion (word mode)
            const textDisplay = document.getElementById('target-text');
            if(textDisplay && gameState.trainingType === 'send') {
                const typed = item.target.substring(0, gameState.currentCharIndex);
                const remaining = item.target.substring(gameState.currentCharIndex);
                textDisplay.innerHTML = `<span style="color:var(--primary);">${typed}</span><span>${remaining}</span>`;
            }
            if (gameState.gameMode !== 'learn') {
                renderGameWord(false);
            }
        }
    } else {
        // ERROR LOGIC
        userStats[modeKey].totalErrors++;
        gameState.mistakes++;
        
        // Update heat map (increase heat for error)
        if(!userStats[modeKey].heat[targetChar]) userStats[modeKey].heat[targetChar] = 0;
        userStats[modeKey].heat[targetChar] += 2;
        
        const keyEl = document.getElementById(`learn-key-${targetChar}`);
        if(keyEl) {
            keyEl.classList.add('error');
            setTimeout(() => keyEl.classList.remove('error'), 300);
        }
        
        // Visual feedback
        const activeNode = document.querySelector('.char-node.active');
        if (activeNode) {
            activeNode.classList.add('wrong');
            setTimeout(() => activeNode.classList.remove('wrong'), 400);
        } else {
            const trainingCard = document.getElementById('training-card') || document.getElementById('game-active');
            if (trainingCard) {
                trainingCard.classList.add('shake');
                setTimeout(() => trainingCard.classList.remove('shake'), 400);
            }
        }

        // Flash target text
        const textDisplay = document.getElementById('target-text');
        if(textDisplay) {
            textDisplay.style.color = "var(--danger)";
            setTimeout(() => textDisplay.style.color = "", 300);
        }
        
        saveStats();
    }
}
