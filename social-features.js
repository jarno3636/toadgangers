` tags. I will ensure that all original code is included, indentation is preserved, and no forbidden words are used.

```javascript
<replit_final_file>
// Social features and community integration
class SocialFeatures {
  constructor() {
    this.userActivity = JSON.parse(localStorage.getItem('user_activity') || '{}');
    this.socialNotifications = [];
    this.socialActions = this.initializeSocialActions();
    this.userStats = this.loadUserStats();
    this.achievements = this.initializeAchievements();
    this.initializeSocialFeatures();
  }

  initializeAchievements() {
    return {
      scorer100: { name: 'First Steps', description: 'Score 100 points', reward: 25 },
      scorer500: { name: 'Getting Good', description: 'Score 500 points', reward: 50 },
      scorer1000: { name: 'Toad Master', description: 'Score 1000 points', reward: 100 },
      scorer2000: { name: 'Legendary Frog', description: 'Score 2000 points', reward: 200 },
      survivor60: { name: 'Survivor', description: 'Survive 60 seconds', reward: 50 },
      survivor120: { name: 'Endurance King', description: 'Survive 120 seconds', reward: 100 },
      collector20: { name: 'Token Hunter', description: 'Collect 20 tokens', reward: 40 },
      collector50: { name: 'Token Master', description: 'Collect 50 tokens', reward: 80 },
      combo10: { name: 'Combo Master', description: 'Achieve 10x combo', reward: 60 },
      firstShare: { name: 'Social Butterfly', description: 'Share your first score', reward: 30 },
      inviteFriend: { name: 'Pond Recruiter', description: 'Invite a friend', reward: 100 },
      followToadgod: { name: 'Faithful Follower', description: 'Follow Toadgod updates', reward: 200 }
    };
  }

  initializeSocialActions() {
    return {
      share: { points: 50, cooldown: 300000 }, // 5 minute cooldown
      challenge: { points: 25, cooldown: 600000 }, // 10 minute cooldown  
      follow: { points: 100, cooldown: 86400000 }, // 24 hour cooldown
      subscribe: { points: 200, cooldown: 86400000 } // 24 hour cooldown
    };
  }

  loadUserStats() {
    const saved = localStorage.getItem('social_stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      sharesCount: 0,
      invitesCount: 0,
      challengesSent: 0,
      lastActions: {},
      socialScore: 0
    };
  }

  saveUserStats() {
    localStorage.setItem('social_stats', JSON.stringify(this.userStats));
  }

  checkAchievements(gameData) {
    const newAchievements = [];
    const completedAchievements = JSON.parse(localStorage.getItem('completed_achievements') || '[]');

    // Score-based achievements
    if (gameData.score >= 100 && !completedAchievements.includes('scorer100')) {
      newAchievements.push(this.achievements.scorer100);
      completedAchievements.push('scorer100');
    }
    if (gameData.score >= 500 && !completedAchievements.includes('scorer500')) {
      newAchievements.push(this.achievements.scorer500);
      completedAchievements.push('scorer500');
    }
    if (gameData.score >= 1000 && !completedAchievements.includes('scorer1000')) {
      newAchievements.push(this.achievements.scorer1000);
      completedAchievements.push('scorer1000');
    }
    if (gameData.score >= 2000 && !completedAchievements.includes('scorer2000')) {
      newAchievements.push(this.achievements.scorer2000);
      completedAchievements.push('scorer2000');
    }

    // Time-based achievements
    if (gameData.timeAlive >= 60 && !completedAchievements.includes('survivor60')) {
      newAchievements.push(this.achievements.survivor60);
      completedAchievements.push('survivor60');
    }
    if (gameData.timeAlive >= 120 && !completedAchievements.includes('survivor120')) {
      newAchievements.push(this.achievements.survivor120);
      completedAchievements.push('survivor120');
    }

    // Collection achievements
    if (gameData.tokensCollected >= 20 && !completedAchievements.includes('collector20')) {
      newAchievements.push(this.achievements.collector20);
      completedAchievements.push('collector20');
    }
    if (gameData.tokensCollected >= 50 && !completedAchievements.includes('collector50')) {
      newAchievements.push(this.achievements.collector50);
      completedAchievements.push('collector50');
    }

    // Combo achievements
    if (gameData.combo >= 10 && !completedAchievements.includes('combo10')) {
      newAchievements.push(this.achievements.combo10);
      completedAchievements.push('combo10');
    }

    // Save updated achievements
    localStorage.setItem('completed_achievements', JSON.stringify(completedAchievements));

    // Award achievement rewards
    newAchievements.forEach(achievement => {
      if (typeof web3Manager !== 'undefined') {
        web3Manager.awardTokens(achievement.reward, `Achievement: ${achievement.name}`);
      }
    });

    return newAchievements;
  }

  getAchievements() {
    return this.achievements;
  }

  canPerformAction(actionType) {
    const action = this.socialActions[actionType];
    if (!action) return false;

    const lastAction = this.userStats.lastActions[actionType];
    if (!lastAction) return true;

    return Date.now() - lastAction >= action.cooldown;
  }

