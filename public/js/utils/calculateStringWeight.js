function calculateStringWeight(str, heat) {
    let weight = 0;
    const s = (typeof str === 'string') ? str : "";
    for(let char of s) {
        weight += (heat[char] || 0);
    }
    return weight;
}
