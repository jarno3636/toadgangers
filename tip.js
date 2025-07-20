
class TipManager {
  constructor() {
    this.tipOptions = this.getTipOptions();
    this.setupTipSystem();
  }

  getTipOptions() {
    return [
      {
        id: 'toby_tip',
        name: 'TOBY Tokens',
        description: 'Support with TOBY tokens',
        address: '0x1234567890123456789012345678901234567890', // Placeholder
        network: 'Base',
        type: 'token'
      },
      {
        id: 'eth_tip',
        name: 'Ethereum',
        description: 'Send ETH to support development',
        address: '0x1234567890123456789012345678901234567890', // Placeholder
        network: 'Ethereum',
        type: 'native'
      },
      {
        id: 'base_tip',
        name: 'Base ETH',
        description: 'Send ETH on Base network',
        address: '0x1234567890123456789012345678901234567890', // Placeholder
        network: 'Base',
        type: 'native'
      }
    ];
  }

  setupTipSystem() {
    const tipBtn = document.getElementById('tip-btn');
    if (tipBtn) {
      tipBtn.addEventListener('click', () => {
        this.showTipModal();
      });
    }

    // Setup close modal functionality
    const modal = document.getElementById('tip-modal');
    if (modal) {
      const closeBtn = modal.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }

  showTipModal() {
    const modal = document.getElementById('tip-modal');
    if (!modal) {
      this.createTipModal();
      return;
    }

    this.populateTipOptions();
    modal.style.display = 'flex';
    
    // Ensure modal can be closed by clicking outside or close button
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close')) {
        modal.style.display = 'none';
      }
    });
  }

  createTipModal() {
    // Modal is already in HTML, just populate it
    this.populateTipOptions();
    const modal = document.getElementById('tip-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  populateTipOptions() {
    const tipOptionsContainer = document.getElementById('tip-options');
    if (!tipOptionsContainer) return;

    tipOptionsContainer.innerHTML = this.tipOptions.map(option => {
      return `
        <div class="tip-option" data-tip-id="${option.id}">
          <h4>${option.name}</h4>
          <p>${option.description}</p>
          <div class="wallet-address">
            <code>${option.address}</code>
            <button onclick="tipManager.copyAddress('${option.address}')">📋</button>
          </div>
          ${option.type === 'token' ? this.createTobyTipControls(option.id) : ''}
          <small>Network: ${option.network}</small>
        </div>
      `;
    }).join('');
  }

  createTobyTipControls(optionId) {
    return `
      <div class="toby-tip-controls">
        <input type="number" id="${optionId}-amount" placeholder="Amount" min="1" max="10000">
        <button onclick="tipManager.sendTobyTip('${optionId}')">Send TOBY</button>
      </div>
    `;
  }

  copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
      this.showNotification('Address copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy address:', err);
      this.showNotification('Failed to copy address');
    });
  }

  sendTobyTip(optionId) {
    const amountInput = document.getElementById(`${optionId}-amount`);
    const amount = parseInt(amountInput.value);

    if (!amount || amount < 1) {
      this.showNotification('Please enter a valid amount');
      return;
    }

    if (typeof web3Manager !== 'undefined' && web3Manager.isConnected) {
      const userBalance = web3Manager.tokenBalance;
      if (userBalance >= amount) {
        // Simulate tip transaction
        web3Manager.spendTokens(amount, 'Developer tip');
        this.showNotification(`Thanks for the ${amount} TOBY tip! 🐸`);
        amountInput.value = '';
        
        // Award small bonus for tipping
        setTimeout(() => {
          web3Manager.awardTokens(Math.floor(amount * 0.1), 'Tip bonus');
        }, 2000);
      } else {
        this.showNotification('Insufficient TOBY balance');
      }
    } else {
      this.showNotification('Please connect your wallet first');
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'tip-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #4fc3f7, #29b6f6);
      color: white;
      padding: 15px;
      border-radius: 10px;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize tip manager
const tipManager = new TipManager();
