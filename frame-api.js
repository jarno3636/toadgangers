// Frame API handler for server-side frame actions
class FrameAPIHandler {
  constructor() {
    this.setupFrameHandlers();
  }

  setupFrameHandlers() {
    // Handle frame button clicks
    this.handleFrameActions();
  }

  handleFrameActions() {
    // This would typically be handled by a server
    // For now, we'll simulate frame responses client-side

    const urlParams = new URLSearchParams(window.location.search);
    const frameAction = urlParams.get('action');

    if (frameAction) {
      this.processFrameAction(frameAction);
    }
  }

  processFrameAction(action) {
    switch (action) {
      case 'play':
        this.handlePlayAction();
        break;
      case 'challenge':
        this.handleChallengeAction();
        break;
      case 'leaderboard':
        this.handleLeaderboardAction();
        break;
      case 'invite':
        this.handleInviteAction();
        break;
      default:
        console.log('Unknown frame action:', action);
    }
  }

  handlePlayAction() {
    // Auto-start game when coming from frame
    setTimeout(() => {
      if (gameLimitManager.canPlayGame()) {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        startGame();
      } else {
        gameLimitManager.showLimitReachedModal();
      }
    }, 1000);
  }

  handleChallengeAction() {
    // Start daily challenge
    if (typeof challengeManager !== 'undefined') {
      challengeManager.startDailyChallenge();
    }
  }

  handleLeaderboardAction() {
    // Show leaderboard
    showLeaderboard();
  }

  handleInviteAction() {
    // Show invite modal
    if (typeof farcasterFrameManager !== 'undefined') {
      farcasterFrameManager.showInviteModal();
    }
  }

  generateFrameResponse(action, result) {
    // Generate frame response for server
    return {
      type: 'frame_response',
      action: action,
      result: result,
      timestamp: Date.now()
    };
  }
}

// Initialize frame API handler
const frameAPIHandler = new FrameAPIHandler();

// Export for global access  
window.frameAPIHandler = frameAPIHandler;