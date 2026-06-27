const MORSE_TABLE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '?': '..--..', '!': '-.-.--', '.': '.-.-.-', ':': '---...', ';': '-.-.-.',
    '=': '-...-', '/': '-..-.', '@': '.--.-.', "'": '.----.', '-': '-....-',
    ',': '--..--', '"': '.-..-.', '(': '-.--.', ')': '-.--.-'
};

const CHAR_SETS = {
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    specials: "?!.;/',:=+@\"()-"
};

// Standard Koch Method Order
const KOCH_ORDER = [
    'K', 'M', 'R', 'S', 'U', 'A', 'P', 'T', 'L', 'O', 
    'W', 'I', '.', 'N', 'J', 'E', 'F', '0', 'Y', 'V', 
    'G', '5', '/', 'Q', '9', 'Z', 'H', '3', '8', 'B', 
    '?', '4', '2', '7', 'C', '1', 'D', '6', 'X', '='
];

const LEARN_LEVELS = [
    { id: 1, chars: "ET" },          
    { id: 2, chars: "AIMN" },        
    { id: 3, chars: "SURDKGWO" },    
    { id: 4, chars: "HVBFLQJYPXZC" } 
];

const MNEMONICS_DATA = {
    'A': { phrase: "A-PART", hint: "Imagine an arrow point (.-)" },
    'B': { phrase: "BAN-jo-play-ing", hint: "A banjo base and neck (-...)" },
    'C': { phrase: "CO-ca-CO-la", hint: "Two loops (-.-.)" },
    'D': { phrase: "DOG-did-it", hint: "Dog running holding a bone (-..)" },
    'E': { phrase: "EH", hint: "Just a single eye (.)" },
    'F': { phrase: "did-you-FAIL-it", hint: "..-." },
    'G': { phrase: "GOOD-GAME-now", hint: "--." },
    'H': { phrase: "hip-pi-ty-hop", hint: "Four legs hopping (....)" },
    'I': { phrase: "I-I", hint: "Two eyes (..)" },
    'J': { phrase: "jet-JAY-O-WAY", hint: ".---" },
    'K': { phrase: "KAN-ga-ROO", hint: "Kicking leg (-.-)" },
    'L': { phrase: "li-LAC-li-ly", hint: ".-.." },
    'M': { phrase: "MAM-MA", hint: "Two humps of M (--)" },
    'N': { phrase: "NAN-ny", hint: "Down slope (-.)" },
    'O': { phrase: "OH-MY-GOD", hint: "Three round donuts (---)" },
    'P': { phrase: "a-POO-PY-smell", hint: ".--." },
    'Q': { phrase: "GOD-SAVE-the-QUEEN", hint: "--.-" },
    'R': { phrase: "a-RACE-car", hint: ".-." },
    'S': { phrase: "si-si-si", hint: "Three snakes (...)" },
    'T': { phrase: "TALL", hint: "One tall T-bar (-)" },
    'U': { phrase: "u-ni-CORN", hint: "..-" },
    'V': { phrase: "vic-tor-y-VEE", hint: "...-" },
    'W': { phrase: "the-WORLD-WAR", hint: ".--" },
    'X': { phrase: "X-marks-the-SPOT", hint: "-..-" },
    'Y': { phrase: "YELL-ow-YO-YO", hint: "-.--" },
    'Z': { phrase: "ZINC-ZOO-keep-er", hint: "--.." },
    '1': { phrase: "a-ONE-YEAR-LONG-TERM", hint: ".----" },      
    '2': { phrase: "two-bits-ARE-TOO-HARD", hint: "..---" },      
    '3': { phrase: "three-bits-are-SO-LONG", hint: "...--" },     
    '4': { phrase: "the-four-bits-are-DONE", hint: "....-" },     
    '5': { phrase: "five-bits-in-a-row", hint: "....." },         
    '6': { phrase: "SIX-lit-tle-ti-ny", hint: "-...." },          
    '7': { phrase: "SE-VEN-is-no-fun", hint: "--..." },           
    '8': { phrase: "GREAT-BIG-GOATS-are-ill", hint: "---.." },    
    '9': { phrase: "NINE-BIG-MEN-KICK-it", hint: "----." },       
    '0': { phrase: "ZE-RO-IS-TOO-LONG", hint: "-----" },           
    '?': { phrase: "it's-a-QUES-TION-is-it?", hint: "..--.." },
    '!': { phrase: "EX-cla-MA-tion-MARK-ING", hint: "-.-.--" },
    '.': { phrase: "a-STOP-a-STOP-a-STOP", hint: ".-.-.-" },
    ',': { phrase: "COM-MA-it's-a-COM-MA", hint: "--..--" },
    '/': { phrase: "SHAVE-and-a-HAIR-cut", hint: "-..-." },
    "'": { phrase: "and-THIS-STUFF-GOES-TO-me!", hint: ".----." },
    ";": { phrase: "A-list-B-list-C-list", hint: "-.-.-." },
    ':': { phrase: "HERE'S-A-LONG-list-for-you", hint: "---..." }, 
    '=': { phrase: "SUMS-are-done-here-TOO", hint: "-...-" },      
    '-': { phrase: "DASH-a-lit-tle-bit-MORE", hint: "-....-" },    
    '(': { phrase: "LOUD-ly-I-SPEAK-now", hint: "-.--." },        
    ')': { phrase: "CLOSE-it-UP-TIGHT-to-DAY", hint: "-.--.-" },   
    '+': { phrase: "and-ADD-some-MORE-bits", hint: ".-.-." },      
    '@': { phrase: "at-WORK-SPACE-dot-COM-net", hint: ".--.-." }, 
    '"': { phrase: "a-QUOTE-is-in-HERE-now", hint: ".-..-." }      
};

