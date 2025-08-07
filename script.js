const playerCards = document.getElementById("player-cards");
const filterDropdownList = document.getElementById("players");
const sortDropdownList = document.getElementById("sorting");

let clashRoyaleCards = null;

async function loadCardData() {
  try {
    const response = await fetch('./clashroyaledb.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Extract only the required fields from each card
    clashRoyaleCards = data.items.map(card => ({
      name: card.name,
      type: getCardType(card.name), // We'll determine card type based on name or other logic
      isEvolution: card.maxEvolutionLevel > 0,
      elixirCost: card.elixirCost,
      rarity: card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1), // Capitalize first letter
      iconUrl: card.maxEvolutionLevel > 0 && card.iconUrls.evolutionMedium
        ? card.iconUrls.evolutionMedium
        : card.iconUrls.medium
    }));

    Object.freeze(clashRoyaleCards);
    initializePage();
  } catch (error) {
    console.error('Error loading card data:', error);
    playerCards.innerHTML = '<p class="error">Error loading card data.</p>';
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
    ({ name, type, level, copies, isEvolution, elixirCost, rarity, iconUrl }) => {
      return `
        <div>
          <div class="player-card ${rarity}">
            <div class="elixir">${elixirCost}</div>
            <h2>${isEvolution ? "(Evo)" : ""} ${name}</h2>
            <img src="${iconUrl}" alt="${name}" class="card-image">
            <div class="card-bottom-section ${rarity}">
              <p class="level">Level 15 </p>
            </div>
          </div>
          <div class="progress">
            <p>9999/9999</p>
          </div>
        </div>
      ` }
  )
    .join("");
};

// Global variables to track current filter and sort
let currentFilter = "all";
let currentSort = "name";
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
