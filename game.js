const startBtn = document.getElementById('start-btn');
const loreBtn = document.getElementById('lore-btn');
const backBtn = document.getElementById('back-btn');
const shareBtn = document.getElementById('share-btn');
const startScreen = document.getElementById('start-screen');
const loreScreen = document.getElementById('lore-screen');
const gameCanvas = document.getElementById('game');
const ctx = gameCanvas.getContext('2d');
const scoreEl = document.getElementById('score');

let score = 0, gameOver = false;
let frog = { x: 150, y: 100, vy: 0, size: 32 };
let pads = [];
let collectibles = [];

startBtn.onclick = () => { startScreen.style.display = 'none'; startGame(); };
loreBtn.onclick = () => { startScreen.style.display = 'none'; loreScreen.style.display = 'block'; };
backBtn.onclick = () => { loreScreen.style.display = 'none'; startScreen.style.display = 'block'; };

function startGame() {
  gameCanvas.style.display = 'block';
  score = 0; gameOver = false;
  pads = [{ x: 140, y: 560, w: 80, h: 16 }];
  collectibles = [];
  scoreEl.innerText = `Score: ${score}`;
  update();
}

document.body.onkeydown = (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') frog.vy = -12;
};

function spawnPad() {
  pads.push({ x: Math.random() * 280, y: 660, w: 80, h: 16 });
}
function spawnCollectible() {
  const types = [
    { color: 'yellow', val: 5 },
    { color: 'red', val: 3 },
    { color: 'green', val: 2 },
    { color: 'cyan', val: 1 }
  ];
  let t = types[Math.random()*types.length|0];
  collectibles.push({ x: Math.random()*320, y: 0, size: 12, color: t.color, val: t.val });
}

function update() {
  if (gameOver) return;
  ctx.clearRect(0,0,gameCanvas.width, gameCanvas.height);
  frog.vy += 0.6; frog.y += frog.vy;

  if (Math.random()<0.01) spawnCollectible();
  collectibles.forEach((c,i)=> {
    c.y += 2;
    if (c.y>640) collectibles.splice(i,1);
    if (frog.x < c.x+c.size && frog.x+frog.size > c.x && frog.y < c.y+c.size && frog.y+frog.size > c.y){
      score += c.val;
      scoreEl.innerText = `Score: ${score}`;
      collectibles.splice(i,1);
    }
  });

  pads.forEach((p,i)=> {
    p.y -= 2;
    if (p.y < -p.h) { pads.splice(i,1); spawnPad(); }
    if (frog.vy>0 && frog.x < p.x+p.w && frog.x+frog.size > p.x && frog.y+frog.size > p.y && frog.y+frog.size < p.y+p.h) {
      frog.vy = -12;
      score++;
      scoreEl.innerText = `Score: ${score}`;
    }
  });

  pads.forEach(p => {
    ctx.fillStyle='#0a0'; ctx.fillRect(p.x, p.y, p.w, p.h);
  });
  collectibles.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.size,0,2*Math.PI);
    ctx.fill();
  });
  ctx.fillStyle='blue'; ctx.fillRect(frog.x, frog.y, frog.size, frog.size);

  if (frog.y+frog.size >= 640) endGame();
  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  shareBtn.style.display = 'inline-block';
  shareBtn.onclick = () => {
    const text = encodeURIComponent(`🏆 I scored ${score} in Toadgangers! Can you beat me?`);
    window.open(`https://warpcast.com/~/compose?text=${text}`);
  };
}

gameCanvas.onmousemove = (e) => {
  const r = gameCanvas.getBoundingClientRect();
  frog.x = e.clientX - r.left - frog.size/2;
};