const REVERSE_MORSE = {};
Object.keys(MORSE_TABLE).forEach(key => REVERSE_MORSE[MORSE_TABLE[key]] = key);

const Q_CODES = [
    { code: "QRG", meaning: "Your exact frequency" },
    { code: "QRH", meaning: "Frequency is varying" },
    { code: "QRI", meaning: "Tone of transmission" },
    { code: "QRK", meaning: "Readability of signals (1-5)" },
    { code: "QRL", meaning: "Are you busy?" },
    { code: "QRM", meaning: "Interference (Man-made)" },
    { code: "QRN", meaning: "Static (Atmospheric)" },
    { code: "QRO", meaning: "High Power / Increase power" },
    { code: "QRP", meaning: "Low Power / Decrease power" },
    { code: "QRQ", meaning: "Send Faster" },
    { code: "QRS", meaning: "Send Slower" },
    { code: "QRT", meaning: "Stop Transmitting" },
    { code: "QRU", meaning: "Have you anything for me?" },
    { code: "QRV", meaning: "Ready" },
    { code: "QRW", meaning: "Inform ... that I am calling" },
    { code: "QRX", meaning: "Stand By / Wait" },
    { code: "QRY", meaning: "Your turn is number ..." },
    { code: "QRZ", meaning: "Who is calling me?" },
    { code: "QSA", meaning: "Signal Strength (1-5)" },
    { code: "QSB", meaning: "Fading Signal" },
    { code: "QSD", meaning: "Keying is defective" },
    { code: "QSG", meaning: "Send ... messages at a time" },
    { code: "QSK", meaning: "Can you hear me between signals? (Break-in)" },
    { code: "QSL", meaning: "Acknowledge Receipt" },
    { code: "QSM", meaning: "Repeat last message" },
    { code: "QSN", meaning: "Did you hear me?" },
    { code: "QSO", meaning: "Contact / Conversation" },
    { code: "QSP", meaning: "Relay message" },
    { code: "QSR", meaning: "Repeat your call" },
    { code: "QSS", meaning: "Working frequency" },
    { code: "QSU", meaning: "Reply on this frequency" },
    { code: "QSV", meaning: "Send V's (for tuning)" },
    { code: "QSW", meaning: "Will send on this frequency" },
    { code: "QSX", meaning: "Listen to ..." },
    { code: "QSY", meaning: "Change Frequency" },
    { code: "QSZ", meaning: "Send each word/group twice" },
    { code: "QRA", meaning: "Name of station" },
    { code: "QRB", meaning: "Distance between us" },
    { code: "QRD", meaning: "Where are you bound?" },
    { code: "QRE", meaning: "Estimated Time of Arrival (ETA)" },
    { code: "QRF", meaning: "Returning to ..." },
    { code: "QTH", meaning: "Location / Position" },
    { code: "QTI", meaning: "Course (True)" },
    { code: "QTJ", meaning: "Speed" },
    { code: "QTL", meaning: "Heading (True)" },
    { code: "QTR", meaning: "Time" },
    { code: "QTA", meaning: "Cancel message" },
    { code: "QTB", meaning: "Disagreement on word count" },
    { code: "QTC", meaning: "Have messages to send" },
    { code: "QTE", meaning: "True bearing" },
    { code: "QTF", meaning: "Position by direction finding" },
    { code: "QTG", meaning: "Send two dashes for tuning" },
    { code: "QTX", meaning: "Keep station open for ..." },
    { code: "QUA", meaning: "Have you news of ...?" },
    { code: "QUC", meaning: "Number of last message" },
    { code: "QUD", meaning: "Received urgent signal" },
    { code: "QUF", meaning: "Received distress signal" },
    { code: "QUM", meaning: "Distress traffic ended" }
];

