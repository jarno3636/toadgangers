` tags, maintaining the original structure and indentation.

```javascript
<replit_final_file>
// Daily challenges and replay value system
class ChallengeManager {
  constructor() {
    this.challenges = this.getDailyChallenges();
    this.completedChallenges = JSON.parse(localStorage.getItem('completed_challenges') || '[]');
    this.currentChallenge = null;
    this.setupChallengeSystem();
  }

  getDailyChallenges() {
    const today = new Date().toDateString();
    const challengeKey = `challenge_${today}`;

    // Generate deterministic daily challenge based on date
    const seedDate = new Date(today).getTime();
    const challengeTypes = [
      {
        id: 'score_challenge',
        title: 'Score Master',
        description: 'Score 1000 points in a single game',
        target: 1000,
        reward: 50,
        type: 'score'
      },
      {
        id: 'survival_challenge',
        title: 'Survival Expert',
        description: 'Survive for 2 minutes',
        target: 120,
        reward: 40,
        type: 'time'
      },
      {
        id: 'token_challenge',
        title: 'Token Collector',
        description: 'Collect 30 tokens in one game',
        target: 30,
        reward: 35,
        type: 'tokens'
      },
      {
        id: 'combo_challenge',
        title: 'Combo King',
        description: 'Achieve a 15x combo',
        target: 15,
        reward: 45,
        type: 'combo'
      }
    ];

    // Select challenge based on day
    const challengeIndex = Math.floor(seedDate / (1000 * 60 * 60 * 24)) % challengeTypes.length;
    return challengeTypes[challengeIndex];
  }

  setupChallengeSystem() {
    this.updateChallengeDisplay();
    this.bindChallengeEvents();
  }

  updateChallengeDisplay() {
    const challenge = this.challenges;
    const challengeDescElement = document.getElementById('challenge-description');
    const challengeRewardElement = document.getElementById('challenge-reward');

    if (challengeDescElement) {
      challengeDescElement.textContent = challenge.description;
    }

    if (challengeRewardElement) {
      challengeRewardElement.textContent = `Reward: ${challenge.reward} TOBY tokens`;
    }
  }

  bindChallengeEvents() {
    const challengeBtn = document.getElementById('daily-challenge-btn');
    if (challengeBtn) {
      challengeBtn.addEventListener('click', () => {
        this.startDailyChallenge();
      });
    }
  }

  startDailyChallenge() {
    sessionStorage.setItem('challengeMode', 'true');
    sessionStorage.setItem('currentChallenge', JSON.stringify(this.challenges));

    // Start game
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    startGame();
  }

  updateChallengeProgress(gameData) {
    if (!sessionStorage.getItem('challengeMode')) return;

    const challenge = JSON.parse(sessionStorage.getItem('currentChallenge') || '{}');
    let progress = 0;
    let completed = false;

    switch (challenge.type) {
      case 'score':
        progress = gameData.score;
        completed = gameData.score >= challenge.target;
        break;
      case 'time':
        progress = Math.floor(gameData.timeAlive / 60);
        completed = Math.floor(gameData.timeAlive / 60) >= challenge.target;
        break;
      case 'tokens':
        progress = gameData.tokensCollected;
        completed = gameData.tokensCollected >= challenge.target;
        break;
      case 'combo':
        progress = gameData.combo;
        completed = gameData.combo >= challenge.target;
        break;
    }

    if (completed && !this.completedChallenges.includes(challenge.id)) {
      this.completeChallenge();
    }
  }

  completeChallenge() {
    const challenge = JSON.parse(sessionStorage.getItem('currentChallenge') || '{}');
    this.completedChallenges.push(challenge.id);
    localStorage.setItem('completed_challenges', JSON.stringify(this.completedChallenges));

    if (typeof web3Manager !== 'undefined') {
      web3Manager.awardTokens(challenge.reward, `Challenge Completed: ${challenge.title}`);
    }

    this.showChallengeCompletion(challenge);
  }

  showChallengeCompletion(challenge) {
    const notification = document.createElement('div');
    notification.className = 'challenge-completion';
    notification.innerHTML = `
      <div class="challenge-completion-content">
        <h3>Challenge Complete!</h3>
        <p>${challenge.description}</p>
        <div class="challenge-reward">+${challenge.reward} TOBY</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }
}

// Initialize challenge manager
const challengeManager = new ChallengeManager();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
  if (dailyChallengeBtn) {
    dailyChallengeBtn.addEventListener('click', function() {
      challengeManager.startDailyChallenge();
    });
  }

  // Initialize daily challenge display
  challengeManager.updateChallengeDisplay();
});