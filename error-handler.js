
// Global error handler for Toad Jumpers
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
      event.preventDefault();
    });

    // Handle frame communication errors
    window.addEventListener('message', (event) => {
      if (event.data.type === 'farcaster_error') {
        this.logError('Farcaster Frame Error', event.data);
      }
    });
  }

  logError(type, details) {
    const errorLog = {
      type: type,
      details: details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.push(errorLog);
    console.error(`[${type}]`, details);

    // Store errors for debugging
    localStorage.setItem('toad_jumpers_errors', JSON.stringify(this.errors.slice(-10)));
  }

  getRecentErrors() {
    return this.errors.slice(-5);
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('toad_jumpers_errors');
  }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Export for debugging
window.toadJumpersDebug = {
  errors: () => errorHandler.getRecentErrors(),
  clearErrors: () => errorHandler.clearErrors()
};
// Global Error Handler for Toad Jumpers
class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
    this.setupUnhandledRejectionHandling();
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      this.logError('JavaScript Error', event.error, event.filename, event.lineno);
      
      // Don't break the game for non-critical errors
      if (!this.isCriticalError(event.error)) {
        event.preventDefault();
      }
    });
  }

  setupUnhandledRejectionHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError('Promise Rejection', event.reason);
      
      // Prevent the default behavior for non-critical rejections
      if (!this.isCriticalError(event.reason)) {
        event.preventDefault();
      }
    });
  }

  isCriticalError(error) {
    if (!error) return false;
    
    const criticalPatterns = [
      'Cannot read property',
      'Cannot read properties',
      'is not a function',
      'Network Error',
      'Failed to fetch'
    ];
    
    const errorMessage = error.toString().toLowerCase();
    return criticalPatterns.some(pattern => 
      errorMessage.includes(pattern.toLowerCase())
    );
  }

  logError(type, error, filename = '', line = '') {
    const errorData = {
      type: type,
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack || '',
      filename: filename,
      line: line,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store error for debugging
    const errors = JSON.parse(localStorage.getItem('toad_jumpers_errors') || '[]');
    errors.push(errorData);
    
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.shift();
    }
    
    localStorage.setItem('toad_jumpers_errors', JSON.stringify(errors));
  }

  showUserFriendlyError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #f44336, #d32f2f);
      color: white;
      padding: 15px;
      border-radius: 10px;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
      max-width: 300px;
      font-family: "Courier New", Courier, monospace;
    `;
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Oops!</div>
      <div style="font-size: 14px;">${message}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  getErrorReport() {
    return JSON.parse(localStorage.getItem('toad_jumpers_errors') || '[]');
  }

  clearErrors() {
    localStorage.removeItem('toad_jumpers_errors');
  }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Web3 specific error handling
function handleWeb3Error(error, context = '') {
  console.error(`Web3 Error in ${context}:`, error);
  
  let userMessage = 'Connection issue occurred. Please try again.';
  
  if (error.message) {
    if (error.message.includes('User rejected')) {
      userMessage = 'Transaction was cancelled.';
    } else if (error.message.includes('insufficient funds')) {
      userMessage = 'Insufficient funds for this transaction.';
    } else if (error.message.includes('network')) {
      userMessage = 'Network connection issue. Please check your connection.';
    }
  }
  
  errorHandler.showUserFriendlyError(userMessage);
  errorHandler.logError('Web3 Error', error, context);
}

// Frame integration error handling
function handleFrameError(error, context = '') {
  console.error(`Frame Error in ${context}:`, error);
  errorHandler.logError('Frame Error', error, context);
  
  // Don't show user errors for frame issues as they might be normal
  // when not in frame context
}

// Game error handling
function handleGameError(error, context = '') {
  console.error(`Game Error in ${context}:`, error);
  errorHandler.logError('Game Error', error, context);
  errorHandler.showUserFriendlyError('A game error occurred. Restarting...');
  
  // Try to recover by going back to start screen
  setTimeout(() => {
    try {
      document.getElementById('gameCanvas').style.display = 'none';
      document.getElementById('start-screen').style.display = 'block';
    } catch (e) {
      console.error('Failed to recover from game error:', e);
    }
  }, 2000);
}

// Export functions for global use
window.handleWeb3Error = handleWeb3Error;
window.handleFrameError = handleFrameError;
window.handleGameError = handleGameError;
window.errorHandler = errorHandler;
