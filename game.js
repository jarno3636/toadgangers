document.getElementById('start-btn').onclick = function() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  startGame();
};

document.getElementById('lore-btn').onclick = function() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('lore-screen').style.display = 'block';
};

document.getElementById('back-btn').onclick = function() {
  document.getElementById('lore-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
};

function startGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let y = 100;
  let gravity = 1.5;
  let velocity = 0;

  document.addEventListener('keydown', () => {
    velocity = -15;
  });

  function drawFrog() {
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(150, y, 60, 60); // simple frog block
  }

  function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    velocity += gravity;
    y += velocity;

    if (y > canvas.height - 60) y = canvas.height - 60;
    if (y < 0) y = 0;

    drawFrog();
    requestAnimationFrame(updateGame);
  }

  updateGame();
}