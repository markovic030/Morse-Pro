function initKeyboardAndTable() {
    const tableContainer = document.getElementById('table-container');
    const grid = document.getElementById('morse-grid');
    Object.keys(MORSE_TABLE).forEach(k => {
        const div = document.createElement('div');
        div.className = 'sheet-item';
        div.innerHTML = `<div style="font-weight:800;font-size:1.2rem;color:var(--text-main);">${k}</div><div style="color:var(--primary);font-family:'JetBrains Mono';">${MORSE_TABLE[k]}</div>`;
        div.onclick = async () => {
            if (!audioContext) initAudio();
            if (audioContext.state === 'suspended') audioContext.resume();
            
            const t = getTimings();
            const dot = t.dit / 1000;
            const dash = t.dah / 1000;
            const elementGap = t.elementGap / 1000;
            
            const o = audioContext.createOscillator();
            const g = audioContext.createGain();
            o.connect(g); 
            g.connect(masterGain);
            o.type = settings.toneType;
            o.frequency.value = settings.tone;
            
            let now = audioContext.currentTime;
            const divider = settings.toneType === 'sawtooth' ? 1000 : 200;
            const volLevel = settings.vol / divider;
            
            MORSE_TABLE[k].split('').forEach((s, idx) => {
                const dur = s === '.' ? dot : dash;
                g.gain.setValueAtTime(volLevel, now);
                g.gain.setValueAtTime(0, now + dur);
                now += dur + elementGap;
            });
            o.start(); 
            o.stop(now);
        };
        grid.appendChild(div);
    });
}
