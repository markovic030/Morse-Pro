function cleanUserBuffer(text) {
    let words = text.split(/\s+/);
    let cleanedWords = [];
    let hints = [];
    
    const keywords = ['CQ', 'RST', 'QTH', 'NAME', 'RIG', 'WX', 'ANT', 'AGE', 'PWR', 'QRM', 'QSB', 'QSY', 'QRT', 'QRZ', 'QSL', 'QRS', 'QRQ', 'HW', 'AGN', 'PSE', 'RPT', 'REPEAT', 'INFO', 'TU', 'DE', 'UR', 'MY', 'IS', 'HERE', 'HR', 'IN', 'OP', 'HANDLE'];
    
    let joinedText = text;
    for (let keyword of keywords) {
        let patternStr = '';
        let hasOptions = false;
        for (let char of keyword) {
            let options = [char];
            for (let [err, correct] of Object.entries(COMMON_MORSE_ERRORS)) {
                if (correct === char) {
                    options.push(err);
                    hasOptions = true;
                }
            }
            patternStr += `(${options.join('|')})`;
        }
        
        if (hasOptions) {
            let regex = new RegExp(`\\b${patternStr}\\b`, 'g');
            let originalText = joinedText;
            joinedText = joinedText.replace(regex, keyword);
            if (originalText !== joinedText) {
                hints.push(`CHK UR SPACING ON ${keyword}`);
            }
        }
    }
    
    words = joinedText.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (!word) continue;
        let bestMatch = word;
        
        if (CW_TYPO_DICT[word]) {
            bestMatch = CW_TYPO_DICT[word];
            hints.push(`CHK UR SENDING ON ${bestMatch}`);
        }
        
        cleanedWords.push(bestMatch);
    }
    
    joinedText = cleanedWords.join(' ');
    for (let typo in CW_TYPO_DICT) {
        if (typo.includes(' ')) {
            if (joinedText.includes(typo)) {
                joinedText = joinedText.split(typo).join(CW_TYPO_DICT[typo]);
                hints.push(`CHK UR SPACING ON ${CW_TYPO_DICT[typo]}`);
            }
        }
    }
    
    hints = [...new Set(hints)];
    return { text: joinedText, hints: hints };
}

function simulateCopyFailure(text) {
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (word === '<BT>') {
            result += '<BT> ';
            continue;
        }
        if (Math.random() < 0.1) {
            result += '? ';
        } else if (Math.random() < 0.05) {
            let chars = word.split('');
            const dropIdx = Math.floor(Math.random() * chars.length);
            chars[dropIdx] = '?';
            result += chars.join('') + ' ';
        } else {
            result += word + ' ';
        }
    }
    return result.trim();
}

function generateRST() {
    const r = Math.floor(Math.random() * 2) + 4; // 4 or 5
    const s = Math.floor(Math.random() * 5) + 5; // 5 to 9
    const t = 9; // Always 9 for modern rigs
    return `${r}${s}${t}`;
}

function getRstComment(rst) {
    const s = parseInt(rst[1]);
    if (s >= 9) return "UR SIGS ARE VY STRONG";
    if (s >= 7) return "UR SIGS ARE GOOD";
    if (s >= 5) return "UR SIGS ARE WEAK BUT READABLE";
    return "UR SIGS ARE VY WEAK";
}
