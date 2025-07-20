// Leaderboard functionality
let currentLeaderboardTab = 'daily';

function getStorageKey(type) {
  const today = new Date().toDateString();
  return type === 'daily' ? `toadjumpers_daily_${today}` : 'toadjumpers_alltime';
}

function saveScore(playerName, score, timeAlive) {
  const scoreData = {
    name: playerName || 'Anonymous Toad',
    score: score,
    time: timeAlive,
    date: new Date().toISOString()
  };

  // Save to daily leaderboard
  const dailyKey = getStorageKey('daily');
  let dailyScores = JSON.parse(localStorage.getItem(dailyKey) || '[]');
  dailyScores.push(scoreData);
  dailyScores.sort((a, b) => b.score - a.score);
  dailyScores = dailyScores.slice(0, 10); // Keep top 10
  localStorage.setItem(dailyKey, JSON.stringify(dailyScores));

  // Save to all-time leaderboard
  const alltimeKey = getStorageKey('alltime');
  let alltimeScores = JSON.parse(localStorage.getItem(alltimeKey) || '[]');
  alltimeScores.push(scoreData);
  alltimeScores.sort((a, b) => b.score - a.score);
  alltimeScores = alltimeScores.slice(0, 50); // Keep top 50
  localStorage.setItem(alltimeKey, JSON.stringify(alltimeScores));
}

function displayLeaderboard(type) {
  const leaderboardList = document.getElementById('leaderboard-list');
  const scores = JSON.parse(localStorage.getItem(getStorageKey(type)) || '[]');

  if (scores.length === 0) {
    leaderboardList.innerHTML = '<p style="color: #888; text-align: center; margin-top: 50px;">No scores yet. Be the first!</p>';
    return;
  }

  leaderboardList.innerHTML = scores.map((score, index) => `
    <div class="leaderboard-entry">
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${score.name}</span>
      <span class="leaderboard-score">${score.score} pts</span>
    </div>
  `).join('');
}

function showLeaderboard() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('leaderboard-screen').style.display = 'block';
  displayLeaderboard(currentLeaderboardTab);
}

function hideLeaderboard() {
  document.getElementById('leaderboard-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
  // Update game limit display
  gameLimitManager.updateGameLimitDisplay();
}

// Farcaster integration functions
function generateScoreImage(score, timeAlive, playerName) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, '#0f0f23');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);

  // Title
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 28px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('🐸 Toad Jumpers', 200, 50);

  // Score box
  ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
  ctx.fillRect(50, 100, 300, 200);
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 100, 300, 200);

  // Player name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Courier New';
  ctx.fillText(playerName || 'Anonymous Toad', 200, 140);

  // Score
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 36px Courier New';
  ctx.fillText(`${score} pts`, 200, 190);

  // Time survived
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 18px Courier New';
  ctx.fillText(`Survived: ${Math.floor(timeAlive/60)}s`, 200, 220);

  // Frog emoji (simulate with circle)
  ctx.fillStyle = '#00BFFF';
  ctx.beginPath();
  ctx.arc(200, 270, 30, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(190, 260, 8, 0, Math.PI * 2);
  ctx.arc(210, 260, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(190, 260, 4, 0, Math.PI * 2);
  ctx.arc(210, 260, 4, 0, Math.PI * 2);
  ctx.fill();

  // Challenge text
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Courier New';
  ctx.fillText('Can you beat this score? 🏆', 200, 350);

  return canvas.toDataURL('image/png');
}

function generateChallengeSeed(score, timeAlive) {
  // Create a challenge seed based on score and time
  const seed = btoa(`${score}-${timeAlive}-${Date.now()}`);
  return seed.substring(0, 16); // Keep it short
}

function createFarcasterCast(score, timeAlive, playerName, imageDataUrl, challengeSeed) {
  const sanitizedPlayerName = (playerName || 'Anonymous Toad').replace(/[<>]/g, '');
  const baseUrl = window.location.origin;

  const castText = `🐸 Just scored ${score} points in Toad Jumpers! 
Survived for ${Math.floor(timeAlive/60)} seconds jumping between lily pads.

🏆 Think you can beat ${sanitizedPlayerName}? 
Play: ${baseUrl}
Challenge: ${baseUrl}?challenge=${challengeSeed}

#ToadJumpers #GameOn #Farcaster`;

  // Create Farcaster share URL with proper encoding
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`;

  return {
    castText,
    farcasterUrl,
    imageDataUrl,
    challengeSeed
  };
}

function shareToFarcaster(score, timeAlive) {
  const playerName = document.getElementById('player-name').value.trim() || 'Anonymous Toad';

  // Generate score image
  const imageDataUrl = generateScoreImage(score, timeAlive, playerName);

  // Generate challenge seed
  const challengeSeed = generateChallengeSeed(score, timeAlive);

  // Check if in Farcaster frame context
  if (typeof farcasterFrameManager !== 'undefined' && farcasterFrameManager.isFrameContext) {
    const frameShareData = farcasterFrameManager.createFrameShareCast(score, timeAlive, playerName);
    showFarcasterModal({
      castText: frameShareData.text,
      farcasterUrl: `https://warpcast.com/~/compose?text=${encodeURIComponent(frameShareData.text)}&embeds[]=${encodeURIComponent(frameShareData.embeds[0])}`,
      imageDataUrl: imageDataUrl,
      challengeSeed: challengeSeed,
      isFrame: true
    });
  } else {
    // Create regular cast data
    const castData = createFarcasterCast(score, timeAlive, playerName, imageDataUrl, challengeSeed);

    // Show modal with cast preview and options
    showFarcasterModal(castData);
  }

  console.log("Farcaster cast data generated");
}

function showFarcasterModal(castData) {
  try {
    const modal = document.getElementById('farcaster-modal');
    if (!modal) {
      console.error('Farcaster modal not found in DOM');
      return;
    }

    // Safely set cast text without innerHTML
    const castTextElement = modal.querySelector('.cast-text');
    castTextElement.textContent = castData.castText;
    castTextElement.style.whiteSpace = 'pre-line';

    // Set score image preview
    const imagePreview = modal.querySelector('.score-image-preview');
    imagePreview.innerHTML = `<img src="${castData.imageDataUrl}" alt="Score Image" style="max-width: 200px; border-radius: 10px; margin: 10px 0;">`;

    // Remove existing event listeners and add new ones
    const farcasterBtn = modal.querySelector('.farcaster-share-btn');
    const copyBtn = modal.querySelector('.copy-cast-btn');
    const downloadBtn = modal.querySelector('.download-image-btn');

    farcasterBtn.replaceWith(farcasterBtn.cloneNode(true));
    copyBtn.replaceWith(copyBtn.cloneNode(true));
    downloadBtn.replaceWith(downloadBtn.cloneNode(true));

    modal.querySelector('.farcaster-share-btn').addEventListener('click', () => {
      window.open(castData.farcasterUrl, '_blank');
    });

    modal.querySelector('.copy-cast-btn').addEventListener('click', () => {
      copyToClipboard(castData.castText);
    });

    modal.querySelector('.download-image-btn').addEventListener('click', () => {
      downloadImage(castData.imageDataUrl, 'toad-jumpers-score.png');
    });

    modal.querySelector('.challenge-info code').textContent = castData.challengeSeed;
    modal.style.display = 'flex';

  } catch (error) {
    console.error('Failed to show Farcaster modal:', error);
    alert('Failed to open share modal. Please try again.');
  }
}

