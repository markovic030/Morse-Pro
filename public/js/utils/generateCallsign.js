function generateCallsign() {
    const prefixes = ['W','K','N','A','VE','VK','ZL','JA','UA','F','D','EA','I','SM','PA','OH','OZ','LA','SP','YU','YT','G','M','DL','DK','DJ','HA','OK','OM','ON','OE','HB9','SV','TA','UR','UT','UX','LZ','YO','ER','EX','EY','EZ','UK','UN','UP','UQ','4X','5B','9H','C3','CT','CU','EI','ER','ES','EU','EW','EX','EY','EZ','GU','GW','HA','HB0','HV','HZ','J2','J3','J4','J5','J6','J7','J8','J9','JA','JD1','JT','JW','JX','JY','K','KG4','KH0','KH1','KH2','KH3','KH4','KH5','KH6','KH7','KH8','KH9','KL7','KP1','KP2','KP3','KP4','KP5','LA','LU','LX','LY','LZ','OA','OD','OE','OH','OH0','OJ0','OK','OM','ON','OX','OY','OZ','P2','P4','PA','PJ2','PJ4','PJ5','PJ7','PY','PZ','S5','SM','SP','ST','SU','SV','SV5','SV9','SY','T2','T30','T31','T32','T33','T7','T8','TA','TF','TG','TI','TI9','TJ','TK','TL','TN','TR','TT','TU','TY','TZ','UA','UA2','UK','UN','UR','V2','V3','V4','V5','V6','V7','V8','VE','VK','VK0','VK9','VP2E','VP2M','VP2V','VP5','VP6','VP8','VP9','VQ9','VR2','VU','VU4','VU7','XE','XF4','XT','XU','XW','XX9','XY','YA','YB','YI','YJ','YL','YN','YO','YS','YU','YV','YV0','Z2','Z3','ZA','ZB2','ZC4','ZD7','ZD8','ZD9','ZF','ZK3','ZL','ZL7','ZL8','ZL9','ZP','ZS','ZS8'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const district = Math.floor(Math.random() * 10); // 0-9
    
    // Adaptive suffix generation (2-3 chars, rarely 1)
    const suffixLenRnd = Math.random();
    const suffixLen = suffixLenRnd < 0.1 ? 1 : (suffixLenRnd < 0.6 ? 2 : 3);
    
    let activePool = CHAR_SETS.letters.split('');
    const heatSource = getCurrentHeatmap();
    
    // Inject missed letters into the random selection pool for callsign suffix
    Object.entries(heatSource).forEach(([char, count]) => {
        if(activePool.includes(char)) {
            const copies = Math.min(count * 2, 15); 
            for(let i=0; i<copies; i++) activePool.push(char);
        }
    });
    
    let suffix = '';
    for(let i=0; i<suffixLen; i++) {
        suffix += activePool[Math.floor(Math.random() * activePool.length)];
    }
    
    return `${prefix}${district}${suffix}`;
}
