// utils.js

/**
 * Tasuje tablicę w miejscu, używając algorytmu Fisher-Yates.
 * @param {Array} array Tablica do potasowania.
 * @returns {Array} Potasowana tablica.
 */
 function shuffle(array) {
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
function drawCards(player, count, options = {}) {
    let extraCards = 0;
    // Zdolność Flasha: pierwszy efekt dobrania kart w turze daje +1 kartę
    if (options.source === 'card_effect' && !player.turnFlags.flashAbilityUsed && player.superheroes.some(h => h.id === 'the_flash')) {
        console.log("Flash's ability triggered: drawing 1 extra card.");
        extraCards = 1;
        player.turnFlags.flashAbilityUsed = true; // Użyj flagi, aby nie uruchomić ponownie w tej turze
    }
    
    for (let i = 0; i < count + extraCards; i++) {
        if (player.deck.length === 0) {
            if (player.discard.length === 0) {
                console.log("Player cannot draw, both deck and discard pile are empty.");
                return;
            }
            console.log("Player shuffles their discard pile to form a new deck.");
            player.deck = shuffle([...player.discard]);
            player.discard = [];
        }
        player.hand.push(player.deck.pop());
    }
}