const WORDLE_WORDS = [
    "RADIO", "MORSE", "AUDIO", "SOUND", "WAVES", "CABLE", "POWER", "TUNER", "METER", "SPARK",
    "DIPOL", "YAGIS", "BEAMS", "TOWER", "MASTS", "EARTH", "GROUND", "NOISE", "STATIC", "FADES",
    "CLEAR", "LOUDS", "QUIET", "VOICE", "PHONE", "CWKEY", "DITS", "DAHS", "SPEED", "WORDS",
    "SPACE", "BREAK", "PAUSE", "START", "FINISH", "READY", "BEGIN", "AGAIN", "REPLY", "SENDS",
    "HEARS", "LISTS", "BANDS", "HERTZ", "MEGAH", "KILOH", "WATTS", "VOLTS", "AMPER", "OHMS",
    "RESIS", "CAPAC", "INDUC", "COILS", "CHOKE", "TRANS", "DIODE", "VALVE", "TUBES", "ANODE",
    "GRID", "CATH", "FILAM", "PLATE", "SCREEN", "MIXER", "OSCIL", "AMPLI", "MODUL", "DEMOD",
    "FILTER", "CRYST", "QUART", "PIEZO", "PHASE", "SHIFT", "DELAY", "ECHO", "REVER", "PITCH",
    "TONES", "BEATS", "PULSE", "CLOCK", "TIMERS", "LOGIC", "GATES", "CHIPS", "MICRO", "MACRO"
];

const DESCRIPTIONS = {
    learn: "Visual mnemonic training. Progress saved automatically.",
    callsigns: "Send randomly generated official callsigns.",
    qcodes: "See a definition, send the Q-Code.",
    random: "Practice sending random character groups.",
    koch: "Master Morse code one character at a time. (RX Only)"
};

const RX_DESCRIPTIONS = {
    callsigns: "Listen to the callsign and type it out.",
    qcodes: "Listen to the Q-Code and type it.",
    random: "Listen to random groups and transcribe them.",
    koch: "Listen to characters from your current level."
};

