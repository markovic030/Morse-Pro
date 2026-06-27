function showToast(msg, iconName, color) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.border = `1px solid ${color}`;
    toast.style.boxShadow = `0 4px 20px -2px ${color}40`;
    toast.innerHTML = `<i data-lucide="${iconName}" style="color:${color}; width:20px; height:20px;"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
        toast.style.animation = 'toastRise 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
