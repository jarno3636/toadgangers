// Web3 and TOBY token management for Toad Jumpers
class Web3Manager {
  constructor() {
    this.userAddress = null;
    this.tokenBalance = 0;
    this.pendingRewards = [];
    this.isConnected = false;
    this.initializeWeb3();
  }

  initializeWeb3() {
    // Initialize token balance from localStorage
    this.tokenBalance = parseInt(localStorage.getItem('toby_tokens') || '0');
    this.updateTokenDisplay();

    // Check for existing wallet connection
    this.checkStoredConnection();
  }

  checkStoredConnection() {
    const storedAddress = localStorage.getItem('connected_wallet');
    if (storedAddress) {
      this.userAddress = storedAddress;
      this.isConnected = true;
      this.updateWalletDisplay();
    }
  }

  async connectWallet() {
    // Simulate wallet connection for demo purposes
    if (!this.isConnected) {
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      this.userAddress = mockAddress;
      this.isConnected = true;

      localStorage.setItem('connected_wallet', mockAddress);
      this.updateWalletDisplay();

      // Welcome bonus
      this.awardTokens(100, 'Welcome bonus');

      return true;
    }
    return false;
  }

  disconnectWallet() {
    this.userAddress = null;
    this.isConnected = false;
    localStorage.removeItem('connected_wallet');
    this.updateWalletDisplay();
  }

  awardTokens(amount, reason = 'Game reward') {
    if (amount <= 0) return;

    this.tokenBalance += amount;
    localStorage.setItem('toby_tokens', this.tokenBalance.toString());
    this.updateTokenDisplay();

    // Show reward notification
    this.showTokenReward(amount, reason);
  }

  spendTokens(amount, reason = 'Purchase') {
    if (this.tokenBalance >= amount) {
      this.tokenBalance -= amount;
      localStorage.setItem('toby_tokens', this.tokenBalance.toString());
      this.updateTokenDisplay();
      return true;
    }
    return false;
  }

  updateWalletDisplay() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');

    if (this.isConnected && this.userAddress) {
      connectBtn.style.display = 'none';
      walletInfo.style.display = 'block';
      walletAddress.textContent = this.userAddress.slice(0, 6) + '...' + this.userAddress.slice(-4);
    } else {
      connectBtn.style.display = 'block';
      walletInfo.style.display = 'none';
    }
  }

  updateTokenDisplay() {
    const tokenBalanceElement = document.getElementById('token-balance');
    if (tokenBalanceElement) {
      tokenBalanceElement.textContent = `🪙 ${this.tokenBalance} TOBY`;
    }

    // Update upgrades screen if visible
    const playerTokensElement = document.getElementById('player-tokens');
    if (playerTokensElement) {
      playerTokensElement.textContent = this.tokenBalance;
    }
  }

  showTokenReward(amount, reason) {
    const notification = document.createElement('div');
    notification.className = 'token-reward-notification';
    notification.innerHTML = `
      <div class="token-reward-content">
        <div class="token-reward-icon">🪙</div>
        <div>
          <div class="token-amount">+${amount} TOBY</div>
          <div class="token-reason">${reason}</div>
        </div>
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

  updateSubscriberActivity(address, gameTime) {
    // Track user activity for future features
    const activity = {
      address: address,
      lastPlayed: Date.now(),
      totalGameTime: gameTime,
      lastScore: 0
    };

    localStorage.setItem('user_activity', JSON.stringify(activity));
  }

  getTokenBalance() {
    return this.tokenBalance;
  }
}

// Initialize Web3 Manager
const web3Manager = new Web3Manager();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', function() {
      web3Manager.connectWallet();
    });
  }
});

// Initialize Web3 manager on page load
document.addEventListener('DOMContentLoaded', function() {
  if (typeof web3Manager !== 'undefined') {
    web3Manager.init();
  }
});

// Export for global access
if (typeof window !== 'undefined') {
  window.web3Manager = web3Manager;
}