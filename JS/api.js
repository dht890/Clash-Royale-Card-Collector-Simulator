// API and Data Loading Module
export class CardDataAPI {
  constructor() {
    this.clashRoyaleCards = null;
    this.rarityData = null;
  }

  async loadCardData() {
    try {
      const response = await fetch('./JSON/clashroyaledb.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract only the required fields from each card
      this.clashRoyaleCards = data.items.map(card => ({
        name: card.name,
        id: card.id,
        type: this.getCardType(card.name),
        isEvolution: card.maxEvolutionLevel > 0,
        elixirCost: card.elixirCost,
        rarity: card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1),
        iconUrl: card.maxEvolutionLevel > 0 && card.iconUrls.evolutionMedium
          ? card.iconUrls.evolutionMedium
          : card.iconUrls.medium
      }));

      Object.freeze(this.clashRoyaleCards);
      return this.clashRoyaleCards;
    } catch (error) {
      console.error('Error loading card data:', error);
      throw error;
    }
  }

  async loadRarityData() {
    try {
      const response = await fetch('./JSON/raritylevels.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.rarityData = await response.json();
      return this.rarityData;
    } catch (error) {
      console.error('Error loading rarity data:', error);
      throw error;
    }
  }

  // Helper function to determine card type (Troop, Spell, Building)
  getCardType(cardName) {
    // Spell cards (based on the actual database)
    const spellCards = [
      'Arrows', 'Barbarian Barrel', 'Clone', 'Earthquake', 'Fireball', 'Freeze', 
      'Goblin Barrel', 'Goblin Curse', 'Giant Snowball', 'Graveyard', 'Lightning', 
      'Mirror', 'Poison', 'Rage', 'Rocket', 'Royal Delivery', 'The Log', 'Tornado', 
      'Void', 'Zap'
    ];
    
    // Building cards (based on the actual database)
    const buildingCards = [
      'Barbarian Hut', 'Bomb Tower', 'Cannon', 'Elixir Collector', 'Goblin Cage', 
      'Goblin Drill', 'Goblin Hut', 'Inferno Tower', 'Mortar', 'Tesla', 'Tombstone', 'X-Bow'
    ];

    if (spellCards.includes(cardName)) {
      return 'Spell';
    } else if (buildingCards.includes(cardName)) {
      return 'Building';
    } else {
      return 'Troop'; // Default to Troop for most cards
    }
  }

  getCards() {
    return this.clashRoyaleCards;
  }

  getRarityData() {
    return this.rarityData;
  }
}
