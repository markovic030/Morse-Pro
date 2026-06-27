function showBadgeInfo(id) {
    const info = BADGES_INFO[id];
    const unlocked = (userStats.badges || []).includes(id);
    
    const iconContainer = document.getElementById('badge-info-icon');
    iconContainer.innerHTML = `<i data-lucide="${info.icon}" style="width:32px; height:32px;"></i>`;
    iconContainer.style.color = unlocked ? info.color : 'var(--text-muted)';
    iconContainer.style.boxShadow = 'none';
    iconContainer.style.border = 'none';
    iconContainer.style.background = unlocked ? `${info.color}20` : 'var(--bg-element)';
    
    document.getElementById('badge-info-title').textContent = info.name;
    document.getElementById('badge-info-desc').textContent = info.desc;
    
    const statusEl = document.getElementById('badge-info-status');
    
    let currentVal = info.getVal(userStats);
    if (unlocked) currentVal = info.max;
    else currentVal = Math.min(currentVal, info.max);
    
    let progressHtml = '';
    if (info.max > 1) {
        const pct = Math.round((currentVal / info.max) * 100);
        progressHtml = `
            <div style="width: 100%; height: 6px; background: var(--bg-active); border-radius: 3px; overflow: hidden; margin-top: 16px; margin-bottom: 8px;">
                <div style="width: ${pct}%; height: 100%; background: ${unlocked ? info.color : 'var(--text-muted)'}; transition: width 0.3s;"></div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 24px;">Progress: ${currentVal.toLocaleString()} / ${info.max.toLocaleString()}</div>
        `;
    } else {
        progressHtml = `<div style="margin-bottom: 24px;"></div>`;
    }
    
    if (unlocked) {
        statusEl.innerHTML = `<span style="color: var(--accent-success);"><i data-lucide="check-circle" style="width:16px; height:16px; vertical-align:text-bottom; margin-right:4px;"></i> Unlocked</span>` + progressHtml;
    } else {
        statusEl.innerHTML = `<span style="color: var(--text-muted);"><i data-lucide="lock" style="width:16px; height:16px; vertical-align:text-bottom; margin-right:4px;"></i> Locked</span>` + progressHtml;
    }
    
    document.getElementById('badge-info-overlay').classList.add('open');
    lucide.createIcons();
}