function copyToClipboard(text) {
  const btn = event.target;
  const originalText = btn.textContent;

  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅ Copied!';
      btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }).catch(err => {
      console.error('Clipboard API failed:', err);
      fallbackCopyTextToClipboard(text, btn, originalText);
    });
  } else {
    // Fallback for older browsers or non-secure contexts
    fallbackCopyTextToClipboard(text, btn, originalText);
  }
}

function fallbackCopyTextToClipboard(text, btn, originalText) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    btn.textContent = '✅ Copied!';
    btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    btn.textContent = '❌ Copy failed';
    btn.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }

  document.body.removeChild(textArea);
}

function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '✅ Downloaded!';
  btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 2000);
}

// Challenge mode functionality
function checkForChallenge() {
  const urlParams = new URLSearchParams(window.location.search);
  const challengeSeed = urlParams.get('challenge');

  if (challengeSeed) {
    // Show challenge notification
    const challengeDiv = document.createElement('div');
    challengeDiv.className = 'challenge-notification';
    challengeDiv.innerHTML = `
      <div class="challenge-content">
        <h3>🏆 Challenge Mode!</h3>
        <p>Someone challenged you to beat their score!</p>
        <p><strong>Challenge ID:</strong> <code>${challengeSeed}</code></p>
        <button onclick="acceptChallenge('${challengeSeed}')" class="accept-challenge-btn">Accept Challenge</button>
        <button onclick="dismissChallenge()" class="dismiss-challenge-btn">Maybe Later</button>
      </div>
    `;

    document.body.appendChild(challengeDiv);
  }
}

function acceptChallenge(challengeSeed) {
  // Store challenge info
  sessionStorage.setItem('currentChallenge', challengeSeed);

  // Start game immediately
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  dismissChallenge();
  startGame();
}

function dismissChallenge() {
  const notification = document.querySelector('.challenge-notification');
  if (notification) {
    notification.remove();
  }
  // Clear URL parameter
  const url = new URL(window.location);
  url.searchParams.delete('challenge');
  window.history.replaceState({}, document.title, url);
}

// Sound manager
class SoundManager {
  constructor() {
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.updateSoundButton();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('soundEnabled', this.soundEnabled.toString());
    this.updateSoundButton();
  }

  updateSoundButton() {
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      if (this.soundEnabled) {
        btn.textContent = '🔊 Sound: ON';
        btn.classList.remove('muted');
      } else {
        btn.textContent = '🔇 Sound: OFF';
        btn.classList.add('muted');
      }
    }
  }

  playSound(callback) {
    if (this.soundEnabled) {
      callback();
    }
  }
}

const soundManager = new SoundManager();

// Daily game limit system
class GameLimitManager {
  constructor() {
    this.maxGamesPerDay = 10;
    this.resetHour = 6; // 6 AM
  }

  getGameLimitKey() {
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(this.resetHour, 0, 0, 0);

    // If current time is before 6 AM, use previous day's date
    if (now.getHours() < this.resetHour) {
      resetTime.setDate(resetTime.getDate() - 1);
    }

    return `game_limit_${resetTime.toDateString()}`;
  }

  getGamesPlayedToday() {
    const key = this.getGameLimitKey();
    return parseInt(localStorage.getItem(key) || '0');
  }

  incrementGamesPlayed() {
    const key = this.getGameLimitKey();
    const currentCount = this.getGamesPlayedToday();
    localStorage.setItem(key, (currentCount + 1).toString());
  }

  canPlayGame() {
    return this.getGamesPlayedToday() < this.maxGamesPerDay;
  }

  getGamesRemaining() {
    return Math.max(0, this.maxGamesPerDay - this.getGamesPlayedToday());
  }

  getTimeUntilReset() {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setHours(this.resetHour, 0, 0, 0);

    // If we're past 6 AM today, next reset is tomorrow at 6 AM
    if (now.getHours() >= this.resetHour) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    const timeDiff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }

  updateGameLimitDisplay() {
    const gamesRemaining = this.getGamesRemaining();
    const timeUntilReset = this.getTimeUntilReset();

    // Update or create game limit display
    let limitDisplay = document.getElementById('game-limit-display');
    if (!limitDisplay) {
      limitDisplay = document.createElement('div');
      limitDisplay.id = 'game-limit-display';
      limitDisplay.className = 'game-limit-info';

      const startScreen = document.getElementById('start-screen');
      const startBtn = document.getElementById('start-btn');
      startScreen.insertBefore(limitDisplay, startBtn);
    }

    if (gamesRemaining > 0) {
      limitDisplay.innerHTML = `
        <div class="games-remaining">
          🎮 Games remaining today: <span class="count">${gamesRemaining}/${this.maxGamesPerDay}</span>
        </div>
      `;
      limitDisplay.className = 'game-limit-info';
    } else {
      limitDisplay.innerHTML = `
        <div class="games-exhausted">
          ⏰ Daily limit reached! Reset in ${timeUntilReset.hours}h ${timeUntilReset.minutes}m
        </div>
      `;
      limitDisplay.className = 'game-limit-info exhausted';
    }
  }

