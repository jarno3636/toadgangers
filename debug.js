
// Debug utilities for Toad Jumpers
class DebugManager {
  constructor() {
    this.debugMode = localStorage.getItem('debug_mode') === 'true';
    this.setupDebugConsole();
  }

  setupDebugConsole() {
    if (this.debugMode) {
      this.createDebugPanel();
    }

    // Debug commands
    window.toadDebug = {
      enableDebug: () => this.enableDebug(),
      disableDebug: () => this.disableDebug(),
      getGameState: () => this.getGameState(),
      awardTokens: (amount) => this.awardTokens(amount),
      clearProgress: () => this.clearProgress(),
      showErrors: () => this.showErrors()
    };
  }

  enableDebug() {
    this.debugMode = true;
    localStorage.setItem('debug_mode', 'true');
    this.createDebugPanel();
    console.log('Debug mode enabled. Use toadDebug commands.');
  }

  disableDebug() {
    this.debugMode = false;
    localStorage.setItem('debug_mode', 'false');
    const panel = document.getElementById('debug-panel');
    if (panel) panel.remove();
    console.log('Debug mode disabled.');
  }

  createDebugPanel() {
    if (document.getElementById('debug-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;

    panel.innerHTML = `
      <div>DEBUG MODE</div>
      <div>FPS: <span id="debug-fps">0</span></div>
      <div>Errors: <span id="debug-errors">0</span></div>
      <button onclick="toadDebug.awardTokens(100)">+100 TOBY</button>
      <button onclick="toadDebug.clearProgress()">Clear Progress</button>
    `;

    document.body.appendChild(panel);
    this.startFPSMonitor();
  }

  startFPSMonitor() {
    let lastTime = performance.now();
    let frames = 0;

    const updateFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        const fpsElement = document.getElementById('debug-fps');
        if (fpsElement) fpsElement.textContent = fps;
        
        frames = 0;
        lastTime = currentTime;
      }

      if (this.debugMode) {
        requestAnimationFrame(updateFPS);
      }
    };

    updateFPS();
  }

  getGameState() {
    return {
      isConnected: typeof web3Manager !== 'undefined' ? web3Manager.isConnected : false,
      tokenBalance: typeof web3Manager !== 'undefined' ? web3Manager.tokenBalance : 0,
      achievements: JSON.parse(localStorage.getItem('completed_achievements') || '[]'),
      highScore: localStorage.getItem('toadjumpers_highscore') || 0,
      gamesPlayed: localStorage.getItem('toadjumpers_games_played') || 0
    };
  }

  awardTokens(amount) {
    if (typeof web3Manager !== 'undefined') {
      web3Manager.awardTokens(amount, 'Debug reward');
      console.log(`Awarded ${amount} TOBY tokens`);
    }
  }

  clearProgress() {
    if (confirm('Clear all progress? This cannot be undone.')) {
      localStorage.clear();
      location.reload();
    }
  }

  showErrors() {
    if (typeof errorHandler !== 'undefined') {
      console.table(errorHandler.getRecentErrors());
    } else {
      console.log('No error handler found');
    }
  }
}

// Initialize debug manager
const debugManager = new DebugManager();

// Console welcome message
console.log('%c🐸 Toad Jumpers Debug Console', 'color: #4fc3f7; font-size: 16px; font-weight: bold;');
console.log('%cType toadDebug.enableDebug() to start debugging', 'color: #4fc3f7;');
