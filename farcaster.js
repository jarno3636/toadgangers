
// Farcaster Frame Integration Manager
class FarcasterFrameManager {
  constructor() {
    this.isFrameContext = this.detectFrameContext();
    this.userFid = null;
    this.userProfile = null;
    this.frameData = {};
    this.initializeFrame();
  }

  detectFrameContext() {
    // Check if running in Farcaster frame context
    const urlParams = new URLSearchParams(window.location.search);
    const frameParam = urlParams.get('frame');
    const farcasterUserAgent = navigator.userAgent.includes('Farcaster');
    
    return frameParam === '1' || farcasterUserAgent || window.parent !== window;
  }

  initializeFrame() {
    if (this.isFrameContext) {
      console.log('Initializing Farcaster frame context');
      this.setupFrameListeners();
      this.requestUserData();
    } else {
      console.log('Not in frame context, initializing as regular web app');
    }
  }

  setupFrameListeners() {
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://frames.farcaster.com' || 
          event.origin === 'https://warpcast.com') {
        this.handleFrameMessage(event.data);
      }
    });
  }

  handleFrameMessage(data) {
    switch (data.type) {
      case 'frame_user_data':
        this.userFid = data.fid;
        this.userProfile = data.profile;
        this.displayUserProfile();
        break;
      case 'frame_action':
        this.handleFrameAction(data.action, data.payload);
        break;
      case 'frame_error':
        console.error('Frame error:', data.error);
        break;
    }
  }

  requestUserData() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'request_user_data'
      }, '*');
    }
  }

  displayUserProfile() {
    if (!this.userProfile) return;

    const profileHTML = `
      <div class="frame-user-profile">
        <img src="${this.userProfile.pfp_url}" alt="Profile" class="user-pfp">
        <div class="user-details">
          <div class="username">${this.userProfile.username}</div>
          <div class="user-stats">Follower count: ${this.userProfile.follower_count}</div>
        </div>
      </div>
    `;

    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      startScreen.insertAdjacentHTML('afterbegin', profileHTML);
    }
  }

  createFrameShareCast(score, timeAlive, playerName) {
    const baseUrl = window.location.origin;
    
    return {
      text: `🐸 Just jumped to ${score} points in Toad Jumpers!\n\nSurvived ${Math.floor(timeAlive/60)}s in the lily pad dimension.\n\nCan you beat this score? 🏆`,
      embeds: [`${baseUrl}?challenge=${this.generateChallengeSeed(score, timeAlive)}`]
    };
  }

  generateChallengeSeed(score, timeAlive) {
    return btoa(`${score}-${timeAlive}-${Date.now()}`).substring(0, 16);
  }

  postFrameMessage(type, payload) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: `toad_jumpers_${type}`,
        payload: payload,
        timestamp: Date.now()
      }, '*');
    }
  }

  handleFrameAction(action, payload) {
    switch (action) {
      case 'start_game':
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        startGame();
        break;
      case 'view_leaderboard':
        showLeaderboard();
        break;
      case 'daily_challenge':
        if (typeof challengeManager !== 'undefined') {
          challengeManager.startDailyChallenge();
        }
        break;
      case 'invite_friends':
        this.showInviteModal();
        break;
    }
  }

  showInviteModal() {
    const modal = document.createElement('div');
    modal.className = 'frame-earning-modal';
    modal.innerHTML = `
      <div class="frame-earning-content">
        <h3>🐸 Invite Friends to the Pond!</h3>
        <p>Share Toad Jumpers with your Farcaster network and earn rewards!</p>
        <div class="earning-methods">
          <div class="earning-method">
            <div class="earning-icon">👥</div>
            <div class="earning-text">Invite Friend</div>
            <div class="earning-reward">+25 TOBY</div>
          </div>
          <div class="earning-method">
            <div class="earning-icon">🎮</div>
            <div class="earning-text">Friend Plays</div>
            <div class="earning-reward">+10 TOBY</div>
          </div>
        </div>
        <button class="close-earning-modal" onclick="this.closest('.frame-earning-modal').remove()">
          Share Game!
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
  }

  updateSocialStats(stats) {
    this.postFrameMessage('social_update', stats);
  }
}

// Initialize frame manager
const farcasterFrameManager = new FarcasterFrameManager();

// Export for global access
window.farcasterFrameManager = farcasterFrameManager;
