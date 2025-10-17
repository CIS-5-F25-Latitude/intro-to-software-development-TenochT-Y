// Dino runner base — player rectangle, obstacles, jump, HUD, simple collision.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  player: { x: 40, y: 0, w: 30, h: 24, vy: 0 },
  obstacles: [],
  score: 0,
  running: true,
  onGround: true,
  startedAt: Date.now(),
};

// Controls
const keys = { up: false };
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.code === 'Space') keys.up = true;
  // Restart key: 'r' or 'R'
  if (e.key === 'r' || e.key === 'R') {
    // allow restart at any time (resets state)
    restart();
  }
});
document.addEventListener('keyup', (e) => { if (e.key === 'ArrowUp' || e.code === 'Space') keys.up = false; });

// Buttons
const restartBtn = document.getElementById('btn-restart');
if (restartBtn) restartBtn.addEventListener('click', () => restart());
const jumpBtn = document.getElementById('btn-jump');
if (jumpBtn) jumpBtn.addEventListener('click', () => tryJump());

// Gameplay constants
const GROUND_PADDING = 4;
const GROUND_Y = canvas.height - GROUND_PADDING;
const GRAVITY_UP = 0.18;
const GRAVITY_DOWN = 0.6;
const JUMP_VY = -10;

// Obstacles config
const OB = { w: 28, h: 36, color: '#ef4444', baseSpeed: 2.0, maxSpeed: 7.0, spawnIntervalMs: 1400 };
let lastSpawnAt = 0;

function restart() {
  state.player.y = GROUND_Y - state.player.h;
  state.player.vy = 0;
  state.obstacles = [];
  state.score = 0;
  state.running = true;
  state.onGround = true;
  state.startedAt = Date.now();
  lastSpawnAt = 0;
  drawHud();
}

function tryJump() {
  if (state.onGround && state.running) {
    state.player.vy = JUMP_VY;
    state.onGround = false;
  }
}

function spawnObstacle(now) {
  const x = canvas.width + OB.w;
  const y = GROUND_Y - OB.h;
  const elapsedSec = Math.max(0, (now - state.startedAt) / 1000);
  const speed = Math.min(OB.maxSpeed, OB.baseSpeed + elapsedSec * 0.05);
  state.obstacles.push({ x, y, w: OB.w, h: OB.h, speed });
}

function update() {
  if (!state.running) return;
  const now = Date.now();

  if (keys.up) tryJump();

  // Player physics
  if (state.player.vy < 0) state.player.vy += GRAVITY_UP; else state.player.vy += GRAVITY_DOWN;
  state.player.y += state.player.vy;

  // Ground collision
  if (state.player.y + state.player.h >= GROUND_Y) {
    state.player.y = GROUND_Y - state.player.h;
    state.player.vy = 0;
    state.onGround = true;
  }

  // Spawn obstacles
  if (now - lastSpawnAt > OB.spawnIntervalMs) { spawnObstacle(now); lastSpawnAt = now; }

  // Move obstacles and cull
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const o = state.obstacles[i];
    o.x -= o.speed;
    if (o.x + o.w < -50) state.obstacles.splice(i, 1);
  }

  // Score (seconds)
  state.score = Math.floor((now - state.startedAt) / 1000);

  // Collision detection
  for (const o of state.obstacles) {
    if (rectsOverlap({ x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h }, o)) {
      state.running = false;
      break;
    }
  }
}

function rectsOverlap(a, b) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Ground strip
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  // Player
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(Math.round(state.player.x), Math.round(state.player.y), state.player.w, state.player.h);

  // Obstacles
  for (const o of state.obstacles) { ctx.fillStyle = OB.color; ctx.fillRect(Math.round(o.x), Math.round(o.y), o.w, o.h); }

  if (!state.running) {
    ctx.fillStyle = '#94a3b8'; ctx.font = '20px system-ui, sans-serif'; ctx.fillText('Game Over — Press Restart', 90, canvas.height / 2);
  }
}

function drawHud() { const scoreEl = document.getElementById('score'); if (scoreEl) scoreEl.textContent = `Score: ${state.score}`; }

function loop() { update(); draw(); drawHud(); requestAnimationFrame(loop); }

restart(); loop();

