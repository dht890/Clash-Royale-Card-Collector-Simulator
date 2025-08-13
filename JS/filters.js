// Filtering and Sorting Module
export class CardFilters {
  constructor(cardManager) {
    this.cardManager = cardManager;
    this.currentFilter = "all";
    this.currentSort = "level";
    this.ascending = true;
  }

  // Combined function to apply both filter and sort
  applyFilterAndSort(cards) {
    if (!cards) return [];

    let filteredCards = [...cards];

    // Apply filter
    switch (this.currentFilter) {
      case "troop":
        filteredCards = filteredCards.filter((player) => player.type === "Troop");
        break;
      case "spell":
        filteredCards = filteredCards.filter((player) => player.type === "Spell");
        break;
      case "building":
        filteredCards = filteredCards.filter((player) => player.type === "Building");
        break;
      case "evolution":
        filteredCards = filteredCards.filter((player) => player.isEvolution === true);
        break;
      case "locked":
        filteredCards = filteredCards.filter(card => this.cardManager.getInventory()[card.name]?.locked);
        break;
      case "unlocked":
        filteredCards = filteredCards.filter(card => !this.cardManager.getInventory()[card.name]?.locked);
        break;
      default:
        // "all"
        break;
    }

    // Apply sort
    filteredCards.sort((a, b) => {
      const lockedA = this.cardManager.getInventory()[a.name]?.locked;
      const lockedB = this.cardManager.getInventory()[b.name]?.locked;

      // Always prioritize unlocked first
      if (lockedA !== lockedB) {
        return lockedA ? 1 : -1;
      }

      // Now sort based on currentSort
      let result = 0;
      let levelA = this.cardManager.calculateLevel(a.name);
      let levelB = this.cardManager.calculateLevel(b.name);

      switch (this.currentSort) {
        case "level":
          if (levelA === 0 && levelB === 0) {
            // All locked — sort by id instead
            result = a.id - b.id;
          } else if (levelA !== levelB) {
            result = levelB - levelA; // Higher levels first
          } else {
            result = a.id - b.id;
          }
          break;
        case "name":
          if (levelA === 0 && levelB === 0) {
            result = a.id - b.id;
          } else if (levelA !== levelB) {
            result = a.name.localeCompare(b.name);
          } else {
            result = a.name.localeCompare(b.name);
          }
          break;
        case "elixir-cost":
          result = a.elixirCost - b.elixirCost;
          if (levelA === 0 && levelB === 0) {
            result = a.id - b.id;
          } else if (levelA !== levelB) {
            result = a.elixirCost - b.elixirCost;
          } else {
            result = a.elixirCost - b.elixirCost;
          }
          break;
        case "rarity":
          const rarityOrder = { "Common": 1, "Rare": 2, "Epic": 3, "Legendary": 4, "Champion": 5 };
          if (levelA === 0 && levelB === 0) {
            result = a.id - b.id;
          } else if (levelA !== levelB) {
            result = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          } else {
            result = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          }
          break;
        case "id":
          if (levelA === 0 && levelB === 0) {
            result = a.id - b.id;
          } else if (levelA !== levelB) {
            result = levelB - levelA;
          }
          break;
      }

      return this.ascending ? result : -result;
    });

    return filteredCards;
  }

  // Function to toggle sort direction
  toggleSortDirection() {
    this.ascending = !this.ascending;
    return this.ascending;
  }

  // Function to update the sort direction button text
  updateSortDirectionButton() {
    const button = document.getElementById('sort-direction');
    if (button) {
      button.textContent = this.ascending ? '▲' : '▼';
    }
  }

  // Set filter
  setFilter(filter) {
    this.currentFilter = filter;
  }

  // Set sort
  setSort(sort) {
    this.currentSort = sort;
  }

  // Get current filter
  getCurrentFilter() {
    return this.currentFilter;
  }

  // Get current sort
  getCurrentSort() {
    return this.currentSort;
  }

  // Get sort direction
  isAscending() {
    return this.ascending;
  }
}