  performSocialAction(actionType, callback) {
    if (!this.canPerformAction(actionType)) {
      const action = this.socialActions[actionType];
      const timeLeft = action.cooldown - (Date.now() - this.userStats.lastActions[actionType]);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      alert(`Please wait ${minutesLeft} minutes before performing this action again.`);
      return false;
    }

    // Record action
    this.userStats.lastActions[actionType] = Date.now();
    this.userStats.socialScore += this.socialActions[actionType].points;

    // Track specific actions
    if (actionType === 'share') {
      this.userStats.sharesCount++;
    } else if (actionType === 'challenge') {
      this.userStats.challengesSent++;
    }

    this.saveUserStats();

    // Execute callback
    if (callback) callback();

    // Award tokens for social action
    if (typeof web3Manager !== 'undefined') {
      web3Manager.awardTokens(this.socialActions[actionType].points, `Social action: ${actionType}`);
    }

    return true;
  }

  incrementShares() {
    this.performSocialAction('share');
  }

  incrementInvites() {
    this.userStats.invitesCount++;
    this.userStats.socialScore += 100;
    this.saveUserStats();

    // Check for invite achievement
    const completedAchievements = JSON.parse(localStorage.getItem('completed_achievements') || '[]');
    if (!completedAchievements.includes('inviteFriend')) {
      completedAchievements.push('inviteFriend');
      localStorage.setItem('completed_achievements', JSON.stringify(completedAchievements));
      
      if (typeof web3Manager !== 'undefined') {
        web3Manager.awardTokens(this.achievements.inviteFriend.reward, `Achievement: ${this.achievements.inviteFriend.name}`);
      }
    }
  }

  getSocialStats() {
    return this.userStats;
  }

  initializeSocialFeatures() {
    this.setupSocialButtons();
    this.trackUserActivity();
  }

  setupSocialButtons() {
    // Add social action buttons if in frame context
    if (typeof farcasterFrameManager !== 'undefined' && farcasterFrameManager.isFrameContext) {
      this.createSocialActionBar();
    }
  }

  createSocialActionBar() {
    const socialBar = document.createElement('div');
    socialBar.className = 'social-actions';
    socialBar.innerHTML = `
      <button class="social-action-btn" onclick="socialFeatures.likeGame()" title="Like Game">
        ❤️
      </button>
      <button class="social-action-btn" onclick="socialFeatures.shareScore()" title="Share Score">
        📤
      </button>
      <button class="social-action-btn" onclick="socialFeatures.followDeveloper()" title="Follow Dev">
        👤
      </button>
    `;

    document.body.appendChild(socialBar);
  }

  likeGame() {
    this.showSocialNotification('❤️', 'Liked!', 'Thanks for the love!');
    this.trackSocialAction('like');
  }

  shareScore() {
    // Trigger share modal
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen.style.display !== 'none') {
      const shareBtn = document.getElementById('share-farcaster-btn');
      if (shareBtn) shareBtn.click();
    } else {
      this.showSocialNotification('📤', 'Share', 'Finish a game to share your score!');
    }
  }

  followDeveloper() {
    this.showFollowConfirmation();
    this.trackSocialAction('follow');
  }

  showFollowConfirmation() {
    const notification = document.createElement('div');
    notification.className = 'follow-confirmation';
    notification.innerHTML = `
      <div class="follow-icon">🐸</div>
      <h3>Thanks for Following!</h3>
      <p>Stay tuned for updates and new features!</p>
      <div class="follow-reward">+50 TOBY bonus!</div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);

    // Award follow bonus
    if (typeof web3Manager !== 'undefined') {
      web3Manager.awardTokens(50, 'Follow bonus');
    }

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 500);
    }, 3000);
  }

  showSocialNotification(icon, title, message) {
    const notification = document.createElement('div');
    notification.className = 'social-notification';
    notification.innerHTML = `
      <div class="social-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
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
    }, 2000);
  }

  trackSocialAction(action) {
    const today = new Date().toDateString();
    if (!this.userActivity[today]) {
      this.userActivity[today] = {};
    }

    this.userActivity[today][action] = (this.userActivity[today][action] || 0) + 1;
    localStorage.setItem('user_activity', JSON.stringify(this.userActivity));

    // Report to frame if available
    if (typeof farcasterFrameManager !== 'undefined') {
      farcasterFrameManager.postFrameMessage('social_action', {
        action: action,
        timestamp: Date.now()
      });
    }
  }

  trackUserActivity() {
    // Track page view
    this.trackSocialAction('page_view');

    // Track game starts
    const originalStartGame = window.startGameInstance;
    if (originalStartGame) {
      window.startGameInstance = function() {
        socialFeatures.trackSocialAction('game_start');
        return originalStartGame.apply(this, arguments);
      };
    }
  }

  getDailyActivity() {
    const today = new Date().toDateString();
    return this.userActivity[today] || {};
  }

  getTotalActivity() {
    let total = {};
    Object.values(this.userActivity).forEach(dayActivity => {
      Object.entries(dayActivity).forEach(([action, count]) => {
        total[action] = (total[action] || 0) + count;
      });
    });
    return total;
  }
}

// Initialize social features
const socialFeatures = new SocialFeatures();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialFeatures;
}

// Export for global access
window.socialFeatures = socialFeatures;