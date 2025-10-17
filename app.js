// Minimal loop and input to get you moving quickly.
// Replace this with your own tiny project or 2D game.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Example state: a ball and a paddle
const state = {
  ball: { x: 60, y: 60, r: 10, vx: 2, vy: 2 },
  paddle: { x: 200, y: canvas.height - 20, w: 80, h: 10, speed: 4 },
  score: 0,
  running: true,
  keys: { left: false, right: false },
  enemies: [],
  startedAt: Date.now(),
};

// Input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') state.keys.left = true;
  if (e.key === 'ArrowRight') state.keys.right = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') state.keys.left = false;
  if (e.key === 'ArrowRight') state.keys.right = false;
});

document.getElementById('btn-restart').addEventListener('click', () => restart());

function restart() {
  state.ball.x = 60; state.ball.y = 60; state.ball.vx = 2; state.ball.vy = 2;
  state.paddle.x = (canvas.width - state.paddle.w) / 2;
  state.score = 0;
  state.enemies = [];
  state.startedAt = Date.now();
  state.running = true;
  drawHud();
}

// Enemy configuration (deterministic)
const PLAYER_JUMP_HEIGHT = 80; // reference jump height in pixels
const ENEMY = {
  w: 28,
  h: Math.min(PLAYER_JUMP_HEIGHT - 10, 40), // ensure not taller than player's jump height
  color: '#ef4444',
  baseSpeed: 1.2, // starting speed (px per frame)
  maxSpeed: 5.0,
  spawnIntervalMs: 1800, // spawn interval in ms
};

let lastSpawnAt = 0;

function spawnEnemy(now) {
  const x = canvas.width + ENEMY.w;
  const groundY = canvas.height;
  const y = groundY - ENEMY.h; // level with ground
  const elapsedSec = Math.max(0, (now - state.startedAt) / 1000);
  const speed = Math.min(ENEMY.maxSpeed, ENEMY.baseSpeed + elapsedSec * 0.03);
  state.enemies.push({ x, y, w: ENEMY.w, h: ENEMY.h, speed });
}

function update() {
  if (!state.running) return;

  // Paddle movement
  if (state.keys.left) state.paddle.x -= state.paddle.speed;
  if (state.keys.right) state.paddle.x += state.paddle.speed;
  state.paddle.x = window.utils.clamp(state.paddle.x, 0, canvas.width - state.paddle.w);

  // Ball movement
  state.ball.x += state.ball.vx;
  state.ball.y += state.ball.vy;

  // Wall bounce
  if (state.ball.x - state.ball.r < 0 || state.ball.x + state.ball.r > canvas.width) {
    state.ball.vx = -state.ball.vx;
  }
  if (state.ball.y - state.ball.r < 0) {
    state.ball.vy = -state.ball.vy;
  }

  // Paddle collision (simple AABB vs circle check)
  if (state.ball.y + state.ball.r >= state.paddle.y &&
      state.ball.x >= state.paddle.x &&
      state.ball.x <= state.paddle.x + state.paddle.w &&
      state.ball.vy > 0) {
    state.ball.vy = -Math.abs(state.ball.vy);
    state.score += 1;
    drawHud();
  }

  // Ground collision and landing
  const groundY = canvas.height; // canvas bottom is ground
  if (state.ball.y + state.ball.r >= groundY) {
    // Clamp to ground
    state.ball.y = groundY - state.ball.r;
    // Stop downward velocity
    if (state.ball.vy > 0) state.ball.vy = 0;
    state.onGround = true;
  }

  // Missed ball (gone below ground) should not happen due to clamping, but if it does, stop the game
  if (state.ball.y - state.ball.r > canvas.height + 50) {
    state.running = false;
  }

  // Enemies: spawn periodically and move left; remove when off-screen
  const now = Date.now();
  if (now - lastSpawnAt > ENEMY.spawnIntervalMs) {
    spawnEnemy(now);
    lastSpawnAt = now;
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.x -= e.speed;
    if (e.x + e.w < -50) state.enemies.splice(i, 1);
  }

  // Collision detection between ball (circle) and enemies (rect)
  for (const e of state.enemies) {
    if (circleRectCollision(state.ball, e)) {
      // Game over on collision
      state.running = false;
      break;
    }
  }
}

/**
 * Check collision between a circle and rectangle.
 * circle: {x, y, r}
 * rect: {x, y, w, h}
 */
function circleRectCollision(circle, rect) {
  const cx = circle.x;
  const cy = circle.y;
  const r = circle.r;

  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.w;
  const rh = rect.h;

  // Find the closest point to the circle within the rectangle
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  // Calculate the distance between circle's center and this closest point
  const dx = cx - closestX;
  const dy = cy - closestY;

  return (dx * dx + dy * dy) <= (r * r);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ball
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
  ctx.fill();

  // Paddle
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);

  // Draw enemies (deterministic appearance)
  for (const e of state.enemies) {
    ctx.fillStyle = ENEMY.color;
    ctx.fillRect(Math.round(e.x), Math.round(e.y), e.w, e.h);
  }

  if (!state.running) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Game Over — Press Restart', 110, canvas.height / 2);
  }
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

