function updateInputMethod() {
    const paddles = document.getElementById('buttons');
    const keyboard = document.getElementById('virtual-keyboard');
    const replayBtn = document.getElementById('replay-btn');
    const quickWpmLabel = document.getElementById('quick-wpm-label');
    const quickWpmValue = document.getElementById('quick-wpm-value');
    const quickWpmSlider = document.getElementById('quick-wpm-slider');
    

    if (gameState.active && gameState.trainingType === 'recv') {
        if (paddles) paddles.style.display = 'none';
        if (keyboard) keyboard.style.display = 'flex';
        if (replayBtn) replayBtn.style.display = 'inline-flex';
        if (quickWpmLabel) quickWpmLabel.textContent = 'RX WPM';
        if (quickWpmValue) quickWpmValue.textContent = settings.rxWpm || settings.wpm;
        if (quickWpmSlider) quickWpmSlider.value = settings.rxWpm || settings.wpm;
    } else {
        if (paddles) paddles.style.display = 'flex';
        if (keyboard) keyboard.style.display = 'none';
        if (replayBtn) replayBtn.style.display = 'none';
        if (quickWpmLabel) quickWpmLabel.textContent = 'TX WPM';
        if (quickWpmValue) quickWpmValue.textContent = settings.wpm;
        if (quickWpmSlider) quickWpmSlider.value = settings.wpm;
    }
}

const switchTab = (newTab) => {
    
    if (uiState.activeTab) {
        const oldBtn = document.getElementById(getBtnId(uiState.activeTab));
        if (oldBtn) oldBtn.classList.remove('active');
        
        const oldEl = document.getElementById(getDrawerId(uiState.activeTab));
        if (oldEl) {
            oldEl.classList.remove('open', 'visible');
            if (uiState.activeTab === 'ref') oldEl.classList.remove('visible');
        }
    }

    if (uiState.activeTab === newTab) {
        uiState.activeTab = null;
        return;
    }

    if (newTab) {
        const newBtn = document.getElementById(getBtnId(newTab));
        if (newBtn) newBtn.classList.add('active');
        
        const newEl = document.getElementById(getDrawerId(newTab));
        if (newEl) {
            newEl.classList.add('open');
            if (newTab === 'ref') newEl.classList.add('visible');
            
            if (newTab === 'stats') renderAnalytics();

            newEl.scrollTop = 0;

            const innerCard = newEl.querySelector('.setup-card, .stats-dashboard, .glass-card');
            if (innerCard) {
                innerCard.scrollTop = 0;
            }
        }
        
        if (newTab === 'train') {
            document.getElementById('minigame-btn').classList.add('active-state');
            const setupStep1 = document.getElementById('setup-step-1');
            const setupStep2 = document.getElementById('setup-step-2');
            const setupStep3 = document.getElementById('setup-step-3');
            if (setupStep1) {
                setupStep1.style.display = 'block';
                setupStep1.style.animation = 'none';
                setupStep1.style.opacity = '1';
                setupStep1.style.transform = 'none';
            }
            if (setupStep2) {
                setupStep2.style.display = 'none';
                setupStep2.style.animation = 'none';
            }
            if (setupStep3) {
                setupStep3.style.display = 'none';
                setupStep3.style.animation = 'none';
            }
        } else {
            document.getElementById('minigame-btn').classList.remove('active-state');
        }
    } else {
            document.getElementById('minigame-btn').classList.remove('active-state');
    }

    uiState.activeTab = newTab;
};

const getBtnId = (tab) => {
    if (tab === 'train') return 'mob-train';
    if (tab === 'stats') return 'mob-stats';
    if (tab === 'ref') return 'mob-ref';
    if (tab === 'controls') return 'mob-controls';
    return '';
};

const getDrawerId = (tab) => {
    if (tab === 'train') return 'setup-overlay';
    if (tab === 'stats') return 'analytics-overlay';
    if (tab === 'ref') return 'table-container';
    if (tab === 'controls') return 'control-drawer';
    return '';
};
