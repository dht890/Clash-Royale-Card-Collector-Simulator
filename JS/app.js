// Main Application Module
import { CardDataAPI } from './api.js';
import { CardManager } from './cardManager.js';
import { CardUI } from './ui.js';
import { CardFilters } from './filters.js';
import { makeGlobalTestingFunctions } from './testing.js';

export class ClashRoyaleApp {
  constructor() {
    this.api = new CardDataAPI();
    this.cardManager = new CardManager(this.api);
    this.ui = new CardUI(this.cardManager);
    this.filters = new CardFilters(this.cardManager);
    
    this.filterDropdownList = document.getElementById("players");
    this.sortDropdownList = document.getElementById("sorting");
    
    // Set up the callback system for automatic UI updates
    this.cardManager.setInventoryChangeCallback(() => {
      this.refreshDisplay();
    });
    
    this.initializeEventListeners();
  }

  async initialize() {
    try {
      this.ui.showLoading();
      
      // Load card data
      await this.api.loadCardData();
      
      // Load rarity data
      await this.api.loadRarityData();
      
      // Initialize inventory
      this.cardManager.initializeInventory();
      this.cardManager.loadPlayerInventory();
      this.cardManager.initializeLockedStatus();
      
      // Initialize page
      this.initializePage();
      
      // Make testing functions available globally
      makeGlobalTestingFunctions(this.cardManager);
      
    } catch (error) {
      console.error('Error initializing app:', error);
      this.ui.showError('Error loading card data.');
    }
  }

  initializePage() {
    const cards = this.api.getCards();
    if (cards) {
      this.ui.setPlayerCards(cards);
    }
  }

  initializeEventListeners() {
    // Event listener for filtering cards
    this.filterDropdownList.addEventListener("change", (e) => {
      this.filters.setFilter(e.target.value);
      this.applyFilterAndSort();
    });

    // Event listener for sorting cards
    this.sortDropdownList.addEventListener("change", (e) => {
      this.filters.setSort(e.target.value);
      this.applyFilterAndSort();
    });
  }

  applyFilterAndSort() {
    const cards = this.api.getCards();
    if (!cards) return;

    const filteredAndSortedCards = this.filters.applyFilterAndSort(cards);
    this.ui.setPlayerCards(filteredAndSortedCards);
  }

  // Function to toggle sort direction
  toggleSortDirection() {
    this.filters.toggleSortDirection();
    this.filters.updateSortDirectionButton();
    this.applyFilterAndSort();
  }

  // Function to refresh the display
  refreshDisplay() {
    this.applyFilterAndSort();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new ClashRoyaleApp();
  app.initialize();
  
  // Make app available globally for debugging
  window.app = app;
  
  // Make toggleSortDirection available globally
  window.toggleSortDirection = () => app.toggleSortDirection();
});
