// Frame handler for UI management and frame-specific features
class FrameHandler {
  constructor() {
    this.isFrameContext = this.detectFrameContext();
    this.frameState = {};
    this.initializeFrameHandler();
  }

  detectFrameContext() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('frame') === '1' || 
           navigator.userAgent.includes('Farcaster') ||
           window.parent !== window;
  }

  initializeFrameHandler() {
    if (this.isFrameContext) {
      this.setupFrameUI();
      this.trackFrameEngagement();
    }
  }

  setupFrameUI() {
    // Add frame-specific UI elements
    this.addFrameControls();
    this.styleForFrame();
  }

  addFrameControls() {
    const frameControls = document.createElement('div');
    frameControls.className = 'frame-controls';
    frameControls.innerHTML = `
      <div class="frame-header">
        <h3>🐸 Toad Jumpers</h3>
        <div class="frame-actions">
          <button class="frame-btn" onclick="frameHandler.quickStart()">Quick Play</button>
          <button class="frame-btn" onclick="frameHandler.viewStats()">Stats</button>
        </div>
      </div>
    `;

    document.body.insertBefore(frameControls, document.body.firstChild);
  }

  styleForFrame() {
    // Add frame-specific styles
    document.body.style.paddingTop = '60px';

    // Adjust game canvas for frame
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
    }
  }

  quickStart() {
    if (gameLimitManager.canPlayGame()) {
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('gameCanvas').style.display = 'block';
      startGame();
    } else {
      this.showFrameNotification('Daily limit reached!', 'Come back tomorrow for more games.');
    }
  }

  viewStats() {
    const stats = this.getUserStats();
    this.showStatsModal(stats);
  }

  getUserStats() {
    return {
      gamesPlayed: gameLimitManager.getGamesPlayedToday(),
      highScore: localStorage.getItem('toadjumpers_highscore') || 0,
      tokensEarned: typeof web3Manager !== 'undefined' ? web3Manager.tokenBalance : 0,
      achievements: JSON.parse(localStorage.getItem('completed_achievements') || '[]').length
    };
  }

  showStatsModal(stats) {
    const modal = document.createElement('div');
    modal.className = 'frame-stats-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div class="frame-stats-content" style="
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #4fc3f7;
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        color: white;
        max-width: 400px;
      ">
        <h3 style="color: #4fc3f7; margin-bottom: 20px;">Your Stats</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #FFD700;">${stats.gamesPlayed}</div>
            <div style="font-size: 12px;">Games Today</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #4fc3f7;">${stats.highScore}</div>
            <div style="font-size: 12px;">High Score</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #00FF00;">${stats.tokensEarned}</div>
            <div style="font-size: 12px;">TOBY Tokens</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #FF6B35;">${stats.achievements}</div>
            <div style="font-size: 12px;">Achievements</div>
          </div>
        </div>
        <button onclick="this.closest('.frame-stats-modal').remove()" style="
          background: linear-gradient(45deg, #4fc3f7, #29b6f6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showFrameNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'frame-notification';
    notification.innerHTML = `
      <div class="frame-notification-content">
        <div class="frame-notification-icon">🐸</div>
        <h3>${title}</h3>
        <p>${message}</p>
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
    }, 3000);
  }

  trackFrameEngagement() {
    // Track frame-specific engagement
    const engagementData = {
      frameView: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    localStorage.setItem('frame_engagement', JSON.stringify(engagementData));
  }

  updateSocialStats(stats) {
    this.frameState.socialStats = stats;

    // Send to parent frame if available
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'toad_jumpers_stats_update',
        stats: stats
      }, '*');
    }
  }
}

// Initialize frame handler
const frameHandler = new FrameHandler();

// Export for global access
window.frameHandler = frameHandler;