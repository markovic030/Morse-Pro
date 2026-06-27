function generateAdaptiveRandomString(length, pool) {
    if(!pool || pool.length === 0) pool = CHAR_SETS.letters.split('');
    
    let weightedPool = [...pool];
    const heatSource = getCurrentHeatmap();

    Object.entries(heatSource).forEach(([char, count]) => {
        if(pool.includes(char)) {
            const copies = Math.min(count * 2, 15); 
            for(let i=0; i<copies; i++) weightedPool.push(char);
        }
    });
    
    let result = '';
    for (let i = 0; i < length; i++) {
        result += weightedPool[Math.floor(Math.random() * weightedPool.length)];
    }
    return result;
}
