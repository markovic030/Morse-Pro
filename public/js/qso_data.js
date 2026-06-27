const QSO_NAMES = ['BOB', 'JOHN', 'ALICE', 'TOM', 'JANE', 'MIKE', 'SARAH', 'DAVE', 'CHRIS', 'PAUL', 'MARK', 'ANNA', 'LISA', 'MARY', 'PETER', 'JAMES', 'KEVIN', 'BRIAN', 'GEORGE', 'EDWARD', 'RICHARD', 'THOMAS', 'DANIEL', 'MATTHEW', 'ANTHONY', 'DONALD', 'STEVEN', 'KENNETH', 'ANDREW', 'JOSHUA', 'MARIA', 'SUSAN', 'MARGARET', 'DOROTHY', 'NANCY', 'BETTY', 'HELEN', 'SANDRA', 'DONNA', 'CAROL', 'RUTH', 'SHARON', 'MICHELLE', 'LAURA', 'KAREN', 'KIMBERLY', 'JESSICA', 'SHIRLEY', 'CYNTHIA', 'ANGELA', 'MELISSA', 'BRENDA', 'AMY'];
const QSO_QTHS = ['LONDON', 'NY', 'PARIS', 'TOKYO', 'BERLIN', 'ROME', 'MADRID', 'OSLO', 'VIENNA', 'PRAGUE', 'WARSAW', 'MOSCOW', 'KIEV', 'MINSK', 'RIGA', 'TALLINN', 'VILNIUS', 'HELSINKI', 'STOCKHOLM', 'COPENHAGEN', 'AMSTERDAM', 'BRUSSELS', 'DUBLIN', 'LISBON', 'ATHENS', 'ANKARA', 'CAIRO', 'TEHRAN', 'BAGHDAD', 'RIYADH', 'DUBAI', 'KABUL', 'ISLAMABAD', 'DELHI', 'BEIJING', 'SEOUL', 'TAIPEI', 'HANOI', 'BANGKOK', 'MANILA', 'JAKARTA', 'SYDNEY', 'MELBOURNE', 'AUCKLAND', 'FIJI', 'HAWAII', 'ALASKA', 'SEATTLE', 'PORTLAND', 'SF', 'LA', 'SD', 'LV', 'PHX', 'DENVER', 'DALLAS', 'HOUSTON', 'AUSTIN', 'CHICAGO', 'DETROIT', 'BOSTON', 'MIAMI', 'ATLANTA', 'DC', 'TORONTO', 'MONTREAL', 'VANCOUVER', 'CALGARY', 'EDMONTON', 'OTTAWA', 'HALIFAX', 'MEXICO', 'BOGOTA', 'LIMA', 'SANTIAGO', 'BUENOS AIRES', 'RIO', 'SAO PAULO', 'CARACAS', 'HAVANA', 'SAN JUAN'];
const QSO_WX = ['SUNNY', 'CLOUDY', 'RAIN', 'SNOW', 'FOG', 'WINDY', 'CLEAR', 'OVERCAST', 'DRIZZLE', 'STORMY', 'HAIL', 'SLEET', 'MISTY', 'HUMID', 'DRY', 'HOT', 'COLD', 'FREEZING', 'WARM', 'COOL', 'BREEZY', 'GUSTY', 'CALM', 'THUNDER', 'LIGHTNING'];
const QSO_RIGS = ['IC7300', 'FT891', 'K3', 'K4', 'FTDX101', 'IC7610', 'TS590', 'TS890', 'FT991A', 'IC705', 'KX3', 'KX2', 'X5105', 'G90', 'TRX', 'HOMEBREW', 'QRP LABS', 'QCX', 'QDX', 'TRU SDX', 'IC718', 'FT450D', 'FT818', 'FT857D', 'IC7000', 'IC7100', 'TS2000', 'TS480', 'FLEX 6400', 'FLEX 6600', 'SUNSDR2'];
const QSO_ANTS = ['DIPOLE', 'VERTICAL', 'YAGI', 'HEXBEAM', 'END FED', 'EFHW', 'MAG LOOP', 'BEAM', 'WIRE', 'INVERTED V', 'G5RV', 'COBWEB', 'MOXON', 'SLOPER', 'LONG WIRE', 'WINDOM', 'ZEPP', 'J POLE', 'DISCONE', 'LOG PERIODIC', 'QUAD', 'DELTA LOOP', 'RHOMBIC', 'V BEAM', 'HALO', 'TURNSTILE'];
const QSO_PWR = ['5W', '10W', '50W', '100W', '500W', '1KW', 'QRP'];

const CW_TYPO_DICT = {
    'RHT': 'RST', 'RHS': 'RST', 'RS T': 'RST', 'R ST': 'RST',
    'QTHH': 'QTH', 'Q T H': 'QTH', 'NANE': 'NAME', 'N A M E': 'NAME',
    'RIGG': 'RIG', 'R I G': 'RIG', 'WXX': 'WX', 'W X': 'WX',
    'AN T': 'ANT', 'A N T': 'ANT', 'AG E': 'AGE', 'A G E': 'AGE',
    'PW R': 'PWR', 'P W R': 'PWR', 'QR M': 'QRM', 'Q R M': 'QRM',
    'QS B': 'QSB', 'Q S B': 'QSB', 'QS Y': 'QSY', 'Q S Y': 'QSY',
    'QR T': 'QRT', 'Q R T': 'QRT', 'QR Z': 'QRZ', 'Q R Z': 'QRZ',
    'QS L': 'QSL', 'Q S L': 'QSL', 'QR S': 'QRS', 'Q R S': 'QRS',
    'QR Q': 'QRQ', 'Q R Q': 'QRQ'
};

const COMMON_MORSE_ERRORS = {
    'ET': 'A', 'TE': 'N', 'NN': 'C', 'TR': 'C', 'KE': 'C',
    'MA': 'Q', 'GT': 'Q', 'EN': 'W', 'AT': 'W', 'TI': 'M',
    'IT': 'U', 'EA': 'U', 'ND': 'B', 'TS': 'B', 'TH': 'V',
    'EU': 'V', 'TA': 'G', 'ME': 'G', 'EE': 'I', 'TT': 'M',
    'EEE': 'S', 'EI': 'S', 'IE': 'S', 'EEEE': 'H',
    'EES': '5', 'SEE': '5'
};

let qsoState = {
    step: 0,
    botCallsign: '',
    botName: '',
    botQth: '',
    botWx: '',
    botTemp: '',
    botRig: '',
    botAnt: '',
    botPwr: '',
    botAge: '',
    botWpmOffset: 0,
    userCallsign: '',
    userBuffer: '',
    botIsTyping: false,
    lastResponse: '',
    answeredQuestions: [],
    botSentInfo: [],
    botAskedQuestions: []
};

let qsoAudioContext = null;
let qrmNode = null;
let qrmGain = null;
let qrmFilter = null;
let qrmOscillators = [];
let qsbInterval = null;
let crowdedStations = [];