  showLimitReachedModal() {
    const timeUntilReset = this.getTimeUntilReset();
    const modal = document.createElement('div');
    modal.className = 'limit-reached-modal';
    modal.innerHTML = `
      <div class="limit-reached-content">
        <h3>🎮 Daily Limit Reached!</h3>
        <p>You've played ${this.maxGamesPerDay} games today.</p>
        <p>Games reset daily at 6:00 AM.</p>
        <div class="reset-timer">
          <strong>Next reset in: ${timeUntilReset.hours}h ${timeUntilReset.minutes}m</strong>
        </div>
        <p class="tip-text">💡 Tip: Connect your wallet to earn TOBY tokens from completed games!</p>
        <button onclick="this.closest('.limit-reached-modal').remove()" class="close-modal-btn">
          Got it!
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  }
}

// Initialize game limit manager
const gameLimitManager = new GameLimitManager();

// Enhanced social integration
function updateSocialStats(gameData) {
  if (typeof frameHandler !== 'undefined' && frameHandler.isFrameContext) {
    // Update user's social gaming stats
    const socialStats = {
      lastScore: gameData.score,
      gamesPlayedToday: gameLimitManager.getGamesPlayedToday(),
      achievements: calculateGameAchievements(gameData),
      canInvite: gameData.score > 500,
      canChallenge: gameData.score > 1000
    };

    frameHandler.updateSocialStats(socialStats);
  }
}

function calculateGameAchievements(gameData) {
  const achievements = [];

  if (gameData.score >= 500) achievements.push('🏅 Skilled Jumper');
  if (gameData.score >= 1000) achievements.push('🏆 Toad Master');
  if (gameData.score >= 2000) achievements.push('👑 Lily Pad Legend');
  if (gameData.timeAlive >= 60) achievements.push('⏱️ Survivor');
  if (gameData.timeAlive >= 120) achievements.push('🔥 Endurance King');
  if (gameData.tokensCollected >= 20) achievements.push('💰 Token Hunter');
  if (gameData.tokensCollected >= 50) achievements.push('🏪 Token Master');

  return achievements;
}

// Enhanced game over with social features
function enhancedGameOver(gameScore, gameTimeAlive, gameTokensCollected, gameMaxCombo) {
  const gameData = {
    score: gameScore,
    timeAlive: gameTimeAlive,
    tokensCollected: gameTokensCollected,
    combo: gameMaxCombo
  };

  // Update social stats
  updateSocialStats(gameData);

  // Show achievements
  const achievements = calculateGameAchievements(gameData);
  if (achievements.length > 0) {
    showAchievementNotification(achievements);
  }

  // Update user activity for frame context
  if (typeof farcasterFrameManager !== 'undefined' && farcasterFrameManager.userFid) {
    farcasterFrameManager.postFrameMessage('gameCompleted', gameData);
  }
}

function showAchievementNotification(achievements) {
  if (!achievements || achievements.length === 0) return;

  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <div class="achievement-icon">🏆</div>
      <h3>Achievements Unlocked!</h3>
      <div class="achievement-list">
        ${achievements.map(ach => `<div class="achievement-item">${ach}</div>`).join('')}
      </div>
      <div class="achievement-reward">+${achievements.length * 10} TOBY bonus!</div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 500);
  }, 5000);

  // Award achievement bonus
  if (typeof web3Manager !== 'undefined') {
    web3Manager.awardTokens(achievements.length * 10, 'Achievement bonus');
  }
}

// Initialize global variables
let gameRunning = false;
let frameHandler = null;

// Global startGame function
function startGame() {
  if (typeof window.startGameInstance === 'function') {
    window.startGameInstance();
  }
}

// Navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Close modal handlers
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('close')) {
      const modal = event.target.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('farcaster-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  // Check for challenge mode on load
  checkForChallenge();

  // Update game limit display
  gameLimitManager.updateGameLimitDisplay();

  document.getElementById('start-btn').addEventListener('click', function() {
    // Check if player can start a new game
    if (!gameLimitManager.canPlayGame()) {
      gameLimitManager.showLimitReachedModal();
      return;
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    startGame();
  });

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', function() {
      soundManager.toggleSound();
    });
  }

  document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
  document.getElementById('back-from-leaderboard-btn').addEventListener('click', hideLeaderboard);

  // Leaderboard tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      currentLeaderboardTab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      displayLeaderboard(currentLeaderboardTab);
    });
  });
});

window.startGameInstance = function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Game state
  let gameRunning = true;
  let gamePaused = false;
  let score = 0;
  let gameTime = 0;
  let maxGameTime = 1800; // 30 seconds at 60 FPS (30 * 60)
  let tokensCollected = 0;
  let tokenTypesCollected = new Set();
  let combo = 0;
  let maxCombo = 0;
  let isChallengeMode = sessionStorage.getItem('challengeMode') === 'true';
  let keys = {};
  let lastJumpTime = 0;
  const jumpCooldown = 100;

  // Frog properties - ensure proper sizing and positioning
  let frog = {
    x: canvas.width / 2 - 30, // Center horizontally
    y: 400,
    width: 60,
    height: 60,
    velocity: 0,
    onGround: false
  };

  const gravity = 0.8;
  const jumpPower = -18;

  // Lily pads (platforms)
  let lilyPads = [
    { x: 50, y: 500, width: 100, height: 20 },
    { x: 200, y: 450, width: 100, height: 20 },
    { x: 80, y: 350, width: 100, height: 20 },
    { x: 250, y: 300, width: 100, height: 20 },
    { x: 30, y: 200, width: 100, height: 20 },
    { x: 200, y: 150, width: 100, height: 20 }
  ];

  // Collectibles
  let tokens = [];

  // Input handling
  let keys = {};

  let lastJumpTime = 0;
  const jumpCooldown = 100; // Minimum 100ms between jumps

  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return; // Prevent input when game not running

    // Prevent default for game keys to avoid browser scrolling
    if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyP', 'Escape'].includes(e.code)) {
      e.preventDefault();
    }

    keys[e.code] = true;

    // Pause/unpause with P key
    if (e.code === 'KeyP') {
      gamePaused = !gamePaused;
      return;
    }

    // Exit game with ESC
    if (e.code === 'Escape') {
      if (confirm('Exit game? Your progress will be lost.')) {
        gameRunning = false;
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('start-screen').style.display = 'block';
        if (typeof gameLimitManager !== 'undefined') {
          gameLimitManager.updateGameLimitDisplay();
        }
      }
      return;
    }

    const currentTime = Date.now();
    if (!gamePaused && (e.code === 'Space' || e.code === 'ArrowUp') && frog.onGround && 
        currentTime - lastJumpTime > jumpCooldown) {
      lastJumpTime = currentTime;
      let actualJumpPower = jumpPower;

      // Apply super jump upgrade
      if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.hasUpgrade) {
        if (upgradeManager.hasUpgrade('jump')) {
          actualJumpPower *= 1.5;
        }
      }

      frog.velocity = actualJumpPower;
      frog.onGround = false;

      // Create jump particles
      for (let i = 0; i < 5; i++) {
        createParticle(
          frog.x + frog.width/2 + (Math.random() - 0.5) * 20,
          frog.y + frog.height,
          '#FFFFFF',
          'jump'
        );
      }

      screenShake = 3;
      playJumpSound();
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Mobile touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;
  let touchMoveDirection = 0; // -1 for left, 1 for right, 0 for none

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touch is in UI button areas (avoid conflicts)
    if (y < 80 && (x < 200 || x > rect.width - 200)) {
      return; // Don't process game touch in UI areas
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Jump on tap - call jump logic directly
    const currentTime = Date.now();
    if (frog.onGround && currentTime - lastJumpTime > jumpCooldown) {
      lastJumpTime = currentTime;
      let actualJumpPower = jumpPower;

      // Apply super jump upgrade
      if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.hasUpgrade) {
        if (upgradeManager.hasUpgrade('jump')) {
          actualJumpPower *= 1.5;
        }
      }

      frog.velocity = actualJumpPower;
      frog.onGround = false;

      // Create jump particles
      for (let i = 0; i < 5; i++) {
        createParticle(
          frog.x + frog.width/2 + (Math.random() - 0.5) * 20,
          frog.y + frog.height,
          '#FFFFFF',
          'jump'
        );
      }

      screenShake = 3;
      playJumpSound();
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isTouching) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Determine movement direction based on swipe
    if (Math.abs(deltaX) > 20) { // Threshold for movement
      touchMoveDirection = deltaX > 0 ? 1 : -1;
    } else {
      touchMoveDirection = 0;
    }
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
    touchMoveDirection = 0;
  });

  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isTouching = false;
    touchMoveDirection = 0;
  });

  // Mouse click handling for exit button
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    // Check if click is on exit button (top right corner)
    if (canvasX >= canvas.width - 80 && canvasX <= canvas.width - 10 && 
        canvasY >= 10 && canvasY <= 40) {
      if (confirm('Exit game? Your progress will be lost.')) {
        gameRunning = false;
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('start-screen').style.display = 'block';
        gameLimitManager.updateGameLimitDisplay();
      }
    }
  });

  // Sound effects (simple beep sounds)
  function playJumpSound() {
    soundManager.playSound(() => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    });
  }
  function playCollectSound() {
    soundManager.playSound(() => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    });
  }

  function drawFrog() {
    // Ensure frog is always visible and rendered
    if (!frog || typeof frog.x !== 'number' || typeof frog.y !== 'number') {
      console.error('Frog object is not properly initialized:', frog);
      return;
    }

    // Get equipped skin color or default to blue
    let skinColor = '#00BFFF'; // Bright blue for maximum visibility

    try {
      if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.getEquippedSkin && upgradeManager.getSkinColor) {
        const equippedSkin = upgradeManager.getEquippedSkin();
        skinColor = upgradeManager.getSkinColor(equippedSkin);
      }
    } catch (e) {
      // Use default if upgrade manager not available
      skinColor = '#00BFFF';
    }

    // Handle rainbow skin animation
    let bodyColor = skinColor;
    if (skinColor === 'rainbow') {
      const hue = (gameTime * 3) % 360;
      bodyColor = `hsl(${hue}, 100%, 65%)`;
    }

    // Save canvas state for shadow effects
    ctx.save();

    // Add glow effect around frog
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Enhanced frog body with better pixel art
    ctx.fillStyle = bodyColor;

    // Main body - larger and more defined
    ctx.fillRect(frog.x + 6, frog.y + 6, 48, 48); // Main body
    ctx.fillRect(frog.x + 2, frog.y + 14, 56, 32); // Wider middle section
    ctx.fillRect(frog.x + 10, frog.y + 2, 40, 8);  // Top section
    ctx.fillRect(frog.x + 10, frog.y + 54, 40, 6); // Bottom section

    // Add body segments for texture
    ctx.fillRect(frog.x + 4, frog.y + 10, 52, 8);  // Upper segment
    ctx.fillRect(frog.x + 4, frog.y + 42, 52, 8);  // Lower segment

    ctx.restore(); // Restore canvas state

    // Draw white belly (always white regardless of skin)
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 3;

    ctx.fillRect(frog.x + 14, frog.y + 22, 32, 28); // Main belly
    ctx.fillRect(frog.x + 18, frog.y + 18, 24, 4);  // Upper belly
    ctx.fillRect(frog.x + 18, frog.y + 50, 24, 4);  // Lower belly
    ctx.fillRect(frog.x + 22, frog.y + 26, 16, 20); // Inner belly

    ctx.shadowBlur = 0; // Reset shadow

    // Enhanced body outline for pixel definition
    let outlineColor = '#001a4d';
    if (skinColor === '#FFD700') {
      outlineColor = '#8B6914';
    } else if (skinColor === '#2F2F2F') {
      outlineColor = '#000000';
    } else if (skinColor === 'rainbow') {
      const hue = (gameTime * 3) % 360;
      outlineColor = `hsl(${hue}, 100%, 15%)`;
    }

    ctx.fillStyle = outlineColor;
    // Comprehensive outline
    ctx.fillRect(frog.x + 6, frog.y + 2, 4, 4);   // Top left corner
    ctx.fillRect(frog.x + 50, frog.y + 2, 4, 4);  // Top right corner
    ctx.fillRect(frog.x + 2, frog.y + 10, 4, 8);  // Left upper
    ctx.fillRect(frog.x + 54, frog.y + 10, 4, 8); // Right upper
    ctx.fillRect(frog.x + 2, frog.y + 38, 4, 8);  // Left lower
    ctx.fillRect(frog.x + 54, frog.y + 38, 4, 8); // Right lower
    ctx.fillRect(frog.x + 6, frog.y + 54, 4, 4);  // Bottom left corner
    ctx.fillRect(frog.x + 50, frog.y + 54, 4, 4); // Bottom right corner

    // Draw enhanced eyes with glow
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 4;

    ctx.fillRect(frog.x + 10, frog.y + 6, 14, 18);  // Left eye
    ctx.fillRect(frog.x + 36, frog.y + 6, 14, 18);  // Right eye

    ctx.shadowBlur = 0;

    // Eye outlines with better definition
    ctx.fillStyle = '#000000';
    ctx.fillRect(frog.x + 10, frog.y + 6, 14, 2);   // Top outline left eye
    ctx.fillRect(frog.x + 10, frog.y + 22, 14, 2);  // Bottom outline left eye
    ctx.fillRect(frog.x + 10, frog.y + 8, 2, 14);   // Left outline left eye
    ctx.fillRect(frog.x + 22, frog.y + 8, 2, 14);   // Right outline left eye

    ctx.fillRect(frog.x + 36, frog.y + 6, 14, 2);   // Top outline right eye
    ctx.fillRect(frog.x + 36, frog.y + 22, 14, 2);  // Bottom outline right eye
    ctx.fillRect(frog.x + 36, frog.y + 8, 2, 14);   // Left outline right eye
    ctx.fillRect(frog.x + 48, frog.y + 8, 2, 14);   // Right outline right eye

    // Draw pupils with animation
    ctx.fillStyle = '#000000';
    const pupilOffset = Math.sin(gameTime * 0.1) * 2;
    ctx.fillRect(frog.x + 14 + pupilOffset, frog.y + 12, 6, 8);  // Left pupil
    ctx.fillRect(frog.x + 40 + pupilOffset, frog.y + 12, 6, 8);  // Right pupil

    // Enhanced smile
    ctx.fillStyle = '#000000';
    ctx.fillRect(frog.x + 18, frog.y + 34, 6, 4);  // Left smile
    ctx.fillRect(frog.x + 24, frog.y + 38, 6, 4);  // Left middle
    ctx.fillRect(frog.x + 30, frog.y + 40, 6, 4);  // Center
    ctx.fillRect(frog.x + 36, frog.y + 38, 6, 4);  // Right middle
    ctx.fillRect(frog.x + 42, frog.y + 34, 6, 4);  // Right smile

    // Enhanced texture spots with animation
    let spotColor = '#0088cc';
    if (skinColor === '#FFD700') {
      spotColor = '#B8860B';
    } else if (skinColor === '#2F2F2F') {
      spotColor = '#666666';
    } else if (skinColor === 'rainbow') {
      const hue = (gameTime * 3 + 120) % 360;
      spotColor = `hsl(${hue}, 90%, 45%)`;
    }

    ctx.fillStyle = spotColor;
    ctx.shadowColor = spotColor;
    ctx.shadowBlur = 2;

    ctx.fillRect(frog.x + 10, frog.y + 26, 6, 6);  // Left spot
    ctx.fillRect(frog.x + 44, frog.y + 30, 6, 6);  // Right spot
    ctx.fillRect(frog.x + 27, frog.y + 18, 6, 6);  // Center spot
    ctx.fillRect(frog.x + 16, frog.y + 40, 4, 4);  // Small left spot
    ctx.fillRect(frog.x + 40, frog.y + 44, 4, 4);  // Small right spot

    ctx.shadowBlur = 0;

    // Add subtle breathing animation
    const breathScale = 1 + Math.sin(gameTime * 0.05) * 0.02;
    if (breathScale !== 1) {
      ctx.save();
      ctx.translate(frog.x + frog.width/2, frog.y + frog.height/2);
      ctx.scale(breathScale, breathScale);
      ctx.translate(-frog.x - frog.width/2, -frog.y - frog.height/2);
      ctx.restore();
    }
  }

  function drawLilyPads() {
    lilyPads.forEach((pad, index) => {
      // Animated floating effect
      const floatOffset = Math.sin((gameTime + index * 30) * 0.02) * 2;
      const currentY = pad.y + floatOffset;

      // Draw enhanced shadow with blur
      ctx.save();
      ctx.shadowColor = 'rgba(0, 80, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(0, 100, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(pad.x + pad.width/2 + 3, currentY + pad.height + 4, pad.width/2 + 2, pad.height/2 + 1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw lily pad base with gradient effect
      const gradient = ctx.createRadialGradient(
        pad.x + pad.width/2, currentY + pad.height/2, 0,
        pad.x + pad.width/2, currentY + pad.height/2, pad.width/2
      );
      gradient.addColorStop(0, '#32CD32');
      gradient.addColorStop(0.6, '#228B22');
      gradient.addColorStop(1, '#006400');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(pad.x + pad.width/2, currentY + pad.height/2, pad.width/2, pad.height/2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw lily pad outer ring
      ctx.strokeStyle = '#004d00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(pad.x + pad.width/2, currentY + pad.height/2, pad.width/2 - 1, pad.height/2 - 1, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Draw detailed veins/lines
      ctx.strokeStyle = '#1a5a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Main cross lines
      ctx.moveTo(pad.x + pad.width/2, currentY);
      ctx.lineTo(pad.x + pad.width/2, currentY + pad.height);
      ctx.moveTo(pad.x, currentY + pad.height/2);
      ctx.lineTo(pad.x + pad.width, currentY + pad.height/2);

      // Diagonal lines for more detail
      ctx.moveTo(pad.x + pad.width * 0.2, currentY + pad.height * 0.2);
      ctx.lineTo(pad.x + pad.width * 0.8, currentY + pad.height * 0.8);
      ctx.moveTo(pad.x + pad.width * 0.8, currentY + pad.height * 0.2);
      ctx.lineTo(pad.x + pad.width * 0.2, currentY + pad.height * 0.8);

      ctx.stroke();

      // Add small highlight spots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(pad.x + pad.width * 0.3, currentY + pad.height * 0.3, 4, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(pad.x + pad.width * 0.7, currentY + pad.height * 0.4, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Update pad position for collision detection
      pad.renderY = currentY;
    });
  }

  function spawnToken() {
    if (Math.random() < 0.02) { // 2% chance per frame for balanced token availability
      const tokenTypes = [
        { type: 'TOBY', color: '#00BFFF', points: 10 },
        { type: 'PATIENCE', color: '#FF4444', points: 25 },
        { type: 'TABOSHI', color: '#44FF44', points: 15 },
        { type: 'SatobySwap', color: '#4444FF', points: 20 }
      ];

      const tokenType = tokenTypes[Math.floor(Math.random() * tokenTypes.length)];
      const validPad = lilyPads[Math.floor(Math.random() * lilyPads.length)];

      tokens.push({
        x: validPad.x + validPad.width/2 - 15,
        y: validPad.y - 30,
        width: 30,
        height: 30,
        ...tokenType
      });
    }
  }

  function drawTokens() {
    tokens.forEach((token, index) => {
      // Animated floating and pulsing effects
      const floatOffset = Math.sin((gameTime + index * 20) * 0.08) * 3;
      const pulseScale = 1 + Math.sin((gameTime + index * 15) * 0.1) * 0.15;
      const rotationOffset = (gameTime + index * 10) * 0.02;

      const currentX = token.x;
      const currentY = token.y + floatOffset;

      ctx.save();
      ctx.translate(currentX + 15, currentY + 15);
      ctx.scale(pulseScale, pulseScale);
      ctx.rotate(rotationOffset);

      // Enhanced glow effect
      ctx.shadowColor = token.color;
      ctx.shadowBlur = 15 + Math.sin(gameTime * 0.05) * 5;

      // Create gradient for each token type
      let gradient;

      if (token.type === 'TOBY') {
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, token.color);
        gradient.addColorStop(1, '#003366');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Add inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-5, -5, 6, 0, Math.PI * 2);
        ctx.fill();

      } else if (token.type === 'PATIENCE') {
        gradient = ctx.createLinearGradient(0, -15, 0, 15);
        gradient.addColorStop(0, '#FF6666');
        gradient.addColorStop(0.5, token.color);
        gradient.addColorStop(1, '#CC0000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-15, 15);
        ctx.lineTo(15, 15);
        ctx.closePath();
        ctx.fill();

        // Add inner glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 8);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();

      } else if (token.type === 'TABOSHI') {
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(0.6, token.color);
        gradient.addColorStop(1, '#006600');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 8, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();

        // Add leaf details
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.stroke();

        // Add shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-4, -3, 4, 2, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();

      } else if (token.type === 'SatobySwap') {
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        gradient.addColorStop(0, '#6666FF');
        gradient.addColorStop(0.5, token.color);
        gradient.addColorStop(1, '#000066');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Add swirl pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.arc(0, 0, 3, Math.PI, 0);
        ctx.stroke();

        // Add center dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Add collection sparkles around valuable tokens
      if (token.points >= 20 && Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const sparkleX = currentX + Math.random() * 30;
        const sparkleY = currentY + Math.random() * 30;
        ctx.fillRect(sparkleX, sparkleY, 2, 2);
      }
    });
  }

  let frameCount = 0;
  let particles = [];
  let screenShake = 0;

  // Particle system
  function createParticle(x, y, color, type = 'collect') {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 30,
      maxLife: 30,
      color: color,
      size: 3 + Math.random() * 3,
      type: type
    });
  }

  function updateParticles() {
    // Optimize particle updates with early exit if no particles
    if (particles.length === 0) return;

    // Process particles in reverse to avoid index issues when removing
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life--;
      particle.vx *= 0.98; // air resistance

      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Limit particle count for performance
    if (particles.length > 30) {
      particles.splice(0, particles.length - 30);
    }
  }

  function drawParticles() {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;

      if (particle.type === 'collect') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'jump') {
        ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
      }

      ctx.restore();
    });
  }

  function drawBackground() {
    // Enhanced sky gradient with multiple stops
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.3, '#ADD8E6');
    skyGradient.addColorStop(0.7, '#4682B4');
    skyGradient.addColorStop(1, '#2F4F4F');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw water surface with animated ripples
    const waterLevel = canvas.height * 0.8;
    const waterGradient = ctx.createLinearGradient(0, waterLevel, 0, canvas.height);
    waterGradient.addColorStop(0, 'rgba(0, 100, 150, 0.6)');
    waterGradient.addColorStop(0.5, 'rgba(0, 80, 120, 0.4)');
    waterGradient.addColorStop(1, 'rgba(0, 60, 100, 0.8)');

    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);

    // Animated water ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const rippleOffset = (frameCount * 0.8 + i * 60) % (canvas.width + 120);
      const rippleY = waterLevel + 20 + Math.sin(frameCount * 0.02 + i) * 10;

      ctx.beginPath();
      ctx.moveTo(rippleOffset - 60, rippleY);
      for (let x = rippleOffset - 60; x < rippleOffset + 60; x += 5) {
        const waveY = rippleY + Math.sin((x - rippleOffset) * 0.1 + frameCount * 0.05) * 3;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // Enhanced animated clouds with shadows
    const cloudOffset1 = (frameCount * 0.3) % (canvas.width + 200);
    const cloudOffset2 = (frameCount * 0.4) % (canvas.width + 250);
    const cloudOffset3 = (frameCount * 0.2) % (canvas.width + 180);

    // Cloud shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(cloudOffset1 - 50 + 3, 83, 20, 0, Math.PI * 2);
    ctx.arc(cloudOffset1 - 30 + 3, 83, 30, 0, Math.PI * 2);
    ctx.arc(cloudOffset1 - 10 + 3, 83, 20, 0, Math.PI * 2);
    ctx.fill();

    // Main clouds with better shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 5;

    // Cloud 1
    ctx.beginPath();
    ctx.arc(cloudOffset1 - 50, 80, 20, 0, Math.PI * 2);
    ctx.arc(cloudOffset1 - 30, 80, 30, 0, Math.PI * 2);
    ctx.arc(cloudOffset1 - 10, 80, 20, 0, Math.PI * 2);
    ctx.arc(cloudOffset1 + 10, 85, 15, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 2
    ctx.beginPath();
    ctx.arc(cloudOffset2 - 200, 150, 25, 0, Math.PI * 2);
    ctx.arc(cloudOffset2 - 175, 150, 35, 0, Math.PI * 2);
    ctx.arc(cloudOffset2 - 150, 150, 25, 0, Math.PI * 2);
    ctx.arc(cloudOffset2 - 125, 155, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 3 (smaller)
    ctx.beginPath();
    ctx.arc(cloudOffset3 - 100, 120, 18, 0, Math.PI * 2);
    ctx.arc(cloudOffset3 - 85, 120, 22, 0, Math.PI * 2);
    ctx.arc(cloudOffset3 - 68, 120, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0; // Reset shadow

    // Add distant mountains for depth
    ctx.fillStyle = 'rgba(100, 150, 100, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.4);
    ctx.lineTo(80, canvas.height * 0.35);
    ctx.lineTo(150, canvas.height * 0.38);
    ctx.lineTo(220, canvas.height * 0.32);
    ctx.lineTo(300, canvas.height * 0.36);
    ctx.lineTo(canvas.width, canvas.height * 0.34);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Add flying insects/particles for atmosphere
    if (Math.random() < 0.1) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
      const insectX = Math.random() * canvas.width;
      const insectY = 50 + Math.random() * 200;
      ctx.fillRect(insectX, insectY, 2, 1);
      ctx.fillRect(insectX + 3, insectY, 2, 1);
    }
  }

  function drawUI() {
    // Enhanced score display with animated background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 160, 35);
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 160, 35);

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#4fc3f7';
    ctx.shadowBlur = 8;
    ctx.font = 'bold 22px Courier New';
    ctx.fillText(`Score: ${score}`, 12, 28);
    ctx.shadowBlur = 0;

    // Enhanced countdown timer with pulsing effect and background
    const timeLeft = Math.max(0, Math.ceil((maxGameTime - gameTime) / 60));
    let timerColor, shadowIntensity;

    if (timeLeft <= 5) {
      timerColor = '#FF0000';
      shadowIntensity = 12 + Math.sin(gameTime * 0.2) * 4;
    } else if (timeLeft <= 10) {
      timerColor = '#FF8800';
      shadowIntensity = 6;
    } else {
      timerColor = '#FFD700';
      shadowIntensity = 4;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 45, 140, 35);
    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 45, 140, 35);

    ctx.fillStyle = timerColor;
    ctx.shadowColor = timerColor;
    ctx.shadowBlur = shadowIntensity;
    ctx.font = 'bold 22px Courier New';
    ctx.fillText(`Time: ${timeLeft}s`, 12, 68);
    ctx.shadowBlur = 0;

    // Tokens collected indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 85, 180, 25);
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 85, 180, 25);

    ctx.fillStyle = '#00BFFF';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(`Tokens: ${tokensCollected}`, 10, 102);
    // Enhanced exit button with hover effect
    const exitBtnX = canvas.width - 85;
    const exitBtnY = 10;
    const exitBtnWidth = 75;
    const exitBtnHeight = 35;

    // Button gradient
    const exitGradient = ctx.createLinearGradient(exitBtnX, exitBtnY, exitBtnX, exitBtnY + exitBtnHeight);
    exitGradient.addColorStop(0, '#FF6347');
    exitGradient.addColorStop(1, '#FF4500');

    ctx.fillStyle = exitGradient;
    ctx.fillRect(exitBtnX, exitBtnY, exitBtnWidth, exitBtnHeight);

    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.strokeRect(exitBtnX, exitBtnY, exitBtnWidth, exitBtnHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
ctx.fillText('EXIT', exitBtnX + exitBtnWidth/2, exitBtnY + 22);
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;

    // Enhanced combo system with visual feedback
    const comboBoxWidth = 140;
    const comboBoxHeight = 35;
    const comboX = canvas.width - comboBoxWidth - 5;
    const comboY = 55;

    // Dynamic combo box color based on combo level
    let comboColor = '#FFFFFF';
    let comboGlow = 0;
    if (combo >= 10) {
      comboColor = '#FFD700';
      comboGlow = 12;
    } else if (combo >= 5) {
      comboColor = '#FF8800';
      comboGlow = 8;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(comboX, comboY, comboBoxWidth, comboBoxHeight);

    if (comboGlow > 0) {
      ctx.shadowColor = comboColor;
      ctx.shadowBlur = comboGlow;
    }

    ctx.strokeStyle = comboColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(comboX, comboY, comboBoxWidth, comboBoxHeight);

    ctx.fillStyle = comboColor;
    ctx.font = 'bold 14px Courier New';
    ctx.fillText(`Combo: ${combo}`, comboX + 8, comboY + 22);

    // Show combo bonus if active
    if (combo >= 5) {
      ctx.font = '10px Courier New';
      const bonusText = combo >= 10 ? '+50% bonus!' : '+20% bonus!';
      ctx.fillText(bonusText, comboX + 8, comboY + 15);
    }

    ctx.shadowBlur = 0;

    // Pause indicator with enhanced visuals and animation
    if (gamePaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pulsing pause effect
      const pulseIntensity = 10 + Math.sin(gameTime * 0.1) * 5;

      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = pulseIntensity;
      ctx.font = 'bold 40px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('⏸️ PAUSED', canvas.width/2, canvas.height/2 - 30);

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 20px Courier New';
      ctx.fillText('Press P to continue', canvas.width/2, canvas.height/2 + 10);
      ctx.fillText('Press ESC to exit', canvas.width/2, canvas.height/2 + 40);
      ctx.textAlign = 'left';
      ctx.shadowBlur = 0;
    }

    // Enhanced instructions with better styling
    const instructionsHeight = 60;
    const instructionsY = canvas.height - instructionsHeight;

    // Instructions background with gradient
    const instructionsGradient = ctx.createLinearGradient(0, instructionsY, 0, canvas.height);
    instructionsGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    instructionsGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

    ctx.fillStyle = instructionsGradient;
    ctx.fillRect(0, instructionsY, canvas.width, instructionsHeight);

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, instructionsY, canvas.width, instructionsHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Courier New';
    ctx.fillText('📱 Mobile: Tap to jump, swipe left/right to move', 8, instructionsY + 15);
    ctx.fillText('⌨️  Desktop: Space/↑ to jump, ←/→ or A/D to move, P to pause', 8, instructionsY + 30);
    ctx.fillText('🚪 ESC to exit game | Click EXIT button to quit', 8, instructionsY + 45);

    // Add subtle border glow effect
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  }

  function checkCollisions() {
    // Check frog collision with lily pads
    frog.onGround = false;

    lilyPads.forEach(pad => {
      // Use renderY if available (for animated pads), otherwise use regular y
      const padY = pad.renderY !== undefined ? pad.renderY : pad.y;

      // More precise collision detection with margin
      const margin = 2;
      const frogBottom = frog.y + frog.height;
      const frogRight = frog.x + frog.width;
      const frogLeft = frog.x;
      const frogTop = frog.y;
      const padBottom = padY + pad.height;
      const padRight = pad.x + pad.width;
      const padLeft = pad.x;
      const padTop = padY;

      // Check if frog is overlapping with pad
      if (frogLeft < padRight - margin &&
          frogRight > padLeft + margin &&
          frogTop < padBottom &&
          frogBottom > padTop) {

        // Only land on pad if falling onto it from above
        if (frog.velocity > 0 && frogTop < padTop && frogBottom > padTop + margin) {
          frog.y = padTop - frog.height;
          frog.velocity = 0;
          frog.onGround = true;
        }
      }
    });

    // Check token collection
    tokens = tokens.filter(token => {
      if (frog.x < token.x + token.width &&
          frog.x + frog.width > token.x &&
          frog.y < token.y + token.height &&
          frog.y + frog.height > token.y) {

        let points = token.points;

        // Apply score multiplier upgrade
        if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.hasUpgrade) {
          if (upgradeManager.hasUpgrade('multiplier')) {
            points = Math.floor(points * 1.5);
          }
        }

        score += points;
        tokensCollected++;
        tokenTypesCollected.add(token.type);
        combo++;
        maxCombo = Math.max(maxCombo, combo);

        // Create particle effects for collection
        for (let i = 0; i < 8; i++) {
          createParticle(
            token.x + token.width/2,
            token.y + token.height/2,
            token.color,
            'collect'
          );
        }

        // Award TOBY tokens for collection (reduced rewards)
        const tobyReward = Math.floor(points / 13);
        if (tobyReward > 0 && typeof web3Manager !== 'undefined') {
          web3Manager.awardTokens(tobyReward, 'Token collection');
        }

        // Add screen shake for feedback
        screenShake = 5;

        playCollectSound();
        return false; // Remove token
      }
      return true; // Keep token
    });

    // Check if frog fell off screen or time is up
    if (frog.y > canvas.height || gameTime >= maxGameTime) {
      gameOver();
    }
  }

  function gameOver() {
    gameRunning = false;

    // Increment games played count
    gameLimitManager.incrementGamesPlayed();

    // Update player data
    if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.updateTotalScore) {
      upgradeManager.updateTotalScore(score);
    }

    // Update subscriber activity if connected
    if (typeof web3Manager !== 'undefined' && web3Manager.userAddress) {
      web3Manager.updateSubscriberActivity(web3Manager.userAddress, gameTime);
    }

    // Award survival bonus (reduced)
    const survivalBonus = Math.floor(gameTime / 780); // 1 TOBY per 13 seconds
    if (survivalBonus > 0 && typeof web3Manager !== 'undefined') {
      web3Manager.awardTokens(survivalBonus, 'Survival bonus');
    }

    // Update challenge progress if in challenge mode
    if (isChallengeMode && typeof challengeManager !== 'undefined') {
      challengeManager.updateChallengeProgress({
        score: score,
        gameTime: gameTime,
        tokensCollected: tokensCollected,
        tokenTypes: Array.from(tokenTypesCollected),
        combo: maxCombo
      });
    }

    // Clear challenge mode
    sessionStorage.removeItem('challengeMode');

    // Hide canvas and show game over screen
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';

    // Update score displays
    document.getElementById('final-score').textContent = `Final Score: ${score}`;
    document.getElementById('final-time').textContent = `Time Survived: ${Math.floor(gameTime/60)}s`;

    // Setup save score functionality
    const saveScoreBtn = document.getElementById('save-score-btn');
    const playerNameInput = document.getElementById('player-name');
    const shareBtn = document.getElementById('share-farcaster-btn');
    const restartBtn = document.getElementById('restart-btn');

    saveScoreBtn.onclick = function() {
      const playerName = playerNameInput.value.trim();
      saveScore(playerName, score, gameTime);

      // Provide feedback
      saveScoreBtn.textContent = '✅ Saved!';
      saveScoreBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
      setTimeout(() => {
        saveScoreBtn.textContent = 'Save Score';
        saveScoreBtn.style.background = '';
      }, 2000);
    };

    shareBtn.onclick = function() {
      shareToFarcaster(score, gameTime);
    };

    restartBtn.onclick = function() {
      document.getElementById('game-over-screen').style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
      // Update game limit display
      gameLimitManager.updateGameLimitDisplay();
    };

    const backToMainBtn = document.getElementById('back-to-main-btn');
    backToMainBtn.onclick = function() {
      document.getElementById('game-over-screen').style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
      // Update game limit display
      gameLimitManager.updateGameLimitDisplay();
    };

	// Enhanced game over call
	enhancedGameOver(score, gameTime, tokensCollected, maxCombo);
  }

  function updateGame() {
    if (!gameRunning) return;

    // Apply screen shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      screenShake *= 0.8;
      if (screenShake < 0.5) screenShake = 0;
    }

    drawBackground();
    drawLilyPads();

    if (gamePaused) {
      drawTokens();
      drawFrog();
      drawParticles();
      drawUI();
      if (screenShake > 0) ctx.restore();
      requestAnimationFrame(updateGame);
      return;
    }

    frameCount++;
    gameTime++;
    updateParticles();

    // Update frog physics - keyboard and touch controls
    let moveSpeed = 3;

    // Apply speed boost upgrade
    if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.hasUpgrade) {
      if (upgradeManager.hasUpgrade('speed')) {
        moveSpeed *= 1.3;
      }
    }

    if (keys['ArrowLeft'] || keys['KeyA'] || touchMoveDirection === -1) {
      frog.x -= moveSpeed;
    }
    if (keys['ArrowRight'] || keys['KeyD'] || touchMoveDirection === 1) {
      frog.x += moveSpeed;
    }

    // Token magnet effect
    if (typeof upgradeManager !== 'undefined' && upgradeManager && upgradeManager.hasUpgrade) {
      if (upgradeManager.hasUpgrade('magnet')) {
        tokens.forEach(token => {
          const dx = (frog.x + frog.width/2) - (token.x + token.width/2);
          const dy = (frog.y + frog.height/2) - (token.y + token.height/2);
          const distance = Math.sqrt(dx*dx + dy*dy);

          if (distance < 80) { // Magnet range
            const magnetForce = 2;
            token.x += (dx / distance) * magnetForce;
            token.y += (dy / distance) * magnetForce;
          }
        });
      }
    }

    frog.velocity += gravity;
    frog.y += frog.velocity;

    // Keep frog in bounds horizontally
    if (frog.x < 0) frog.x = 0;
    if (frog.x > canvas.width - frog.width) frog.x = canvas.width - frog.width;

    checkCollisions();
    spawnToken();
    drawTokens();
    drawFrog();
    drawParticles();
    drawUI();

    if (screenShake > 0) ctx.restore();
    requestAnimationFrame(updateGame);
  }

  updateGame();
}
class ToadJumpers {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu';
    this.lastTime = 0;
    this.gameSpeed = 1;
    this.score = 0;
    this.startTime = 0;
    this.gameTime = 0;
    this.gameTimeLimit = 30;
    this.soundEnabled = true;
    this.backgroundMusic = null;
    this.paused = false;
    this.keys = {}; // Initialize keys object
    this.frog = {
      x: 180,
      y: 400,
      width: 60,
      height: 60,
      velocity: 0,
      dx: 0,
      dy: 0,
      onGround: false,
      jump: function() {
        if (this.onGround) {
          this.velocity = -18;
          this.onGround = false;
        }
      }
    };
    this.lilyPads = [
      { x: 50, y: 500, width: 100, height: 20, dx: 0, dy: 0 },
      { x: 200, y: 450, width: 100, height: 20, dx: 0, dy: 0 },
      { x: 80, y: 350, width: 100, height: 20, dx: 0, dy: 0 }
    ];
    this.tokens = [];
    this.initAudio();
}

  initAudio() {
    // Create AudioContext for web audio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createBackgroundMusic();
    } catch (error) {
      console.log('Web Audio API not supported:', error);
      this.soundEnabled = false;
    }
  }

  createBackgroundMusic() {
    if (!this.audioContext || !this.soundEnabled) return;

    // Create a simple synthesized background melody
    this.backgroundMusicGain = this.audioContext.createGain();
    this.backgroundMusicGain.connect(this.audioContext.destination);
    this.backgroundMusicGain.gain.value = 0.1; // Low volume for background
  }

  playBackgroundMusic() {
    if (!this.audioContext || !this.soundEnabled || this.backgroundMusic) return;

    // Simple melody using oscillators
    const playNote = (frequency, duration, startTime) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.backgroundMusicGain);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.05, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play a simple repeating melody
    const startMelody = () => {
      if (!this.soundEnabled || this.gameState === 'menu') return;

      const currentTime = this.audioContext.currentTime;
      const notes = [523.25, 587.33, 659.25, 698.46, 523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5 pattern

      notes.forEach((freq, index) => {
        playNote(freq, 0.3, currentTime + (index * 0.4));
      });

      // Schedule next melody
      setTimeout(startMelody, 3200);
    };

    if (this.gameState === 'playing') {
      startMelody();
      this.backgroundMusic = true;
    }
  }

  stopBackgroundMusic() {
    this.backgroundMusic = false;
  }

  playSound(frequency = 440, duration = 0.1) {
    if (!this.audioContext || !this.soundEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restartGame();
    });

    document.getElementById('sound-toggle-btn').addEventListener('click', function() {
      soundManager.toggleSound();
    });

    document.addEventListener('keydown', (e) => {
    if (this.gameState !== 'playing') return;

    if (e.code === 'KeyP') {
      this.togglePause();
    }

    if (e.code === 'Escape') {
      this.showGameOverScreen();
    }

    if (e.code === 'Space' || e.code === 'ArrowUp') {
      this.frog.jump();
      this.playSound(330, 0.1); // Jump sound
    }
  });
  }

  startGame() {
    if (this.gameState !== 'menu') return;

    // Initialize audio context if needed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Initialize game state
    this.gameState = 'playing';
    this.score = 0;
    this.startTime = Date.now();
    this.gameTime = 0;

    // Start background music
    this.playBackgroundMusic();
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  update(time) {
    if (this.gameState !== 'playing' || this.paused) return;

    this.gameTime = (Date.now() - this.startTime) / 1000;

    // Check game over condition
    if (this.gameTime > this.gameTimeLimit) {
      this.gameOver();
      return;
    }

    // Check win condition (example)
    if (this.score >= 100) {
      this.winGame();
      return;
    }

    this.updateLilyPads();
    this.updateFrog();
    this.updateTokens();
  }

  updateFrog() {
    this.frog.x += this.frog.dx;
    this.frog.y += this.frog.dy;

    // Check boundaries
    if (this.frog.x < 0) this.frog.x = 0;
    if (this.frog.x > this.canvas.width - this.frog.width) {
      this.frog.x = this.canvas.width - this.frog.width;
    }
    if (this.frog.y < 0) this.frog.y = 0;
    if (this.frog.y > this.canvas.height - this.frog.height) {
      this.gameOver();
    }

    // Check collisions with lily pads
    let onLilyPad = false;
    for (let i = 0; i < this.lilyPads.length; i++) {
      const pad = this.lilyPads[i];
      if (this.frog.x > pad.x && this.frog.x < pad.x + pad.width &&
        this.frog.y + this.frog.height > pad.y && this.frog.y < pad.y + pad.height) {
        onLilyPad = true;
        break;
      }
    }

    if (!onLilyPad) {
      this.gameOver();
    }
  }

  updateLilyPads() {
    for (let i = 0; i < this.lilyPads.length; i++) {
      const pad = this.lilyPads[i];
      pad.x += pad.dx * this.gameSpeed;
      pad.y += pad.dy * this.gameSpeed;

      // Example boundary checks
      if (pad.x < 0 || pad.x > this.canvas.width - pad.width) pad.dx *= -1;
      if (pad.y < 0 || pad.y > this.canvas.height - pad.height) pad.dy *= -1;
    }
  }

  updateTokens() {
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      token.x += token.dx;
      token.y += token.dy;

      // Boundary check
      if (token.x < 0 || token.x > this.canvas.width - token.width) token.dx *= -1;
      if (token.y < 0 || token.y > this.canvas.height - token.height) token.dy *= -1;

      // Collect token
      if (this.frog.x < token.x + token.width &&
        this.frog.x + this.frog.width > token.x &&
        this.frog.y < token.y + token.height &&
        this.frog.y + this.frog.height > token.y) {
        // Collect token
        this.collectToken(i);
        this.playSound(523, 0.15); // Collection sound (C5)
        collected = true;
      }
    }

    // Remove collected tokens
    this.tokens = this.tokens.filter(token => !token.collected);
  }

  collectToken(index) {
    const token = this.tokens[index];
    this.score += token.points;
    token.collected = true;
  }

  gameOver() {
    this.gameState = 'gameOver';
    this.stopBackgroundMusic();
    this.playSound(220, 0.5); // Game over sound (A3)

    // Show game over screen
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';

    // Update final score display
    document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
    document.getElementById('final-time').textContent = `Time Survived: ${Math.floor(this.gameTime)}s`;

    // Update subscriber activity
    if (typeof web3Manager !== 'undefined' && web3Manager.isConnected && web3Manager.userAddress) {
      web3Manager.updateSubscriberActivity(web3Manager.userAddress, this.gameTime);
    }
  }

  winGame() {
    this.gameState = 'win';
  }

  restartGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.startTime = Date.now();
    this.frog.x = this.canvas.width / 2 - this.frog.width / 2;
    this.frog.y = this.canvas.height - this.frog.height - 20;
    this.tokens = [];
    this.lilyPads = [];
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw lily pads
    for (let i = 0; i < this.lilyPads.length; i++) {
      const pad = this.lilyPads[i];
      this.ctx.fillStyle = 'green';
      this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
    }

    // Draw tokens
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect(token.x, token.y, token.width, token.height);
    }

    // Draw frog
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(this.frog.x, this.frog.y, this.frog.width, this.frog.height);

    // Draw score
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 30);

    // Game timer
    this.ctx.fillText(`Time: ${this.gameTimeLimit - Math.floor(this.gameTime)}`, 10, 60);
  }

  loop(time) {
    if (this.lastTime) {
      this.update(time - this.lastTime);
    }
    this.lastTime = time;
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

// Game reset functionality
function resetGameData() {
  // Clear all localStorage data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('toadjumpers_') || key.startsWith('toby_') || key.includes('game_limit_') || key.includes('connected_wallet')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Reset web3 manager
  if (typeof web3Manager !== 'undefined') {
    web3Manager.tokenBalance = 0;
    web3Manager.userAddress = null;
    web3Manager.isConnected = false;
    web3Manager.updateTokenDisplay();
    web3Manager.updateWalletDisplay();
  }

  // Reset game limit manager
  if (typeof gameLimitManager !== 'undefined') {
    gameLimitManager.updateGameLimitDisplay();
  }

  console.log('Game data reset successfully!');
  alert('Game data has been reset! Refresh the page to see changes.');
}

// Make reset function globally available
if (typeof window !== 'undefined') {
  window.resetGameData = resetGameData;
}