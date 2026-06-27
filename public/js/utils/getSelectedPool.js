function getSelectedPool() {
    if (settings.customChars && settings.customChars.trim().length > 0) {
        return settings.customChars.replace(/\s+/g, '').split('');
    }
    let poolStr = "";
    if(settings.charTypes.letters) poolStr += CHAR_SETS.letters;
    if(settings.charTypes.numbers) poolStr += CHAR_SETS.numbers;
    if(settings.charTypes.specials) poolStr += CHAR_SETS.specials;
    if(poolStr === "") poolStr = CHAR_SETS.letters;
    return poolStr.split('');
}
