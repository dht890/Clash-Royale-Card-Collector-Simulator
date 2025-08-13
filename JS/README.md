# Clash Royale Card Collector Simulator - Modular Structure

This project has been refactored into a modular structure for better maintainability and organization.

## Module Structure

### 1. `api.js` - API and Data Loading
- **CardDataAPI class**: Handles all API calls and data loading
- **Functions**:
  - `loadCardData()`: Loads card data from JSON
  - `loadRarityData()`: Loads rarity/upgrade data
  - `getCardType()`: Determines card type (Troop/Spell/Building)

### 2. `cardManager.js` - Card Management
- **CardManager class**: Manages player inventory and card calculations
- **Functions**:
  - `calculateLevel()`: Calculates current card level
  - `calculateCurrentCopies()`: Calculates available copies after leveling
  - `addCardCopies()`: Adds copies to cards
  - `updateCardCopies()`: Updates card copies
  - `resetAllCards()`: Resets all cards to 0
  - `addRandomCopies()`: Adds random copies based on rarity weights

### 3. `ui.js` - User Interface
- **CardUI class**: Handles all UI rendering and display
- **Functions**:
  - `setPlayerCards()`: Renders cards to the DOM
  - `showError()`: Shows error messages
  - `showLoading()`: Shows loading state

### 4. `filters.js` - Filtering and Sorting
- **CardFilters class**: Handles card filtering and sorting logic
- **Functions**:
  - `applyFilterAndSort()`: Applies current filters and sorting
  - `setFilter()`: Sets the current filter
  - `setSort()`: Sets the current sort method
  - `toggleSortDirection()`: Toggles ascending/descending order

### 5. `utils.js` - Testing and Utility Functions
- **TestingUtils class**: Contains testing functions
- **Functions**:
  - `makeGlobalTestingFunctions()`: Makes testing functions available globally
  - Various test functions for development

### 6. `app.js` - Main Application
- **ClashRoyaleApp class**: Main application coordinator
- **Functions**:
  - `initialize()`: Sets up the entire application
  - `applyFilterAndSort()`: Coordinates filtering and sorting
  - Event listener management

## How to Use

### Basic Usage
The application automatically initializes when the page loads. All modules work together seamlessly.

### Adding New Features
1. **New API calls**: Add to `CardDataAPI` class in `api.js`
2. **New card logic**: Add to `CardManager` class in `cardManager.js`
3. **New UI elements**: Add to `CardUI` class in `ui.js`
4. **New filters**: Add to `CardFilters` class in `filters.js`

### Testing Functions
All testing functions are still available globally:
- `testRandomCopies()`: Add random copies
- `testAddCopies()`: Add specific copies to a card
- `testUpdateCard()`: Unlock all cards
- `resetAllCards()`: Reset all cards
- `testGetInfo()`: Get card information

## Benefits of Modular Structure

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Maintainability**: Easier to find and fix issues
3. **Reusability**: Modules can be reused in other projects
4. **Testing**: Easier to test individual components
5. **Scalability**: Easier to add new features
6. **Code Organization**: Clear structure makes code easier to understand

## File Dependencies

```
app.js (main)
├── api.js
├── cardManager.js (depends on api.js)
├── ui.js (depends on cardManager.js)
├── filters.js (depends on cardManager.js)
└── utils.js (depends on cardManager.js)
```

## Migration from Old Structure

The old `script.js` file has been completely replaced. All functionality has been preserved and organized into logical modules. The application behavior remains exactly the same from a user perspective.
