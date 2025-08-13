// Card Management Module
export class CardManager {
  constructor(api) {
    this.api = api;
    this.playerInventory = {}; // Object to track player's card copies and levels
    this.onInventoryChange = null; // Callback for when inventory changes
  }

  // Set callback for inventory changes
  setInventoryChangeCallback(callback) {
    this.onInventoryChange = callback;
  }

  // Notify listeners of inventory changes
  notifyInventoryChange() {
    if (this.onInventoryChange) {
      this.onInventoryChange();
    }
  }

  initializeInventory() {
    const cards = this.api.getCards();
    if (cards) {
      cards.forEach(card => {
        if (!this.playerInventory[card.name]) {
          this.playerInventory[card.name] = {
            copies: 0,
            level: 0,
            rarity: card.rarity,
          };
        }
      });
    }
  }

  initializeLockedStatus() {
    Object.keys(this.playerInventory).forEach(cardName => {
      this.playerInventory[cardName].locked = (this.playerInventory[cardName].copies <= 0);
    });
  }

  // Helper function to get starting level based on rarity
  getStartingLevel(rarity) {
    const startingLevels = {
      "Common": 1,
      "Rare": 3,
      "Epic": 6,
      "Legendary": 9,
      "Champion": 11
    };
    return startingLevels[rarity] || 1;
  }

  // Function to calculate current level based on copies
  calculateLevel(cardName) {
    const card = this.playerInventory[cardName];
    if (!card || card.copies <= 0) return 0; // Level 0 = locked

    const rarity = card.rarity;
    const copies = card.copies;
    const rarityData = this.api.getRarityData();
    const upgrades = rarityData.rarityUpgrades[rarity].upgrades;
    let currentLevel = this.getStartingLevel(rarity);
    let usedCopies = 0;

    for (let level = currentLevel + 1; level <= 15; level++) {
      if (upgrades[level] && copies >= usedCopies + upgrades[level]) {
        usedCopies += upgrades[level];
        currentLevel = level;
      } else {
        break;
      }
    }
    return currentLevel;
  }

  // Function to calculate current copies after leveling up
  calculateCurrentCopies(cardName) {
    const card = this.playerInventory[cardName];
    if (!card) return 0;

    const rarity = card.rarity;
    const totalCopies = card.copies;
    const rarityData = this.api.getRarityData();
    const upgrades = rarityData.rarityUpgrades[rarity].upgrades;
    const currentLevel = this.calculateLevel(cardName);

    // Calculate how many copies were used to reach current level
    let usedCopies = 0;
    for (let level = this.getStartingLevel(rarity) + 1; level <= currentLevel; level++) {
      if (upgrades[level]) {
        usedCopies += upgrades[level];
      }
    }

    return Math.max(0, totalCopies - usedCopies);
  }

  // Function to get copies required for next level
  getCopiesRequiredForNextLevel(cardName) {
    const card = this.playerInventory[cardName];
    if (!card) return 0;

    const rarity = card.rarity;
    const currentLevel = this.calculateLevel(cardName);
    const rarityData = this.api.getRarityData();
    const upgrades = rarityData.rarityUpgrades[rarity].upgrades;

    // If max level, return 0
    if (currentLevel >= 15) return 0;

    return upgrades[currentLevel + 1] || 0;
  }

  // Function to save player inventory to localStorage
  savePlayerInventory() {
    localStorage.setItem('clashRoyaleInventory', JSON.stringify(this.playerInventory));
  }

  // Function to load player inventory from localStorage
  loadPlayerInventory() {
    const saved = localStorage.getItem('clashRoyaleInventory');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // Merge with current inventory, keeping defaults for new cards
        this.playerInventory = { ...this.playerInventory, ...loaded };
      } catch (error) {
        console.error('Error loading saved inventory:', error);
      }
    }
  }

  // Helper: find the correct card key regardless of case
  findCardKey(name) {
    const lower = name.trim().toLowerCase();
    return Object.keys(this.playerInventory).find(key => key.toLowerCase() === lower) || null;
  }

  // Function to update card copies (for testing/development)
  updateCardCopies(cardName, copies) {
    const key = this.findCardKey(cardName);
    if (key) {
      this.playerInventory[key].copies = Math.max(0, copies);
      this.playerInventory[key].locked = this.playerInventory[key].copies <= 0;
      this.savePlayerInventory();
      this.notifyInventoryChange(); // Notify UI to update
      return true;
    }
    return false;
  }

  // Function to add copies to a card
  addCardCopies(cardName, copiesToAdd) {
    const key = this.findCardKey(cardName);
    if (key) {
      const currentLevel = this.calculateLevel(key);

      // Don't add copies if already at max level (15)
      if (currentLevel >= 15) {
        return false; // Exit without adding copies
      }

      this.playerInventory[key].copies += Math.max(0, copiesToAdd);
      this.playerInventory[key].locked = this.playerInventory[key].copies <= 0;
      this.savePlayerInventory();
      this.notifyInventoryChange(); // Notify UI to update
      return true;
    }
    return false;
  }

  // Function to reset all cards to 0 copies
  resetAllCards() {
    Object.keys(this.playerInventory).forEach(cardName => {
      this.playerInventory[cardName].copies = 0;
      this.playerInventory[cardName].level = 0;
      this.playerInventory[cardName].locked = true;
    });
    this.savePlayerInventory();
    this.notifyInventoryChange(); // Notify UI to update
  }

  // Function to get card info for debugging
  getCardInfo(cardName) {
    const key = this.findCardKey(cardName);
    if (!key) return null;

    const inventory = this.playerInventory[key];

    return {
      name: key,
      totalCopies: inventory.copies,
      currentCopies: this.calculateCurrentCopies(key),
      level: this.calculateLevel(key),
      rarity: inventory.rarity,
      requiredForNext: this.getCopiesRequiredForNextLevel(key)
    };
  }

  // Testing functions for random copies
  addRandomCopies() {
    // Rarity appearance weights (probability of getting this rarity)
    const rarityWeights = {
      "Common": 50,
      "Rare": 30,
      "Epic": 15,
      "Legendary": 5,
      "Champion": 1
    };

    // Rarity copy ranges (how many copies to give)
    const rarityCopyRanges = {
      "Common": [5, 50],      // Min 5, Max 50
      "Rare": [3, 20],        // Min 3, Max 20
      "Epic": [1, 5],         // Min 1, Max 5
      "Legendary": [1, 2],    // Min 1, Max 2
      "Champion": [1, 1]      // Always 1
    };

    // Build weighted pool of cards based on rarity
    const pool = [];
    for (const cardName of Object.keys(this.playerInventory)) {
      const rarity = this.playerInventory[cardName].rarity;
      const weight = rarityWeights[rarity] || 1;
      for (let i = 0; i < weight; i++) {
        pool.push(cardName);
      }
    }

    // Pick random card from weighted pool
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    const rarity = this.playerInventory[randomCard].rarity;

    // Determine copies based on rarity's range
    const [minCopies, maxCopies] = rarityCopyRanges[rarity] || [1, 1];
    const randomCopies = Math.floor(Math.random() * (maxCopies - minCopies + 1)) + minCopies;

    // Add the copies
    this.addCardCopies(randomCard, randomCopies);

    return { card: randomCard, copies: randomCopies, rarity };
  }

  getInventory() {
    return this.playerInventory;
  }
}
