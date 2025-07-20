
// Lore and storytelling system for Toad Jumpers
class LoreManager {
  constructor() {
    this.currentScroll = 0;
    this.totalScrolls = 4;
    this.setupLoreSystem();
  }

  setupLoreSystem() {
    this.bindLoreEvents();
    this.setupScrollNavigation();
  }

  bindLoreEvents() {
    const loreBtn = document.getElementById('lore-btn');
    if (loreBtn) {
      loreBtn.addEventListener('click', () => {
        this.showLoreScreen();
      });
    }

    const backBtn = document.getElementById('back-from-lore-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.hideLoreScreen();
      });
    }
  }

  setupScrollNavigation() {
    const prevBtn = document.getElementById('prev-scroll');
    const nextBtn = document.getElementById('next-scroll');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousScroll();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextScroll();
      });
    }

    // Setup external links
    this.setupExternalLinks();
  }

  setupExternalLinks() {
    const externalLinks = document.querySelectorAll('.external-link');
    externalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });
  }

  showLoreScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('lore-screen').style.display = 'block';
    this.updateScrollDisplay();
  }

  hideLoreScreen() {
    document.getElementById('lore-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
  }

  previousScroll() {
    this.currentScroll = Math.max(0, this.currentScroll - 1);
    this.updateScrollDisplay();
  }

  nextScroll() {
    this.currentScroll = Math.min(this.totalScrolls - 1, this.currentScroll + 1);
    this.updateScrollDisplay();
  }

  updateScrollDisplay() {
    // Hide all scrolls
    const scrolls = document.querySelectorAll('.scroll');
    scrolls.forEach(scroll => {
      scroll.classList.remove('active');
    });

    // Show current scroll
    const currentScrollElement = document.querySelector(`[data-scroll="${this.currentScroll}"]`);
    if (currentScrollElement) {
      currentScrollElement.classList.add('active');
    }

    // Update indicator
    const indicator = document.getElementById('scroll-indicator');
    if (indicator) {
      indicator.textContent = `${this.currentScroll + 1} / ${this.totalScrolls}`;
    }

    // Update navigation buttons
    const prevBtn = document.getElementById('prev-scroll');
    const nextBtn = document.getElementById('next-scroll');

    if (prevBtn) {
      prevBtn.disabled = this.currentScroll === 0;
      prevBtn.style.opacity = this.currentScroll === 0 ? '0.5' : '1';
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentScroll === this.totalScrolls - 1;
      nextBtn.style.opacity = this.currentScroll === this.totalScrolls - 1 ? '0.5' : '1';
    }
  }

  unlockLoreContent(contentId) {
    // Future: unlock lore content based on achievements
    const unlockedContent = JSON.parse(localStorage.getItem('unlocked_lore') || '[]');
    if (!unlockedContent.includes(contentId)) {
      unlockedContent.push(contentId);
      localStorage.setItem('unlocked_lore', JSON.stringify(unlockedContent));
      this.showLoreUnlockNotification(contentId);
    }
  }

  showLoreUnlockNotification(contentId) {
    const notification = document.createElement('div');
    notification.className = 'lore-unlock-notification';
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #FFD700, #FFA500);
      color: #000;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;

    notification.innerHTML = `
      <div style="font-size: 2em; margin-bottom: 10px;">📜</div>
      <h3>Lore Unlocked!</h3>
      <p>New secrets of the Toadgod universe revealed!</p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  isContentUnlocked(contentId) {
    const unlockedContent = JSON.parse(localStorage.getItem('unlocked_lore') || '[]');
    return unlockedContent.includes(contentId);
  }
}

// Initialize lore manager
const loreManager = new LoreManager();

// Export for global access
window.loreManager = loreManager;
