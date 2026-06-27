function setupInputs() {
    // Add touch/mouse listeners to paddles
    ['left', 'right'].forEach(side => {
        const el = document.getElementById(side + '-paddle');
        if (el) {
            // Mouse
            el.addEventListener('mousedown', (e) => { e.preventDefault(); handlePaddle(side, true); });
            el.addEventListener('mouseup', (e) => { e.preventDefault(); handlePaddle(side, false); });
            el.addEventListener('mouseleave', (e) => { e.preventDefault(); handlePaddle(side, false); });
            
            // Touch
            el.addEventListener('touchstart', (e) => { e.preventDefault(); handlePaddle(side, true); }, {passive: false});
            el.addEventListener('touchend', (e) => { e.preventDefault(); handlePaddle(side, false); }, {passive: false});
            el.addEventListener('touchcancel', (e) => { e.preventDefault(); handlePaddle(side, false); }, {passive: false});
        }
    });

    document.oncontextmenu = (e) => e.preventDefault();
    
    document.querySelectorAll('.kb-key[data-key]').forEach(keyBtn => {
        keyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(gameState.active && gameState.trainingType === 'recv') {
                if (typeof handleMinigameInput === 'function') {
                    handleMinigameInput(keyBtn.getAttribute('data-key'));
                }
            }
        });
    });

    const layerAlpha = document.getElementById('kb-layer-alpha');
    const layerSym = document.getElementById('kb-layer-sym');
    const switchNumBtn = document.getElementById('kb-switch-num');
    const switchAlphaBtn = document.getElementById('kb-switch-alpha');
    const backspaceAlphaBtn = document.getElementById('kb-backspace-alpha');
    const backspaceSymBtn = document.getElementById('kb-backspace-sym');
    
    if (switchNumBtn) {
        switchNumBtn.onclick = (e) => {
            if (layerAlpha) layerAlpha.style.display = 'none';
            if (layerSym) layerSym.style.display = 'flex';
        };
    }
    
    if (switchAlphaBtn) {
        switchAlphaBtn.onclick = () => {
            if (layerSym) layerSym.style.display = 'none';
            if (layerAlpha) layerAlpha.style.display = 'flex';
        };
    }

    const fireBackspace = (e) => {
        e.preventDefault();
        if(gameState.active && gameState.trainingType === 'recv') {
            if (typeof handleMinigameInput === 'function') {
                handleMinigameInput('BACKSPACE');
            }
        }
    };

    if (backspaceAlphaBtn) backspaceAlphaBtn.onclick = fireBackspace;
    if (backspaceSymBtn) backspaceSymBtn.onclick = fireBackspace;

}
