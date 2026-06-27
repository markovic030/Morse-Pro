let settings = {
  mode: "iambic-a",
  toneType: "sine",
  wpm: 15,
  rxWpm: 15,
  vol: 40,
  tone: 700,
  polarity: "normal",
  strict: false,
  visual: false,
  farnsworth: false,
  farnsworthWpm: 10,
  charTypes: { letters: true, numbers: false, specials: false },
  weighting: 3.0,
  wordSpace: 7,
  sessionLength: 10,
  setupHints: false,
  hasSeenSplash: false,
  customChars: "",
  hideQsoText: false,
};

let userStats = {
  wpmHistory: [],
  txWpmHistory: [],
  rxWpmHistory: [],
  qcodeHistory: [],
  tx: { totalChars: 0, totalErrors: 0, heat: {} },
  rx: { totalChars: 0, totalErrors: 0, heat: {} },
  learnIndex: 0,
  totalPlayTime: 0,
  kochLevel: 1,
  maxKochLevel: 1,
  sessionsCompleted: 0,
  lastCtaSession: 0,
  hasDonated: false,
  lastPlayDate: null,
  perfectSessions: 0,
  badges: [],
  sessionsCallsigns: 0,
  sessionsQcodes: 0,
  bestWpm: 0,
  bestTxWpm: 0,
  bestRxWpm: 0,
};

let gameState = {
  active: false,
  gameMode: "callsigns",
  trainingType: "send",
  hintsEnabled: false,
  items: [],
  currentItemIndex: 0,
  currentCharIndex: 0,
  mistakes: 0,
  sessionActiveTimeMs: 0,
  wordStartTime: null,
  hasStartedTyping: false,
  totalChars: 0,
  targetCount: 10,
  lastInputTime: 0,
  isPlayingAudio: false,
};

let morseState = {
  currentCode: "",
  lastElementTime: 0,
  isTransmitting: false,
  lastElement: "",
  letterTimeout: null,
  wordTimeout: null,
  iambicScheduled: false,
};

let paddleState = {
  ditCurrentlyPressed: false,
  dahCurrentlyPressed: false,
  ditPressedDuringElement: false,
  dahPressedDuringElement: false,
  squeezeCurrentlyPressed: false,
  squeezePressedDuringElement: false,
};

let statsViewMode = "tx";
let audioContext = null;
let masterCompressor = null;
let masterGain = null;
let osc = null;
let gain = null;
let gamepadLoopActive = false; // For USB Gamepad Loop
let badgesExpanded = false; // Controls expanding achievement list
let audioQueueTimeout = null;
let isPlayingSequence = false;
let qsbFade = 1.0;

let setupMode = "callsigns";
let setupType = "send";
let setupHints = false;

/* --- UI State Management for Tabs --- */
const uiState = {
  activeTab: null,
};

let inputsAttached = false;
