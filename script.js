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

function initializeLockedStatus() {
  Object.keys(playerInventory).forEach(cardName => {
    playerInventory[cardName].locked = (playerInventory[cardName].copies <= 0);
  });
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
            level: 0,
            rarity: card.rarity,
          };
        }
      });
    }

    // Load saved inventory from localStorage if available
    loadPlayerInventory();
    initializeLockedStatus();
  
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
  if (!card || card.copies <= 0) return 0; // Level 0 = locked

  const rarity = card.rarity;
  const copies = card.copies;
  const upgrades = rarityData.rarityUpgrades[rarity].upgrades;
  let currentLevel = getStartingLevel(rarity);
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
    playerInventory[key].locked = playerInventory[key].copies <= 0;
    savePlayerInventory();
    applyFilterAndSort(); // Refresh display
  }
}

// Function to add copies to a card
function addCardCopies(cardName, copiesToAdd) {
  const key = findCardKey(cardName);
  if (key) {
    const currentLevel = calculateLevel(key);

    // Don't add copies if already at max level (15)
    if (currentLevel >= 15) {
      return; // Exit without adding copies
    }

    playerInventory[key].copies += Math.max(0, copiesToAdd);
    playerInventory[key].locked = playerInventory[key].copies <= 0;
    savePlayerInventory();
    applyFilterAndSort(); // Refresh display
  }
}

// Function to reset all cards to 0 copies
function resetAllCards() {
  Object.keys(playerInventory).forEach(cardName => {
    playerInventory[cardName].copies = 0;
    playerInventory[cardName].level = 0;
    playerInventory[cardName].locked = true;
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
  Object.keys(playerInventory).forEach(cardName => {
    updateCardCopies(cardName, 1)
  })
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

function testRandomCopies() {
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
  for (const cardName of Object.keys(playerInventory)) {
    const rarity = playerInventory[cardName].rarity;
    const weight = rarityWeights[rarity] || 1;
    for (let i = 0; i < weight; i++) {
      pool.push(cardName);
    }
  }

  // Pick random card from weighted pool
  const randomCard = pool[Math.floor(Math.random() * pool.length)];
  const rarity = playerInventory[randomCard].rarity;

  // Determine copies based on rarity's range
  const [minCopies, maxCopies] = rarityCopyRanges[rarity] || [1, 1];
  const randomCopies = Math.floor(Math.random() * (maxCopies - minCopies + 1)) + minCopies;

  // Add the copies
  addCardCopies(randomCard, randomCopies);

  // Optional: Show alert
  alert(`Added ${randomCopies} copies to ${randomCard} (${rarity})`);
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
  resetAllCards();
  setPlayerCards(clashRoyaleCards);
}

const setPlayerCards = (arr = []) => {
  // Optionally move locked cards to the end
  const sortedArr = [...arr].sort((a, b) => {
    const lockedA = playerInventory[a.name]?.locked;
    const lockedB = playerInventory[b.name]?.locked;
    return lockedA === lockedB ? 0 : lockedB ? -1 : 1;
  });

  playerCards.innerHTML = sortedArr.map(
    ({ name, isEvolution, elixirCost, rarity, iconUrl, id }) => {
      const locked = calculateLevel(name) === 0;
      const currentLevel = calculateLevel(name);
      const currentCopies = calculateCurrentCopies(name);
      const requiredForNext = getCopiesRequiredForNextLevel(name);

      return `
        <div class="card-wrapper">
          <div class="player-card ${rarity} ${locked ? 'locked' : ''}">
            <div class="elixir">${elixirCost}</div>
            <h2>${isEvolution ? "(Evo)" : ""} ${name}</h2>
            <img src="${iconUrl}" alt="${name}" class="card-image">
              <div class="card-bottom-section ${rarity}">
                <p class="level">${currentLevel === 0 ? "Locked" : `Level: ${currentLevel}`}</p>
              </div>
          </div>
            <div class="progress">
              <div class="progress-bar-container">
                ${currentLevel >= 15 ?
          `<div class="progress-bar-fill max-level" style="width: 100%"></div>
                  <p class="progress-text">MAX</p>` :
          `<div class="progress-bar-fill" style="width: ${requiredForNext > 0 ? (currentCopies / requiredForNext) * 100 : 0}%"></div>
                  <p class="progress-text">${currentCopies}/${requiredForNext}</p>`
        }
              </div>
            </div>
        </div>
      `;
    }
  ).join("");
};


// Global variables to track current filter and sort
let currentFilter = "all";
let currentSort = "level";
let ascending = true;

// Combined function to apply both filter and sort
function applyFilterAndSort() {
  if (!clashRoyaleCards) return;

  let filteredCards = [...clashRoyaleCards]

  // Apply filter
  switch (currentFilter) {
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
      filteredCards = filteredCards.filter(card => playerInventory[card.name]?.locked);
      break;
    case "unlocked":
      filteredCards = filteredCards.filter(card => !playerInventory[card.name]?.locked);
      break;
    default:
      // "all"
      break;
  }

  // Apply sort
  filteredCards.sort((a, b) => {
    const lockedA = playerInventory[a.name]?.locked;
    const lockedB = playerInventory[b.name]?.locked;

    // Always prioritize unlocked first
    if (lockedA !== lockedB) {
      return lockedA ? 1 : -1;
    }

    // Now sort based on currentSort
    let result = 0;
    let levelA = calculateLevel(a.name);
    let levelB = calculateLevel(b.name);

    switch (currentSort) {
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

    return ascending ? result : -result;
  });

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
