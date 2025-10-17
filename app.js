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
  keys: { left: false, right: false, up: false },
  onGround: false,
};

// Input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') state.keys.left = true;
  if (e.key === 'ArrowRight') state.keys.right = true;
  if (e.key === 'ArrowUp') state.keys.up = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') state.keys.left = false;
  if (e.key === 'ArrowRight') state.keys.right = false;
  if (e.key === 'ArrowUp') state.keys.up = false;
});

document.getElementById('btn-restart').addEventListener('click', () => restart());
document.getElementById('btn-jump').addEventListener('click', () => doJump());

function doJump() {
  // Only jump when touching the ground
  if (state.onGround) {
    // Give a negative vy to go up. Use a value that results in a slower ascent
    // than the descent (we'll apply stronger gravity when falling).
    state.ball.vy = -6;
    state.onGround = false;
  }
}

function restart() {
  state.ball.x = 60; state.ball.y = 60; state.ball.vx = 2; state.ball.vy = 2;
  state.paddle.x = (canvas.width - state.paddle.w) / 2;
  state.score = 0;
  state.running = true;
  drawHud();
}

function update() {
  if (!state.running) return;

  // Paddle movement
  if (state.keys.left) state.paddle.x -= state.paddle.speed;
  if (state.keys.right) state.paddle.x += state.paddle.speed;
  state.paddle.x = window.utils.clamp(state.paddle.x, 0, canvas.width - state.paddle.w);

  // Ball movement
  state.ball.x += state.ball.vx;

  // Gravity: weaker while rising, stronger while falling so ascent is slower than descent
  const GRAVITY_UP = 0.18; // slow upward deceleration
  const GRAVITY_DOWN = 0.5; // faster downward acceleration
  if (state.ball.vy < 0) {
    state.ball.vy += GRAVITY_UP;
  } else {
    state.ball.vy += GRAVITY_DOWN;
  }
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

