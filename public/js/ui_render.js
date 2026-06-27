function renderLearnScreen() {
    const item = gameState.items[gameState.currentItemIndex];
    const char = item.target;
    const display = document.getElementById('current-word-display');
    
    document.getElementById('game-progress').textContent = `${gameState.currentItemIndex + 1}/${gameState.items.length}`;
    display.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'mnemonic-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'center';
    card.style.flex = '1';
    card.style.minHeight = '0';
    
    const letterBox = document.createElement('div');
    letterBox.className = 'big-letter';
    letterBox.textContent = char;
    
    const overlay = document.createElement('div');
    overlay.className = 'visual-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.width = 'max-content'; 
    overlay.style.pointerEvents = 'none';
    
    const code = MORSE_TABLE[char];
    code.split('').forEach(s => {
        const symbol = document.createElement('div');
        symbol.className = `v-symbol ${s === '.' ? 'dot' : 'dash'}`;
        overlay.appendChild(symbol);
    });
    letterBox.appendChild(overlay);
    
    if(item.hint.phrase) {
        const phrase = document.createElement('div');
        phrase.className = 'mnemonic-text';
        phrase.textContent = item.hint.phrase;
        card.appendChild(phrase);
    }

    if(item.hint.hint) {
        const sub = document.createElement('div');
        sub.style.color = "var(--text-muted)";
        sub.style.textAlign = "center";
        sub.style.fontSize = "clamp(0.85rem, 3vmin, 1rem)";
        sub.textContent = item.hint.hint;
        card.appendChild(sub);
    }

    card.appendChild(letterBox);
    display.appendChild(card);
    
    if (gameState.hasStartedTyping) {
        gameState.wordStartTime = Date.now();
    }

    setTimeout(() => {
        playMorseWord(char);
    }, 500);
}

function renderGameWord(playAudio = false) {
    const item = gameState.items[gameState.currentItemIndex];
    const display = document.getElementById('current-word-display');
    const instruction = document.getElementById('rx-instruction');
    display.innerHTML = '';
    display.style.animation = 'none';
    
    document.getElementById('game-progress').textContent = `${gameState.currentItemIndex + 1}/${gameState.items.length}`;

    if (gameState.trainingType === 'recv') {
        instruction.style.opacity = '1';
    } else {
        instruction.style.opacity = '0';
    }

    if (item.hint) {
        const hintDiv = document.createElement('div');
        hintDiv.style.fontSize = "clamp(1rem, 4vmin, 1.2rem)";
        hintDiv.style.color = "var(--primary)";
        hintDiv.style.marginBottom = "20px";
        hintDiv.style.textAlign = "center";
        hintDiv.textContent = item.hint;
        display.appendChild(hintDiv);
    }

    const nodesContainer = document.createElement('div');
    nodesContainer.style.fontSize = "clamp(2rem, 10vmin, 4rem)";
    nodesContainer.style.display = "flex";
    nodesContainer.style.gap = "4px";
    nodesContainer.style.flexWrap = "wrap";
    nodesContainer.style.justifyContent = "center";
    nodesContainer.style.fontFamily = "'JetBrains Mono', monospace";
    
    item.target.split('').forEach((char, idx) => {
        const s = document.createElement('span');
        s.textContent = char;
        s.className = 'char-node';
        s.style.position = 'relative';
        
        if (gameState.trainingType === 'recv') {
            s.style.color = "transparent";
            s.style.background = "var(--bg-element)";
            s.style.borderRadius = "4px";
            
            s.classList.add('replayable');
            s.onclick = (e) => {
                e.preventDefault();
                if (!isPlayingSequence) {
                    stopAudioPlayback();
                    playMorseChar(MORSE_TABLE[char]);
                }
            };
        }
        
        if (gameState.trainingType === 'send' && gameState.hintsEnabled && gameState.gameMode !== 'learn') {
            const popup = document.createElement('span');
            popup.className = 'visual-hint-popup';
            popup.textContent = MORSE_TABLE[char];
            s.appendChild(popup);
        }
        
        if(idx < gameState.currentCharIndex) {
            s.classList.add('correct');
            if (idx === gameState.currentCharIndex - 1 && !playAudio) {
                s.classList.add('just-correct');
            }
            s.style.color = "var(--accent-success)";
            s.style.background = "transparent";
        }
        
        if(idx === gameState.currentCharIndex) {
            s.classList.add('active');
            if (gameState.trainingType === 'recv') {
                    s.style.background = "rgba(var(--primary-rgb), 0.2)";
            }
        }
        nodesContainer.appendChild(s);
    });
    display.appendChild(nodesContainer);
    
    if (playAudio && gameState.trainingType === 'recv') {
        stopAudioPlayback();
        playMorseWord(item.target);
    }
}

window.openHelp = function(sectionId = null) {
    const overlay = document.getElementById('help-overlay');
    overlay.classList.add('open');
    
    if (sectionId) {
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Highlight briefly
                section.style.transition = 'background-color 0.3s';
                section.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                setTimeout(() => {
                    section.style.backgroundColor = 'transparent';
                }, 1500);
            }
        }, 100);
    }
};

window.closeHelp = function() {
    document.getElementById('help-overlay').classList.remove('open');
};

window.closeResults = function() {
    document.getElementById('game-results-overlay').classList.remove('open');
    document.getElementById('game-active').style.display = 'none'; 
    document.getElementById('output').style.display = 'flex';
    document.getElementById('minigame-btn').classList.remove('active-state');
    document.getElementById('buttons').style.display = 'flex';
    document.getElementById('virtual-keyboard').style.display = 'none';
};
