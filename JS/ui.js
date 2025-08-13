// UI Rendering Module
export class CardUI {
  constructor(cardManager) {
    this.cardManager = cardManager;
    this.playerCards = document.getElementById("player-cards");
  }

  setPlayerCards(arr = []) {
    // Optionally move locked cards to the end
    const sortedArr = [...arr].sort((a, b) => {
      const lockedA = this.cardManager.getInventory()[a.name]?.locked;
      const lockedB = this.cardManager.getInventory()[b.name]?.locked;
      return lockedA === lockedB ? 0 : lockedB ? -1 : 1;
    });

    this.playerCards.innerHTML = sortedArr.map(
      ({ name, isEvolution, elixirCost, rarity, iconUrl, id }) => {
        const locked = this.cardManager.calculateLevel(name) === 0;
        const currentLevel = this.cardManager.calculateLevel(name);
        const currentCopies = this.cardManager.calculateCurrentCopies(name);
        const requiredForNext = this.cardManager.getCopiesRequiredForNextLevel(name);

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
  }

  showError(message) {
    this.playerCards.innerHTML = `<p class="error">${message}</p>`;
  }

  showLoading() {
    this.playerCards.innerHTML = '<p class="loading">Loading card data...</p>';
  }
}
