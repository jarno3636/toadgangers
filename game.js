const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let frog = { x:160, y:50, vy:0, size:20 };
let pads = [];
let score = 0;
let gameOver = false;

function spawnPad() {
  pads.push({ x: Math.random() * 300, y: 480, w: 60, h: 10 });
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
}

function update() {
  if (gameOver) return;
  frog.vy += 0.6; frog.y += frog.vy;
  frog.y = Math.min(480 - frog.size, frog.y);

  pads.forEach(p => {
    p.y -= 1;
    if (p.y < -p.h) { spawnPad(); pads.shift(); }
    // Collision check
    if (frog.vy > 0 &&
        frog.x < p.x + p.w && frog.x + frog.size > p.x &&
        frog.y + frog.size > p.y && frog.y + frog.size < p.y + p.h) {
      frog.vy = -10;
      score++;
      document.getElementById("score").innerText = "Score: " + score;
    }
  });

  if (frog.y + frog.size >= 480) {
    gameOver = true;
    document.getElementById("share").style.display = "block";
  }
}

function loop() {
  update(); draw();
  if (!gameOver) requestAnimationFrame(loop);
}

canvas.addEventListener("mousemove", e => {
  frog.x = e.offsetX - frog.size/2;
});

document.getElementById("share").addEventListener("click", () => {
  shareScore(score);
});

function shareScore(sc) {
  const url = encodeURIComponent(window.location.href);
  const msg = encodeURIComponent(`🏆 I scored ${sc} in Toadgangers! Play 👉 ${window.location.href}`);
  window.open(`https://warpcast.com/~/compose?text=${msg}`);
}

loop();
