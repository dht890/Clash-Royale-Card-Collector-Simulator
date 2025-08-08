const playerCards = document.getElementById("player-cards");
const filterDropdownList = document.getElementById("players");
const sortDropdownList = document.getElementById("sorting");

let clashRoyaleCards = null;
let playerInventory = {}; // Object to track player's card copies and levels
let rarityData = null; // Store rarity upgrade requirements

async function loadCardData() {
  try {
    const response = await fetch('./JSON/clashroyaledb.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Extract only the required fields from each card
    clashRoyaleCards = data.items.map(card => ({
      name: card.name,
      id: card.id,
      type: getCardType(card.name), // We'll determine card type based on name or other logic
      isEvolution: card.maxEvolutionLevel > 0,
      elixirCost: card.elixirCost,
      rarity: card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1), // Capitalize first letter
      iconUrl: card.maxEvolutionLevel > 0 && card.iconUrls.evolutionMedium
        ? card.iconUrls.evolutionMedium
        : card.iconUrls.medium
    }));

    Object.freeze(clashRoyaleCards);
    await CopiesAndUpgrades();
    initializePage();
  } catch (error) {
    console.error('Error loading card data:', error);
    playerCards.innerHTML = '<p class="error">Error loading card data.</p>';
  }
}

async function CopiesAndUpgrades() {
  try {
    const response = await fetch('./JSON/raritylevels.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    rarityData = await response.json();

    // Initialize player inventory with default values for each card
    if (clashRoyaleCards) {
      clashRoyaleCards.forEach(card => {
        if (!playerInventory[card.name]) {
          playerInventory[card.name] = {
            copies: 0,
            level: getStartingLevel(card.rarity),
            rarity: card.rarity
          };
        }
      });
    }

    // Load saved inventory from localStorage if available
    loadPlayerInventory();

  } catch (error) {
    console.error('Error loading rarity data:', error);
  }
}

// Helper function to get starting level based on rarity
function getStartingLevel(rarity) {
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
function calculateLevel(cardName) {
  const card = playerInventory[cardName];
  if (!card) return getStartingLevel("Common");
 
  const rarity = card.rarity;
  const copies = card.copies;
  const upgrades = rarityData.rarityUpgrades[rarity].upgrades;
  let currentLevel = getStartingLevel(rarity);
  let usedCopies = 0;
 
  // Find the highest level the player can achieve with current copies
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
function calculateCurrentCopies(cardName) {
  const card = playerInventory[cardName];
  if (!card) return 0;

  const rarity = card.rarity;
  const totalCopies = card.copies;
  const upgrades = rarityData.rarityUpgrades[rarity].upgrades;
  const currentLevel = calculateLevel(cardName);

  // Calculate how many copies were used to reach current level
  let usedCopies = 0;
  for (let level = getStartingLevel(rarity) + 1; level <= currentLevel; level++) {
    if (upgrades[level]) {
      usedCopies += upgrades[level];
    }
  }

  return Math.max(0, totalCopies - usedCopies);
}

// Function to get copies required for next level
function getCopiesRequiredForNextLevel(cardName) {
  const card = playerInventory[cardName];
  if (!card) return 0;

  const rarity = card.rarity;
  const currentLevel = calculateLevel(cardName);
  const upgrades = rarityData.rarityUpgrades[rarity].upgrades;

  // If max level, return 0
  if (currentLevel >= 15) return 0;

  return upgrades[currentLevel + 1] || 0;
}

// Function to save player inventory to localStorage
function savePlayerInventory() {
  localStorage.setItem('clashRoyaleInventory', JSON.stringify(playerInventory));
}

// Function to load player inventory from localStorage
function loadPlayerInventory() {
  const saved = localStorage.getItem('clashRoyaleInventory');
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      // Merge with current inventory, keeping defaults for new cards
      playerInventory = { ...playerInventory, ...loaded };
    } catch (error) {
      console.error('Error loading saved inventory:', error);
    }
  }
}

// Helper: find the correct card key regardless of case
function findCardKey(name) {
  const lower = name.trim().toLowerCase();
  return Object.keys(playerInventory).find(key => key.toLowerCase() === lower) || null;
}

// Function to update card copies (for testing/development)
function updateCardCopies(cardName, copies) {
  const key = findCardKey(cardName);
  if (key) {
    playerInventory[key].copies = Math.max(0, copies);
    savePlayerInventory();
    applyFilterAndSort(); // Refresh display
  }
}

// Function to add copies to a card
function addCardCopies(cardName, copiesToAdd) {
  const key = findCardKey(cardName);
  if (key) {
    const currentLevel = calculateLevel(key);

    // Don't add copies if already at max level (14)
    if (currentLevel >= 15) {
      return; // Exit without adding copies
    }

    playerInventory[key].copies += Math.max(0, copiesToAdd);
    savePlayerInventory();
    applyFilterAndSort(); // Refresh display
  }
}

// Function to reset all cards to 0 copies
function resetAllCards() {
  Object.keys(playerInventory).forEach(cardName => {
    playerInventory[cardName].copies = 0;
  });
  savePlayerInventory();
  applyFilterAndSort();
}

// Function to get card info for debugging
function getCardInfo(cardName) {
  const key = findCardKey(cardName);
  if (!key) return null;

  const inventory = playerInventory[key];

  return {
    name: key,
    totalCopies: inventory.copies,
    currentCopies: calculateCurrentCopies(key),
    level: calculateLevel(key),
    rarity: inventory.rarity,
    requiredForNext: getCopiesRequiredForNextLevel(key)
  };
}

// Make functions available globally for testing
window.updateCardCopies = updateCardCopies;
window.addCardCopies = addCardCopies;
window.resetAllCards = resetAllCards;
window.getCardInfo = getCardInfo;

// Testing functions for the HTML interface
function testUpdateCard() {
  const cardName = document.getElementById('test-card-name').value;
  const copies = parseInt(document.getElementById('test-copies').value) || 0;

  if (findCardKey(cardName)) {
    updateCardCopies(cardName, copies);
    alert(`Updated ${cardName} to ${copies} copies`);
  } else {
    alert('Card not found or invalid input');
  }
}

function testAddCopies() {
  const cardName = document.getElementById('test-card-name').value;
  const copies = parseInt(document.getElementById('test-copies').value) || 1;

  if (findCardKey(cardName)) {
    addCardCopies(cardName, copies);
  } else {
    alert('Card not found or invalid input');
  }
}

function testGetInfo() {
  const cardName = document.getElementById('test-card-name').value;

  if (findCardKey(cardName)) {
    const info = getCardInfo(cardName);
    alert(`Card: ${info.name}
Level: ${info.level}
Rarity: ${info.rarity}
Total Copies: ${info.totalCopies}
Current Copies: ${info.currentCopies}
Required for Next: ${info.requiredForNext}`);
  } else {
    alert('Card not found');
  }
}

// Helper function to determine card type (Troop, Spell, Building)
function getCardType(cardName) {
  // Spell cards (based on the actual database)
  const spellCards = [
    'Arrows', 'Barbarian Barrel', 'Clone', 'Earthquake', 'Fireball', 'Freeze', 'Goblin Barrel', 'Goblin Curse', 'Giant Snowball', 'Graveyard', 'Lightning', 'Mirror', 'Poison', 'Rage', 'Rocket', 'Royal Delivery', 'The Log', 'Tornado', 'Void', 'Zap']
  // Building cards (based on the actual database)
  const buildingCards = [
    'Barbarian Hut', 'Bomb Tower', 'Cannon', 'Elixir Collector', 'Goblin Cage', 'Goblin Drill', 'Goblin Hut', 'Inferno Tower', 'Mortar', 'Tesla', 'Tombstone', 'X-Bow'
  ];

  if (spellCards.includes(cardName)) {
    return 'Spell';
  } else if (buildingCards.includes(cardName)) {
    return 'Building';
  } else {
    return 'Troop'; // Default to Troop for most cards
  }
}

function initializePage() {
  setPlayerCards(clashRoyaleCards);
}

const setPlayerCards = (arr = []) => {
  playerCards.innerHTML = arr.map(
    ({ name, isEvolution, elixirCost, rarity, iconUrl }) => {
      const currentLevel = calculateLevel(name);
      const currentCopies = calculateCurrentCopies(name);
      const requiredForNext = getCopiesRequiredForNextLevel(name);

      return `
      <div class="card-wrapper">
        <div class="player-card ${rarity}">
          <div class="elixir">${elixirCost}</div>
          <h2>${isEvolution ? "(Evo)" : ""} ${name}</h2>
          <img src="${iconUrl}" alt="${name}" class="card-image">
          <div class="card-bottom-section ${rarity}">
            <p class="level">Level ${currentLevel}</p>
          </div>
        </div>
        <div class="progress">
          <div class="progress-bar-container">
            ${currentLevel >= 15 ? 
              `<div class="progress-bar-fill max-level" style="width: 100%"></div>
              <p class="progress-text">MAX</p>` :
              `<div class="progress-bar-fill" style="width: ${requiredForNext > 0 ? (currentCopies / requiredForNext) * 100 : 0}%"></div>
              <p class="progress-text">${currentCopies}/${requiredForNext}</p>`}
          </div>
        </div>
      </div>
    `;

  })
    .join("");
};

// Global variables to track current filter and sort
let currentFilter = "all";
let currentSort = "id";
let ascending = true;

// Combined function to apply both filter and sort
function applyFilterAndSort() {
  if (!clashRoyaleCards) return;

  let filteredCards = [...clashRoyaleCards];

  // Apply filter
  switch (currentFilter) {
    case "troop":
      filteredCards = clashRoyaleCards.filter((player) => player.type === "Troop");
      break;
    case "spell":
      filteredCards = clashRoyaleCards.filter((player) => player.type === "Spell");
      break;
    case "building":
      filteredCards = clashRoyaleCards.filter((player) => player.type === "Building");
      break;
    case "evolution":
      filteredCards = clashRoyaleCards.filter((player) => player.isEvolution === true);
      break;
    default:
      filteredCards = [...clashRoyaleCards];
  }

  // Apply sort to filtered cards
  switch (currentSort) {
    case "id":
      filteredCards.sort((a, b) => {
        const result = a.id - b.id;
        return ascending ? result : -result;
      });
      break;
    case "name":
      filteredCards.sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return ascending ? result : -result;
      });
      break;
    case "elixir-cost":
      filteredCards.sort((a, b) => {
        const result = a.elixirCost - b.elixirCost;
        return ascending ? result : -result;
      });
      break;
    case "rarity":
      const rarityOrder = { "Common": 1, "Rare": 2, "Epic": 3, "Legendary": 4, "Champion": 5 };
      filteredCards.sort((a, b) => {
        const result = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        return ascending ? result : -result;
      });
      break;
    case "level":
      // Since all cards are level 15, this will maintain current order
      filteredCards.sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return ascending ? result : -result;
      });
      break;
  }

  setPlayerCards(filteredCards);
}

// Function to toggle sort direction
function toggleSortDirection() {
  ascending = !ascending;
  applyFilterAndSort();
  updateSortDirectionButton();
}

// Function to update the sort direction button text
function updateSortDirectionButton() {
  const button = document.getElementById('sort-direction');
  if (button) {
    button.textContent = ascending ? '▲' : '▼';
  }
}

// Event listener for filtering cards
filterDropdownList.addEventListener("change", (e) => {
  currentFilter = e.target.value;
  applyFilterAndSort();
});

//Event listener for sorting cards
sortDropdownList.addEventListener("change", (e) => {
  currentSort = e.target.value;
  applyFilterAndSort();
});

// Load the card data when the page loads
document.addEventListener('DOMContentLoaded', loadCardData);
