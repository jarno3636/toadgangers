
// Upgrades and cosmetics system for Toad Jumpers
class UpgradeManager {
  constructor() {
    this.ownedSkins = JSON.parse(localStorage.getItem('owned_skins') || '["default"]');
    this.equippedSkin = localStorage.getItem('equipped_skin') || 'default';
    this.ownedUpgrades = JSON.parse(localStorage.getItem('owned_upgrades') || '[]');
    this.totalScore = parseInt(localStorage.getItem('total_score') || '0');

    this.skins = {
      default: { name: 'Classic Blue', price: 0, color: '#00BFFF' },
      golden: { name: 'Golden Toad', price: 500, color: '#FFD700' },
      rainbow: { name: 'Rainbow Frog', price: 1000, color: 'rainbow' },
      shadow: { name: 'Shadow Frog', price: 750, color: '#2F2F2F' }
    };

    this.upgrades = {
      jump: { name: 'Super Jump', description: '+50% jump height', price: 400 },
      speed: { name: 'Speed Boost', description: '+30% movement speed', price: 600 },
      magnet: { name: 'Token Magnet', description: 'Auto-collect nearby tokens', price: 1600 },
      multiplier: { name: 'Score Multiplier', description: '+50% score from tokens', price: 2000 }
    };

    this.initializeUpgrades();
  }

  initializeUpgrades() {
    this.updateUpgradesDisplay();
    this.bindUpgradeEvents();
  }

  updateUpgradesDisplay() {
    // Update frog skins
    const skinsContainer = document.getElementById('frog-skins');
    if (skinsContainer) {
      skinsContainer.innerHTML = '';
      Object.entries(this.skins).forEach(([skinId, skin]) => {
        const skinElement = this.createSkinElement(skinId, skin);
        skinsContainer.appendChild(skinElement);
      });
    }

    // Update power-ups
    const powerupsContainer = document.getElementById('powerups');
    if (powerupsContainer) {
      powerupsContainer.innerHTML = '';
      Object.entries(this.upgrades).forEach(([upgradeId, upgrade]) => {
        const upgradeElement = this.createUpgradeElement(upgradeId, upgrade);
        powerupsContainer.appendChild(upgradeElement);
      });
    }

    // Update player stats
    this.updatePlayerStats();
  }

  createSkinElement(skinId, skin) {
    const div = document.createElement('div');
    div.className = 'upgrade-item';
    div.dataset.skin = skinId;

    if (this.ownedSkins.includes(skinId)) {
      div.classList.add('owned');
    }
    if (this.equippedSkin === skinId) {
      div.classList.add('equipped');
    }

    let skinPreview = '🐸';
    if (skin.color === '#FFD700') skinPreview = '🟡';
    else if (skin.color === 'rainbow') skinPreview = '🌈';
    else if (skin.color === '#2F2F2F') skinPreview = '⚫';

    div.innerHTML = `
      <div class="skin-preview">${skinPreview}</div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-price">${skin.price === 0 ? 'FREE' : skin.price + ' TOBY'}</div>
    `;

    div.addEventListener('click', () => this.handleSkinClick(skinId, skin));
    return div;
  }

  createUpgradeElement(upgradeId, upgrade) {
    const div = document.createElement('div');
    div.className = 'upgrade-item';
    div.dataset.upgrade = upgradeId;

    if (this.ownedUpgrades.includes(upgradeId)) {
      div.classList.add('owned');
    }

    const icons = {
      jump: '⬆️',
      speed: '⚡',
      magnet: '🧲',
      multiplier: '✨'
    };

    div.innerHTML = `
      <div class="upgrade-icon">${icons[upgradeId]}</div>
      <div class="upgrade-name">${upgrade.name}</div>
      <div class="upgrade-description">${upgrade.description}</div>
      <div class="upgrade-price">${this.ownedUpgrades.includes(upgradeId) ? 'OWNED' : upgrade.price + ' TOBY'}</div>
    `;

    if (!this.ownedUpgrades.includes(upgradeId)) {
      div.addEventListener('click', () => this.handleUpgradeClick(upgradeId, upgrade));
    }

    return div;
  }

  handleSkinClick(skinId, skin) {
    if (!this.ownedSkins.includes(skinId)) {
      // Purchase skin
      if (typeof web3Manager !== 'undefined' && web3Manager.spendTokens(skin.price, `Skin: ${skin.name}`)) {
        this.ownedSkins.push(skinId);
        localStorage.setItem('owned_skins', JSON.stringify(this.ownedSkins));
        this.showUpgradeNotification(`Purchased ${skin.name}!`, 'success');
      } else {
        this.showUpgradeNotification('Not enough TOBY tokens!', 'error');
      }
    } else {
      // Equip skin
      this.equippedSkin = skinId;
      localStorage.setItem('equipped_skin', skinId);
      this.showUpgradeNotification(`Equipped ${skin.name}!`, 'success');
    }
    this.updateUpgradesDisplay();
  }

  handleUpgradeClick(upgradeId, upgrade) {
    if (typeof web3Manager !== 'undefined' && web3Manager.spendTokens(upgrade.price, `Upgrade: ${upgrade.name}`)) {
      this.ownedUpgrades.push(upgradeId);
      localStorage.setItem('owned_upgrades', JSON.stringify(this.ownedUpgrades));
      this.showUpgradeNotification(`Purchased ${upgrade.name}!`, 'success');
      this.updateUpgradesDisplay();
    } else {
      this.showUpgradeNotification('Not enough TOBY tokens!', 'error');
    }
  }

  showUpgradeNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `upgrade-notification ${type}`;
    notification.textContent = message;

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

