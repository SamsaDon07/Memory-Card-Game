/* ================= DOM ================= */
const gameBoard = document.getElementById('gameBoard');
const moveCounter = document.getElementById('moveCounter');
const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');
const restartBtn = document.getElementById('restartBtn');
const leaderboardEl = document.getElementById('leaderboard');
const confettiCanvas = document.getElementById('confettiCanvas');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

/* ================= STATE ================= */
let cards = [];
let flipped = [];
let moves = 0;
let seconds = 0;
let timer = null;
let level = 1;
let matched = 0;
let gameStarted = false;

const emojis = ["🐶","🐱","🦊","🐸","🐵","🐼","🐤","🐙","🦄","🦁","🐰","🐧"];

/* ================= START ================= */
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  gameStarted = true;
  initGame();
});

/* ================= INIT ================= */
function initGame() {
  resetStats();
  startTimer();

  const pairs = Math.min(level + 2, emojis.length);
  const selected = shuffle([...emojis]).slice(0, pairs);
  cards = shuffle([...selected, ...selected]);

  renderBoard();
  renderLeaderboard();
}

/* ================= RENDER ================= */
function renderBoard() {
  gameBoard.innerHTML = '';
  cards.forEach(symbol => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    gameBoard.appendChild(card);
  });
}

/* ================= GAME LOGIC ================= */
function flipCard(card) {
  if (!gameStarted) return;
  if (flipped.length === 2 || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    moveCounter.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flipped;

  if (a.dataset.symbol === b.dataset.symbol) {
    matched++;
    launchConfetti();
    flipped = [];

    if (matched === cards.length / 2) {
      clearInterval(timer);
      saveScore();
      setTimeout(nextLevel, 800);
    }
  } else {
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flipped = [];
    }, 700);
  }
}

/* ================= TIMER ================= */
function startTimer() {
  timer = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

/* ================= LEVEL ================= */
function nextLevel() {
  level++;
  alert(`🔥 Level ${level}`);
  initGame();
}

/* ================= LEADERBOARD ================= */
function saveScore() {
  const scores = JSON.parse(localStorage.getItem('memoryScores')) || {};
  const best = scores[level];

  if (!best || seconds < best.time || moves < best.moves) {
    scores[level] = { time: seconds, moves };
    localStorage.setItem('memoryScores', JSON.stringify(scores));
  }
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('memoryScores')) || {};
  const levels = Object.keys(scores);

  if (!levels.length) {
    leaderboardEl.innerHTML = `<p class="text-center opacity-70">No scores yet. Play a game!</p>`;
    return;
  }

  leaderboardEl.innerHTML = levels.map(lvl => {
    const { time, moves } = scores[lvl];
    return `
      <div class="leader-row">
        <span>Level ${lvl}</span>
        <span>${formatTime(time)} · ${moves} moves</span>
      </div>
    `;
  }).join('');
}

/* ================= UTIL ================= */
function resetStats() {
  moves = 0;
  seconds = 0;
  matched = 0;
  flipped = [];
  moveCounter.textContent = '0';
  timerEl.textContent = '00:00';
  levelEl.textContent = level;
  clearInterval(timer);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2,'0');
  const s = String(sec % 60).padStart(2,'0');
  return `${m}:${s}`;
}

/* ================= CONFETTI ================= */
function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const w = confettiCanvas.width = innerWidth;
  const h = confettiCanvas.height = innerHeight;

  const pieces = Array.from({ length: 40 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 6 + 4,
    d: Math.random() * 30,
    c: `hsl(${Math.random() * 360},80%,60%)`
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach(p => {
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.r, p.r);
      p.y += Math.cos(frame + p.d) + 2;
      if (p.y > h) p.y = -10;
    });
    frame += 0.1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ================= EVENTS ================= */
restartBtn.addEventListener('click', () => {
  level = 1;
  gameStarted = true;
  initGame();
});

window.addEventListener('resize', () => {
  confettiCanvas.width = innerWidth;
  confettiCanvas.height = innerHeight;
});

// render leaderboard immediately so saved scores show before starting a new game
renderLeaderboard();
