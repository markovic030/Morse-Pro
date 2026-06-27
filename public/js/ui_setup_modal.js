function initSetupModal() {
    const optCallsigns = document.getElementById('opt-callsigns');
    const optQcodes = document.getElementById('opt-qcodes');
    const optRandom = document.getElementById('opt-random');
    const optLearn = document.getElementById('opt-learn');
    const optKoch = document.getElementById('opt-koch');
    const modeSend = document.getElementById('mode-send');
    const modeRecv = document.getElementById('mode-recv');
    const modeQso = document.getElementById('mode-qso');
    
    modeSend.onclick = () => {
        setupType = 'send';
        modeSend.classList.add('selected');
        modeRecv.classList.remove('selected');
        modeQso.classList.remove('selected');
        
        optLearn.style.display = 'flex';
        optKoch.style.display = 'none';
        if(setupMode === 'koch') optCallsigns.click();
        
        settings.farnsworth = false; 
        document.getElementById('farnsworth-off').classList.add('selected'); 
        document.getElementById('farnsworth-on').classList.remove('selected'); 
        
        saveData(); 
        updateDesc();
    };
    
    modeRecv.onclick = () => {
        setupType = 'recv';
        modeRecv.classList.add('selected');
        modeSend.classList.remove('selected');
        modeQso.classList.remove('selected');
        
        optLearn.style.display = 'none';
        optKoch.style.display = 'flex';
        if(setupMode === 'learn') optCallsigns.click();
        
        updateDesc();
    };

    modeQso.onclick = () => {
        setupType = 'qso';
        modeQso.classList.add('selected');
        modeSend.classList.remove('selected');
        modeRecv.classList.remove('selected');
        
        updateDesc();
    };
    
    const setMode = (mode, el) => {
        setupMode = mode;
        [optCallsigns, optQcodes, optRandom, optLearn, optKoch].forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        updateDesc();
    };

    optCallsigns.onclick = () => setMode('callsigns', optCallsigns);
    optQcodes.onclick = () => setMode('qcodes', optQcodes);
    optRandom.onclick = () => setMode('random', optRandom);
    optLearn.onclick = () => {
        setMode('learn', optLearn);
        modeSend.click(); 
    };
    optKoch.onclick = () => {
        setMode('koch', optKoch);
        modeRecv.click(); 
    }

    // Setup Steps Logic
    const setupStep1 = document.getElementById('setup-step-1');
    const setupStep2 = document.getElementById('setup-step-2');
    const setupStep3 = document.getElementById('setup-step-3');

    document.getElementById('setup-next-1').onclick = () => {
        if (setupType === 'qso') {
            transitionStep(setupStep1, setupStep3, 'next', 'flex');
        } else {
            transitionStep(setupStep1, setupStep2, 'next', 'block');
        }
    };
    document.getElementById('setup-back-2').onclick = () => {
        transitionStep(setupStep2, setupStep1, 'prev', 'block');
    };
    document.getElementById('setup-next-2').onclick = () => {
        transitionStep(setupStep2, setupStep3, 'next', 'flex');
    };
    document.getElementById('setup-back-3').onclick = () => {
        if (setupType === 'qso') {
            transitionStep(setupStep3, setupStep1, 'prev', 'block');
        } else {
            transitionStep(setupStep3, setupStep2, 'prev', 'block');
        }
    };

    // Close overlay handlers (both desktop and mobile close buttons)
    const closeTrainingOverlay = () => {
        switchTab(null);
        setTimeout(() => {
            if (setupStep1) {
                setupStep1.style.display = 'block';
                setupStep1.style.animation = 'none';
            }
            if (setupStep2) {
                setupStep2.style.display = 'none';
                setupStep2.style.animation = 'none';
            }
            if (setupStep3) {
                setupStep3.style.display = 'none';
                setupStep3.style.animation = 'none';
            }
        }, 300);
    };
    document.getElementById('cancel-game-btn').onclick = closeTrainingOverlay;
    const mobCancelBtn = document.getElementById('cancel-game-btn-mobile');
    if(mobCancelBtn) mobCancelBtn.onclick = closeTrainingOverlay;

    const handleStartClick = () => {
        if (setupMode === 'koch' && setupType !== 'qso' && userStats.kochLevel > (userStats.maxKochLevel || 1)) {
            const maxAllowed = userStats.maxKochLevel || 1;
            const requested = userStats.kochLevel;
            
            // Show modal
            const modal = document.getElementById('koch-warning-modal');
            if (modal) {
                document.getElementById('koch-warning-text').innerHTML = `Jumping ahead? The Koch method works best when you master your current letters first.<br><br>You are currently on <b>Level ${maxAllowed}</b>, but you're trying to start <b>Level ${requested}</b>.`;
                
                document.getElementById('koch-warning-continue').onclick = () => {
                    modal.classList.remove('open');
                    startMinigame();
                };
                
                const playMaxBtn = document.getElementById('koch-warning-playmax');
                if (playMaxBtn) playMaxBtn.textContent = `Play Level ${maxAllowed}`;
                playMaxBtn.onclick = () => {
                    modal.classList.remove('open');
                    userStats.kochLevel = maxAllowed;
                    saveStats();
                    window.renderKochConfig();
                    startMinigame();
                };
                
                modal.classList.add('open');
            } else {
                startMinigame();
            }
        } else {
            startMinigame();
        }
    };

    document.getElementById('start-game-btn').onclick = handleStartClick;

    updateDesc();
}

