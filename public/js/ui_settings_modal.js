function initSettingsModal() {
    const vSlider = document.getElementById('vol-slider');
    vSlider.value = settings.vol;
    document.getElementById('vol-value').textContent = settings.vol;
    vSlider.oninput = (e) => {
        settings.vol = parseInt(e.target.value);
        document.getElementById('vol-value').textContent = settings.vol;
        saveData();
    };

    const tSlider = document.getElementById('tone-slider');
    tSlider.value = settings.tone;
    document.getElementById('tone-value').textContent = settings.tone;
    tSlider.oninput = (e) => {
        settings.tone = parseInt(e.target.value);
        document.getElementById('tone-value').textContent = settings.tone;
        if(osc) osc.frequency.value = settings.tone;
        saveData();
    };

    const wSlider = document.getElementById('wpm-slider');
    const quickWpmSlider = document.getElementById('quick-wpm-slider');
    const quickWpmValue = document.getElementById('quick-wpm-value');
    const qsoWpmSlider = document.getElementById('qso-wpm-slider');
    const qsoWpmValue = document.getElementById('qso-wpm-value');

    wSlider.value = settings.wpm;
    document.getElementById('wpm-value').textContent = settings.wpm;
    wSlider.oninput = (e) => {
        settings.wpm = parseInt(e.target.value);
        document.getElementById('wpm-value').textContent = settings.wpm;
        if (setupType === 'send') {
            quickWpmSlider.value = settings.wpm;
            quickWpmValue.textContent = settings.wpm;
        } else if (setupType === 'qso') {
            qsoWpmSlider.value = settings.wpm;
            qsoWpmValue.textContent = settings.wpm;
        }
        saveData();
    };
    
    const rxWpmSlider = document.getElementById('rx-wpm-slider');
    rxWpmSlider.value = settings.rxWpm || settings.wpm;
    document.getElementById('rx-wpm-value').textContent = settings.rxWpm || settings.wpm;
    rxWpmSlider.oninput = (e) => {
        settings.rxWpm = parseInt(e.target.value);
        document.getElementById('rx-wpm-value').textContent = settings.rxWpm;
        if (setupType === 'recv') {
            quickWpmSlider.value = settings.rxWpm;
            quickWpmValue.textContent = settings.rxWpm;
        }
        saveData();
    };

    quickWpmSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        quickWpmValue.textContent = val;
        const currentType = gameState.active ? gameState.trainingType : setupType;
        if (currentType === 'recv') {
            settings.rxWpm = val;
            rxWpmSlider.value = val;
            document.getElementById('rx-wpm-value').textContent = val;
        } else {
            settings.wpm = val;
            wSlider.value = val;
            document.getElementById('wpm-value').textContent = val;
        }
        saveData();
    };

    qsoWpmSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        qsoWpmValue.textContent = val;
        settings.wpm = val;
        wSlider.value = val;
        document.getElementById('wpm-value').textContent = val;
        saveData();
    };
    
    const weightSlider = document.getElementById('weighting-slider');
    weightSlider.value = settings.weighting;
    document.getElementById('weighting-value').textContent = settings.weighting.toFixed(1);
    weightSlider.oninput = (e) => {
        settings.weighting = parseFloat(e.target.value);
        document.getElementById('weighting-value').textContent = settings.weighting.toFixed(1);
        saveData();
    };

    const wsSlider = document.getElementById('wordspace-slider');
    wsSlider.value = settings.wordSpace;
    document.getElementById('wordspace-value').textContent = settings.wordSpace;
    wsSlider.oninput = (e) => {
        settings.wordSpace = parseInt(e.target.value);
        document.getElementById('wordspace-value').textContent = settings.wordSpace;
        saveData();
    };

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.mode = btn.dataset.mode;
            updatePaddleText();
            saveData();
        }
        if(btn.dataset.mode === settings.mode) btn.classList.add('active');
    });

    const bindToggle = (id, prop) => {
        const btn = document.getElementById(id);
        if(settings[prop]) btn.classList.add('active');
        btn.onclick = () => {
            settings[prop] = !settings[prop];
            btn.classList.toggle('active');
            saveData();
            btn.blur();
        };
    };
    
    bindToggle('strict-btn', 'strict');

    // Bind slider input for Koch
    const kochSlider = document.getElementById('koch-slider');
    if (kochSlider) {
        kochSlider.oninput = (e) => {
            userStats.kochLevel = parseInt(e.target.value);
            saveStats();
            window.renderKochConfig();
        };
    }
    
    window.renderKochConfig();

    const hintOff = document.getElementById('hints-off');
    const hintOn = document.getElementById('hints-on');
    setupHints = settings.setupHints || false;
    if (setupHints) {
        hintOn.classList.add('selected');
        hintOff.classList.remove('selected');
    } else {
        hintOff.classList.add('selected');
        hintOn.classList.remove('selected');
    }
    hintOff.onclick = () => { setupHints = false; settings.setupHints = false; saveData(); hintOff.classList.add('selected'); hintOn.classList.remove('selected'); };
    hintOn.onclick = () => { setupHints = true; settings.setupHints = true; saveData(); hintOn.classList.add('selected'); hintOff.classList.remove('selected'); };
    
    const farnsworthOff = document.getElementById('farnsworth-off');
    const farnsworthOn = document.getElementById('farnsworth-on');
    farnsworthOff.onclick = () => { settings.farnsworth = false; farnsworthOff.classList.add('selected'); farnsworthOn.classList.remove('selected'); saveData(); };
    farnsworthOn.onclick = () => { settings.farnsworth = true; farnsworthOn.classList.add('selected'); farnsworthOff.classList.remove('selected'); saveData(); };
    
    const qsoHideTextOff = document.getElementById('qso-hide-text-off');
    const qsoHideTextOn = document.getElementById('qso-hide-text-on');
    if (settings.hideQsoText) {
        qsoHideTextOn.classList.add('selected');
        qsoHideTextOff.classList.remove('selected');
    } else {
        qsoHideTextOff.classList.add('selected');
        qsoHideTextOn.classList.remove('selected');
    }
    qsoHideTextOff.onclick = () => { settings.hideQsoText = false; saveData(); qsoHideTextOff.classList.add('selected'); qsoHideTextOn.classList.remove('selected'); };
    qsoHideTextOn.onclick = () => { settings.hideQsoText = true; saveData(); qsoHideTextOn.classList.add('selected'); qsoHideTextOff.classList.remove('selected'); };
    
    document.querySelectorAll('.multi-select').forEach(btn => {
        const type = btn.dataset.type;
        if(settings.charTypes[type]) btn.classList.add('selected');
        btn.onclick = () => {
            const newState = !settings.charTypes[type];
            const activeCount = Object.values(settings.charTypes).filter(Boolean).length;
            if(!newState && activeCount <= 1) return; 
            settings.charTypes[type] = newState;
            if(newState) btn.classList.add('selected'); else btn.classList.remove('selected');
            saveData();
        };
    });

    const customCharsBtn = document.getElementById('custom-chars-btn');
    const customCharsCount = document.getElementById('custom-chars-count');
    const customCharsOverlay = document.getElementById('custom-chars-overlay');
    const customCharsGrid = document.getElementById('custom-chars-grid');
    const closeCustomCharsBtn = document.getElementById('close-custom-chars-btn');
    const clearCustomCharsBtn = document.getElementById('clear-custom-chars-btn');
    const saveCustomCharsBtn = document.getElementById('save-custom-chars-btn');

    let tempCustomChars = settings.customChars ? settings.customChars.split('') : [];

    const updateCustomCharsCount = () => {
        const count = settings.customChars ? settings.customChars.length : 0;
        customCharsCount.textContent = `${count} selected`;
        const charPoolToggles = document.getElementById('char-pool-toggles');
        if (count > 0) {
            charPoolToggles.style.opacity = '0.5';
            charPoolToggles.style.pointerEvents = 'none';
        } else {
            charPoolToggles.style.opacity = '1';
            charPoolToggles.style.pointerEvents = 'auto';
        }
    };
    updateCustomCharsCount();

    const renderCustomCharsGrid = () => {
        customCharsGrid.innerHTML = '';
        const allChars = (CHAR_SETS.letters + CHAR_SETS.numbers + CHAR_SETS.specials).split('');
        allChars.forEach(char => {
            const btn = document.createElement('button');
            btn.className = `btn ${tempCustomChars.includes(char) ? 'selected' : ''}`;
            btn.style.padding = '8px';
            btn.style.justifyContent = 'center';
            btn.style.fontWeight = '700';
            btn.style.fontFamily = 'var(--font-mono)';
            btn.textContent = char;
            btn.onclick = () => {
                if (tempCustomChars.includes(char)) {
                    tempCustomChars = tempCustomChars.filter(c => c !== char);
                    btn.classList.remove('selected');
                } else {
                    tempCustomChars.push(char);
                    btn.classList.add('selected');
                }
            };
            customCharsGrid.appendChild(btn);
        });
    };

    customCharsBtn.onclick = () => {
        tempCustomChars = settings.customChars ? settings.customChars.split('') : [];
        renderCustomCharsGrid();
        customCharsOverlay.classList.add('visible');
    };

    const closeCustomCharsModal = () => {
        customCharsOverlay.classList.remove('visible');
    };

    closeCustomCharsBtn.onclick = closeCustomCharsModal;

    clearCustomCharsBtn.onclick = () => {
        tempCustomChars = [];
        renderCustomCharsGrid();
    };

    saveCustomCharsBtn.onclick = () => {
        settings.customChars = tempCustomChars.join('');
        saveData();
        updateCustomCharsCount();
        closeCustomCharsModal();
    };
    
    if(settings.farnsworth) {
        farnsworthOn.classList.add('selected');
        farnsworthOff.classList.remove('selected');
    }

    gameState.targetCount = settings.sessionLength || 10;
    document.getElementById('words-count-display').textContent = gameState.targetCount;
    document.getElementById('words-plus').onclick = () => { 
        gameState.targetCount = Math.min(50, gameState.targetCount+5); 
        settings.sessionLength = gameState.targetCount;
        saveData();
        document.getElementById('words-count-display').textContent = gameState.targetCount; 
    };
    document.getElementById('words-minus').onclick = () => { 
        gameState.targetCount = Math.max(5, gameState.targetCount-5); 
        settings.sessionLength = gameState.targetCount;
        saveData();
        document.getElementById('words-count-display').textContent = gameState.targetCount; 
    };
}

function updatePaddleText() {
    const lText = document.querySelector('#left-paddle small');
    const rText = document.querySelector('#right-paddle small');
    const lIcon = document.querySelector('#left-paddle span');
    const rIcon = document.querySelector('#right-paddle span');
    const container = document.getElementById('buttons');

    if (settings.mode === 'straight') {
        container.classList.add('straight-mode'); 
        lText.textContent = 'KEY / SPACE';
        lIcon.textContent = '•';
    } else {
        container.classList.remove('straight-mode');
        lText.textContent = 'DIT';
        rText.textContent = 'DAH';
        lIcon.textContent = '•';
        rIcon.textContent = '-';
    }
}

window.renderKochConfig = function() {
    // Clamp and update
    userStats.kochLevel = Math.max(1, Math.min(KOCH_ORDER.length, userStats.kochLevel));
    document.getElementById('koch-level-val').textContent = userStats.kochLevel;
    
    const chars = KOCH_ORDER.slice(0, userStats.kochLevel).join(' ');
    document.getElementById('koch-chars-display').textContent = chars;
    
    // Sync slider
    const slider = document.getElementById('koch-slider');
    if(slider) slider.value = userStats.kochLevel;
}