// Minimal loop and input to get you moving quickly.
// Replace this with your own tiny project or 2D game.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Example state: a ball and a paddle
const state = {
  ball: { x: 60, y: 60, r: 10, vx: 2, vy: 2 },
  // Dinosaur runner-style base
  // Player is a simple rectangle that can jump; obstacles spawn from the right and move left.
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Game state
  const state = {
    player: {
      x: 40,
      y: canvas.height - 28, // anchored to ground (we'll adjust for height)
      w: 30,
      h: 24,
      vy: 0,
    },
    obstacles: [],
    score: 0,
    running: true,
    onGround: true,
    startedAt: Date.now(),
  };

  // Controls
  const keys = { up: false };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === ' ' ) keys.up = true;
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === ' ' ) keys.up = false;
  });

  document.getElementById('btn-restart').addEventListener('click', () => restart());
  const jumpButton = document.getElementById('btn-jump');
  if (jumpButton) jumpButton.addEventListener('click', () => tryJump());

  function restart() {
    state.player.y = canvas.height - state.player.h - 4;
    state.player.vy = 0;
    state.obstacles = [];
    state.score = 0;
    state.running = true;
    state.onGround = true;
    state.startedAt = Date.now();
    lastSpawnAt = 0;
    drawHud();
  }

  // Physics and gameplay constants
  const GRAVITY_UP = 0.18;
  const GRAVITY_DOWN = 0.6;
  const JUMP_VY = -10; // initial jump velocity
  const GROUND_Y = canvas.height - 4; // small padding above canvas bottom

  // Obstacles (deterministic)
  const OB = {
    w: 28,
    h: 36, // will ensure smaller than a reasonable jump height
    color: '#ef4444',
    baseSpeed: 2.0,
    maxSpeed: 7.0,
    spawnIntervalMs: 1400,
  };

  let lastSpawnAt = 0;

  function tryJump() {
    if (state.onGround && state.running) {
      state.player.vy = JUMP_VY;
      state.onGround = false;
    }
  }

  function spawnObstacle(now) {
    const x = canvas.width + OB.w;
    const y = GROUND_Y - OB.h; // level with ground
    const elapsedSec = Math.max(0, (now - state.startedAt) / 1000);
    const speed = Math.min(OB.maxSpeed, OB.baseSpeed + elapsedSec * 0.05);
    state.obstacles.push({ x, y, w: OB.w, h: OB.h, speed });
  }

  function update() {
    if (!state.running) return;

    const now = Date.now();

    // Jump input (space or arrow up)
    if (keys.up) tryJump();

    // Player physics
    if (state.player.vy < 0) {
      state.player.vy += GRAVITY_UP;
    } else {
      state.player.vy += GRAVITY_DOWN;
    }
    state.player.y += state.player.vy;

    // Ground collision
    if (state.player.y + state.player.h >= GROUND_Y) {
      state.player.y = GROUND_Y - state.player.h;
      state.player.vy = 0;
      state.onGround = true;
    }

    // Spawn obstacles
    if (now - lastSpawnAt > OB.spawnIntervalMs) {
      spawnObstacle(now);
      lastSpawnAt = now;
    }

    // Move obstacles and remove off-screen
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const o = state.obstacles[i];
      o.x -= o.speed;
      if (o.x + o.w < -50) state.obstacles.splice(i, 1);
    }

    // Score increases by time survived (seconds)
    state.score = Math.floor((now - state.startedAt) / 1000);

    // Collision detection (rect vs rect)
    for (const o of state.obstacles) {
      if (rectsOverlap({ x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h }, o)) {
        state.running = false;
        break;
      }
    }
  }

  function rectsOverlap(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // Player (dino)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(Math.round(state.player.x), Math.round(state.player.y), state.player.w, state.player.h);

    // Obstacles
    for (const o of state.obstacles) {
      ctx.fillStyle = OB.color;
      ctx.fillRect(Math.round(o.x), Math.round(o.y), o.w, o.h);
    }

    // HUD / Game Over
    if (!state.running) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText('Game Over — Press Restart', 90, canvas.height / 2);
    }
  }

  function drawHud() {
    const scoreEl = document.getElementById('score');
    scoreEl.textContent = `Score: ${state.score}`;
  }

  function loop() {
    update();
    draw();
    drawHud();
    requestAnimationFrame(loop);
  }

  restart();
  loop();
}

function drawHud() {
  const scoreEl = document.getElementById('score');
  scoreEl.textContent = `Score: ${state.score}`;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

restart();
loop();