function updateDesc() {
    const activityGrid = document.getElementById('activity-grid');
    const charTypeGroup = document.getElementById('char-type-selector');
    const kochConfig = document.getElementById('koch-config'); 
    const qsoConfig = document.getElementById('qso-config');
    
    const hintsSetting = document.getElementById('hints-setting');
    const farnsworthSetting = document.getElementById('farnsworth-setting');
    const lengthSetting = document.getElementById('length-setting');
    
    const descEl = document.getElementById('game-desc');
    const quickWpmSlider = document.getElementById('quick-wpm-slider');
    const quickWpmValue = document.getElementById('quick-wpm-value');
    const quickWpmLabel = document.getElementById('quick-wpm-label');
    const qsoWpmSlider = document.getElementById('qso-wpm-slider');
    const qsoWpmValue = document.getElementById('qso-wpm-value');

    if (setupType === 'qso') {
        activityGrid.style.display = 'none';
        charTypeGroup.style.display = 'none';
        kochConfig.style.display = 'none';
        lengthSetting.style.display = 'none';
        hintsSetting.style.display = 'none';
        farnsworthSetting.style.display = 'none';
        qsoConfig.style.display = 'flex';
        descEl.textContent = "Realistic QSO Simulator. Send CQ to begin.";
        qsoWpmSlider.value = settings.wpm;
        qsoWpmValue.textContent = settings.wpm;
        return;
    } else {
        activityGrid.style.display = 'grid';
        qsoConfig.style.display = 'none';
    }

    // Toggle character pool visibility
    if(setupMode === 'random' || setupMode === 'learn') {
        charTypeGroup.style.display = 'flex';
    } else {
        charTypeGroup.style.display = 'none';
    }

    // Toggle Koch settings
    if(setupMode === 'koch') {
        kochConfig.style.display = 'flex';
        if (!settings.farnsworth && setupType === 'recv') {
            settings.farnsworth = true; 
            document.getElementById('farnsworth-on').classList.add('selected');
            document.getElementById('farnsworth-off').classList.remove('selected');
        }
    } else {
        kochConfig.style.display = 'none';
    }

    // Toggle Session Length Display
    if(setupMode === 'learn') {
        descEl.textContent = setupType === 'send' ? DESCRIPTIONS[setupMode] : RX_DESCRIPTIONS[setupMode];
        lengthSetting.style.display = 'none';
    } else {
        lengthSetting.style.display = 'flex';
        descEl.textContent = setupType === 'send' ? DESCRIPTIONS[setupMode] : RX_DESCRIPTIONS[setupMode];
    }
    
    // Toggle Settings options based on Send/Receive
    if (setupType === 'send') {
        hintsSetting.style.display = 'flex';
        farnsworthSetting.style.display = 'none';
        quickWpmLabel.textContent = 'TX WPM';
        quickWpmSlider.value = settings.wpm;
        quickWpmValue.textContent = settings.wpm;
    } else if (setupType === 'recv') {
        hintsSetting.style.display = 'none';
        farnsworthSetting.style.display = 'flex';
        quickWpmLabel.textContent = 'RX WPM';
        quickWpmSlider.value = settings.rxWpm || settings.wpm;
        quickWpmValue.textContent = settings.rxWpm || settings.wpm;
    } else if (setupType === 'qso') {
        qsoWpmSlider.value = settings.wpm;
        qsoWpmValue.textContent = settings.wpm;
    }
}

function transitionStep(hideStep, showStep, direction = 'next', showDisplay = 'block') {
    const setupCard = document.querySelector('.setup-card');
    const startHeight = setupCard.getBoundingClientRect().height;
    
    // Prepare for height animation
    setupCard.style.height = startHeight + 'px';
    setupCard.style.overflow = 'hidden';
    
    hideStep.style.animation = direction === 'next' ? 'slideNextOut 0.2s ease forwards' : 'slidePrevOut 0.2s ease forwards';
    
    setTimeout(() => {
        hideStep.style.display = 'none';
        hideStep.style.animation = ''; // reset for next time
        showStep.style.display = showDisplay;
        
        // Calculate new height
        setupCard.style.transition = 'none';
        setupCard.style.height = 'auto';
        const endHeight = setupCard.getBoundingClientRect().height;
        
        // Animate height
        setupCard.style.height = startHeight + 'px';
        // Force reflow
        setupCard.offsetHeight; 
        setupCard.style.transition = 'height 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        setupCard.style.height = endHeight + 'px';
        
        showStep.style.animation = direction === 'next' ? 'slideNextIn 0.3s ease forwards' : 'slidePrevIn 0.3s ease forwards';
        
        setTimeout(() => {
            setupCard.style.height = 'auto';
            setupCard.style.overflow = '';
            setupCard.style.transition = ''; // Reset transition to CSS default
        }, 300);
        
    }, 200);
}
