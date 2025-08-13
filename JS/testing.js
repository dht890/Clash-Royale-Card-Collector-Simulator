// Testing Functions Module
export class TestingUtils {
  constructor(cardManager) {
    this.cardManager = cardManager;
  }

  // Testing functions for the HTML interface
  testUpdateCard() {
    Object.keys(this.cardManager.getInventory()).forEach(cardName => {
      this.cardManager.updateCardCopies(cardName, 1);
    });
  }

  testAddCopies(cardName, copies) {
    if (this.cardManager.findCardKey(cardName)) {
      return this.cardManager.addCardCopies(cardName, copies);
    } else {
      alert('Card not found or invalid input');
      return false;
    }
  }

  testRandomCopies() {
    const result = this.cardManager.addRandomCopies();
    alert(`Added ${result.copies} copies to ${result.card} (${result.rarity})`);
    return result;
  }

  testGetInfo(cardName) {
    if (this.cardManager.findCardKey(cardName)) {
      const info = this.cardManager.getCardInfo(cardName);
      alert(`Card: ${info.name}
Level: ${info.level}
Rarity: ${info.rarity}
Total Copies: ${info.totalCopies}
Current Copies: ${info.currentCopies}
Required for Next: ${info.requiredForNext}`);
      return info;
    } else {
      alert('Card not found');
      return null;
    }
  }
}

// Global testing functions (for backward compatibility)
export function makeGlobalTestingFunctions(cardManager) {
  const utils = new TestingUtils(cardManager);
  
  // Make functions available globally for testing
  window.updateCardCopies = (cardName, copies) => cardManager.updateCardCopies(cardName, copies);
  window.addCardCopies = (cardName, copies) => cardManager.addCardCopies(cardName, copies);
  window.resetAllCards = () => cardManager.resetAllCards();
  window.getCardInfo = (cardName) => cardManager.getCardInfo(cardName);
  
  // Testing functions for the HTML interface
  window.testUpdateCard = () => utils.testUpdateCard();
  window.testAddCopies = () => {
    const cardName = document.getElementById('test-card-name').value;
    const copies = parseInt(document.getElementById('test-copies').value) || 1;
    utils.testAddCopies(cardName, copies);
  };
  window.testRandomCopies = () => utils.testRandomCopies();
  window.testGetInfo = () => {
    const cardName = document.getElementById('test-card-name').value;
    utils.testGetInfo(cardName);
  };
}
