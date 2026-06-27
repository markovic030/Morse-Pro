function generateAdaptiveKochString() {
    const heat = getCurrentHeatmap();
    const lvl = Math.min(Math.max(1, userStats.kochLevel), KOCH_ORDER.length);
    const activeChars = KOCH_ORDER.slice(0, lvl);
    const newestChar = activeChars[lvl-1];
    
    // Base pool: heavily favor the newest character (standard Koch)
    let pool = [newestChar, newestChar, newestChar, newestChar]; // 4x newest
    
    // Add other active characters, but weighted by their error rate
    // We want the 'hard' characters from previous levels to appear more often
    activeChars.forEach(char => {
        if(char === newestChar) return; // Already added
        pool.push(char); // Base 1x
        
        const errors = heat[char] || 0;
        // Add extra copies for errors. Cap at reasonable amount (e.g. 5 copies)
        const extraCopies = Math.min(Math.ceil(errors / 2), 4);
        for(let k=0; k<extraCopies; k++) pool.push(char);
    });
    
    let result = '';
    // Koch strings are usually length 5
    for (let i = 0; i < 5; i++) {
        result += pool[Math.floor(Math.random() * pool.length)];
    }
    return result;
}
