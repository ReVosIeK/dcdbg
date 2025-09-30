/**
 * Tasuje tablicę w miejscu, używając algorytmu Fisher-Yates.
 * @param {Array} array Tablica do potasowania.
 * @returns {Array} Potasowana tablica.
 */
 export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
* Dobiera określoną liczbę kart z talii gracza na jego rękę.
* Automatycznie przetasowuje stos kart odrzuconych, jeśli talia jest pusta.
* @param {object} player Obiekt gracza.
* @param {number} count Liczba kart do dobrania.
*/


// w pliku utils.js

export function drawCards(player, count, gameState, options = {}) {
    let extraCards = 0;

    if (player.name !== "AI Player" && options.source === 'card_effect' && !player.turnFlags.flashAbilityUsed && player.superheroes.some(h => h.id === 'the_flash') && !gameState.superheroAbilitiesDisabled) {
        console.log("Flash's ability triggered: drawing 1 extra card.");
        extraCards = 1;
        player.turnFlags.flashAbilityUsed = true;
    }

    if (options.source === 'card_effect' && !player.turnFlags.flashAbilityUsed && player.superheroes.some(h => h.id === 'the_flash') && !gameState.superheroAbilitiesDisabled) {
        console.log("Flash's ability triggered: drawing 1 extra card.");
        extraCards = 1;
        player.turnFlags.flashAbilityUsed = true;
    }

    const totalToDraw = count + extraCards;
    for (let i = 0; i < totalToDraw; i++) {
        if (player.deck.length === 0) {
            if (player.discard.length === 0) {
                console.log("Player cannot draw, both deck and discard pile are empty.");
                return;
            }
            console.log("Player shuffles their discard pile to form a new deck.");
            player.deck = shuffle([...player.discard]);
            player.discard = [];
        }
        if (player.deck.length > 0) {
            player.hand.push(player.deck.pop());
        }
    }
}

// NOWA FUNKCJA
/**
 * Sprawdza, czy karta jest traktowana jako typ 'Super Power' (uwzględniając 'Kick').
 * @param {object} card Obiekt karty do sprawdzenia.
 * @returns {boolean} True, jeśli karta jest supermocą.
 */
export function isSuperPowerType(card) {
    if (!card || !card.type) return false;
    return card.type === 'Super Power' || card.type === 'Kick';
}