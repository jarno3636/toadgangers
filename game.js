let gameStarted = false;

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  gameStarted = true;
  init(); // or main game loop function
}
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let frog = { x: 150, y: 50, vy: 0, size: 20 };
let pads = [];
let collectibles = [];
let score = 0;
let gameOver = false;

// Spawn a pad
function spawnPad() {
  pads.push({ x: Math.random() * 260, y: 480, w: 60, h: 10 });
}

// Spawn collectibles occasionally
function spawnCollectible() {
  const types = [
    { color: "red", value: 5 },
    { color: "green", value: 3 },
    { color: "blue", value: 2 },
    { color: "cyan", value: 1 }
  ];
  const t = types[Math.floor(Math.random() * types.length)];
  collectibles.push({
    x: Math.random() * 300,
    y: 0,
    size: 12,
    color: t.color,
    value: t.value
  });
}

spawnPad();

function draw() {
  ctx.clearRect(0, 0, 320, 480);

  // Frog
  ctx.fillStyle = "blue";
  ctx.fillRect(frog.x, frog.y, frog.size, frog.size);

  // Lily pads
  ctx.fillStyle = "#0a0";
  pads.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // Collectibles
  collectibles.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function update() {
  if (gameOver) return;

  frog.vy += 0.6;
  frog.y += frog.vy;
  frog.y = Math.min(480 - frog.size, frog.y);

  pads.forEach((p, idx) => {
    p.y -= 1;
    if (p.y < -p.h) {
      pads.splice(idx, 1);
      spawnPad();
    }
    // Pad collision
    if (
      frog.vy > 0 &&
      frog.x < p.x + p.w &&
      frog.x + frog.size > p.x &&
      frog.y + frog.size > p.y &&
      frog.y + frog.size < p.y + p.h
    ) {
      frog.vy = -10;
      score++;
      document.getElementById("score").innerText = "Score: " + score;
    }
  });

  collectibles.forEach((c, i) => {
    c.y += 2;
    if (c.y > 480) {
      collectibles.splice(i, 1);
    } else if (
      frog.x < c.x + c.size &&
      frog.x + frog.size > c.x &&
      frog.y < c.y + c.size &&
      frog.y + frog.size > c.y
    ) {
      score += c.value;
      document.getElementById("score").innerText = "Score: " + score;
      collectibles.splice(i, 1);
    }
  });

  if (Math.random() < 0.005) spawnCollectible();

  if (frog.y + frog.size >= 480) {
    gameOver = true;
    document.getElementById("share").style.display = "block";
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  frog.x = e.clientX - rect.left - frog.size / 2;
});

document.getElementById("share").addEventListener("click", () => {
  shareScore(score);
});

function shareScore(sc) {
  const msg = encodeURIComponent(
    `🏆 I scored ${sc} in Toadgangers! Play 👉 ${window.location.href}`
  );
  window.open(`https://warpcast.com/~/compose?text=${msg}`);
}

loop();