const BADGES_INFO = {
    first_blood: { name: "First Steps", icon: "footprints", desc: "Complete your first session.", color: "#3b82f6", max: 1, getVal: s => s.sessionsCompleted || 0 },
    apprentice: { name: "Apprentice", icon: "award", desc: "Complete 10 sessions.", color: "#8b5cf6", max: 10, getVal: s => s.sessionsCompleted || 0 },
    speed_demon: { name: "Speed Demon", icon: "zap", desc: "Reach 20 WPM.", color: "#f59e0b", max: 20, getVal: s => s.bestWpm || 0 },
    flawless: { name: "Flawless", icon: "target", desc: "Get 100% accuracy in a session.", color: "#10b981", max: 1, getVal: s => s.perfectSessions || 0 },
    sniper: { name: "Sniper", icon: "crosshair", desc: "Get 10 perfect sessions.", color: "#ef4444", max: 10, getVal: s => s.perfectSessions || 0 },
    lightning: { name: "Lightning Fingers", icon: "zap", desc: "Reach 30 WPM.", color: "#eab308", max: 30, getVal: s => s.bestWpm || 0 },
    qrq_master: { name: "QRQ Master", icon: "rocket", desc: "Reach 40 WPM.", color: "#d946ef", max: 40, getVal: s => s.bestWpm || 0 },
    century: { name: "Century Club", icon: "medal", desc: "Complete 100 total sessions.", color: "#3b82f6", max: 100, getVal: s => s.sessionsCompleted || 0 },
    veteran: { name: "Veteran Operator", icon: "crown", desc: "Complete 500 total sessions.", color: "#eab308", max: 500, getVal: s => s.sessionsCompleted || 0 },
    brass_pounder: { name: "Brass Pounder", icon: "hammer", desc: "Transmit (TX) 1,000 correct characters.", color: "#f97316", max: 1000, getVal: s => s.tx ? s.tx.totalChars || 0 : 0 },
    golden_ear: { name: "Golden Ear", icon: "ear", desc: "Receive (RX) 1,000 correct characters.", color: "#eab308", max: 1000, getVal: s => s.rx ? s.rx.totalChars || 0 : 0 },
    marathoner: { name: "Marathoner", icon: "timer", desc: "Accumulate 1 hour of training time.", color: "#22c55e", max: 60, getVal: s => Math.floor((s.totalPlayTime || 0) / 60000) },
    fanatic: { name: "Radio Fanatic", icon: "radio", desc: "Accumulate 10 hours of training time.", color: "#8b5cf6", max: 600, getVal: s => Math.floor((s.totalPlayTime || 0) / 60000) },
    night_owl: { name: "Night Owl", icon: "moon", desc: "Train between midnight and 4 AM.", color: "#6366f1", max: 1, getVal: s => (s.badges || []).includes('night_owl') ? 1 : 0 },
    early_bird: { name: "Early Bird", icon: "sun", desc: "Train between 4 AM and 8 AM.", color: "#eab308", max: 1, getVal: s => (s.badges || []).includes('early_bird') ? 1 : 0 },
    hawkeye: { name: "Hawkeye", icon: "eye", desc: "Achieve 50 perfect sessions (100%).", color: "#06b6d4", max: 50, getVal: s => s.perfectSessions || 0 },
    endurance: { name: "Endurance Run", icon: "activity", desc: "100% accuracy on a long session (50 items).", color: "#14b8a6", max: 1, getVal: s => (s.badges || []).includes('endurance') ? 1 : 0 },
    dx_hunter: { name: "DX Hunter", icon: "globe", desc: "Complete 25 Callsigns sessions.", color: "#3b82f6", max: 25, getVal: s => s.sessionsCallsigns || 0 },
    radio_lingo: { name: "Radio Lingo", icon: "book-open-check", desc: "Complete 25 Q-Codes sessions.", color: "#8b5cf6", max: 25, getVal: s => s.sessionsQcodes || 0 },
    koch_grad: { name: "Koch Graduate", icon: "graduation-cap", desc: "Complete a session at Koch Level 40.", color: "#f59e0b", max: 40, getVal: s => s.kochLevel || 1 },
    alpha_soup: { name: "Alphabet Soup", icon: "type", desc: "Random mode with letters, numbers & specials.", color: "#10b981", max: 1, getVal: s => (s.badges || []).includes('alpha_soup') ? 1 : 0 },
    old_school: { name: "Old School", icon: "anchor", desc: "100% accuracy using a Straight Key.", color: "#78716c", max: 1, getVal: s => (s.badges || []).includes('old_school') ? 1 : 0 },
    strict_disc: { name: "Strict Disciplinarian", icon: "ruler", desc: "100% accuracy with Strict Timing enabled.", color: "#ef4444", max: 1, getVal: s => (s.badges || []).includes('strict_disc') ? 1 : 0 }
};