  updatePlayerStats() {
    const playerTokensElement = document.getElementById('player-tokens');
    const playerTotalScoreElement = document.getElementById('player-total-score');

    if (playerTokensElement && typeof web3Manager !== 'undefined') {
      playerTokensElement.textContent = web3Manager.getTokenBalance();
    }

    if (playerTotalScoreElement) {
      playerTotalScoreElement.textContent = this.totalScore;
    }
  }

  updateTotalScore(score) {
    this.totalScore += score;
    localStorage.setItem('total_score', this.totalScore.toString());
    this.updatePlayerStats();
  }

  bindUpgradeEvents() {
    const upgradesBtn = document.getElementById('upgrades-btn');
    const backBtn = document.getElementById('back-from-upgrades-btn');

    if (upgradesBtn) {
      upgradesBtn.addEventListener('click', () => this.showUpgradesScreen());
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => this.hideUpgradesScreen());
    }
  }

  showUpgradesScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('upgrades-screen').style.display = 'block';
    this.updateUpgradesDisplay();
  }

  hideUpgradesScreen() {
    document.getElementById('upgrades-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
  }

  getEquippedSkin() {
    return this.equippedSkin;
  }

  getSkinColor(skinId) {
    return this.skins[skinId]?.color || '#00BFFF';
  }

  hasUpgrade(upgradeId) {
    return this.ownedUpgrades.includes(upgradeId);
  }

  loadPlayerData() {
    // Try to load subscriber-specific data first if wallet connected
    if (typeof web3Manager !== 'undefined' && web3Manager.userAddress) {
      const subscriberKey = `player_data_${web3Manager.userAddress}`;
      const subscriberData = localStorage.getItem(subscriberKey);
      if (subscriberData) {
        return JSON.parse(subscriberData);
      }
    }

    // Fall back to general player data
    const saved = localStorage.getItem('toadjumpers_player_data');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      totalScore: 0,
      ownedSkins: ['default'],
      equippedSkin: 'default',
      ownedUpgrades: [],
      gamesPlayed: 0,
      tokensEarned: 0,
      subscriberAddress: null,
      accountCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  savePlayerData() {
    this.totalScore = parseInt(localStorage.getItem('total_score') || '0');
    this.ownedSkins = JSON.parse(localStorage.getItem('owned_skins') || '["default"]');
    this.equippedSkin = localStorage.getItem('equipped_skin') || 'default';
    this.ownedUpgrades = JSON.parse(localStorage.getItem('owned_upgrades') || '[]');

    // Save to subscriber-specific storage if wallet connected
    if (typeof web3Manager !== 'undefined' && web3Manager.userAddress) {
      const subscriberKey = `player_data_${web3Manager.userAddress}`;
      const playerData = {
        totalScore: this.totalScore,
        ownedSkins: this.ownedSkins,
        equippedSkin: this.equippedSkin,
        ownedUpgrades: this.ownedUpgrades,
        subscriberAddress: web3Manager.userAddress,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(subscriberKey, JSON.stringify(playerData));
    }

    // Fallback to general player data (for backwards compatibility)
    localStorage.setItem('toadjumpers_player_data', JSON.stringify({
      totalScore: this.totalScore,
      ownedSkins: this.ownedSkins,
      equippedSkin: this.equippedSkin,
      ownedUpgrades: this.ownedUpgrades
    }));
  }

  migrateToSubscriberAccount(userAddress) {
    // Migrate existing general player data to subscriber-specific storage
    const generalData = localStorage.getItem('toadjumpers_player_data');
    if (generalData && userAddress) {
      const subscriberKey = `player_data_${userAddress}`;
      const existingSubscriberData = localStorage.getItem(subscriberKey);

      if (!existingSubscriberData) {
        // No existing subscriber data, migrate general data
        const playerData = JSON.parse(generalData);
        playerData.subscriberAddress = userAddress;
        playerData.lastUpdated = new Date().toISOString();
        localStorage.setItem(subscriberKey, JSON.stringify(playerData));

        this.showUpgradeNotification('Progress migrated to your wallet account!', 'success');
        console.log('Player data migrated for subscriber:', userAddress);
      } else {
        // Merge data - keep the higher values
        const generalPlayerData = JSON.parse(generalData);
        const subscriberPlayerData = JSON.parse(existingSubscriberData);

        const mergedData = {
          ...subscriberPlayerData,
          totalScore: Math.max(generalPlayerData.totalScore || 0, subscriberPlayerData.totalScore || 0),
          gamesPlayed: Math.max(generalPlayerData.gamesPlayed || 0, subscriberPlayerData.gamesPlayed || 0),
          tokensEarned: Math.max(generalPlayerData.tokensEarned || 0, subscriberPlayerData.tokensEarned || 0),
          ownedSkins: [...new Set([...generalPlayerData.ownedSkins, ...subscriberPlayerData.ownedSkins])],
          ownedUpgrades: [...new Set([...generalPlayerData.ownedUpgrades, ...subscriberPlayerData.ownedUpgrades])],
          subscriberAddress: userAddress,
          lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(subscriberKey, JSON.stringify(mergedData));
        this.showUpgradeNotification('Account data synced!', 'success');
        console.log('Player data merged for subscriber:', userAddress);
      }
    }
  }

  getSubscriberStats(userAddress) {
    if (!userAddress) return null;

    const subscriberKey = `player_data_${userAddress}`;
    const playerData = localStorage.getItem(subscriberKey);
    const subscriberInfo = localStorage.getItem(`subscriber_${userAddress}`);

    return {
      playerData: playerData ? JSON.parse(playerData) : null,
      subscriberInfo: subscriberInfo ? JSON.parse(subscriberInfo) : null
    };
  }
}

// Initialize upgrade manager
const upgradeManager = new UpgradeManager();

// Export for global access
window.upgradeManager = upgradeManager;
