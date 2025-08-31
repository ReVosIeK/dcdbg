/**
 * Tasuje tablicę w miejscu, używając algorytmu Fishera-Yatesa.
 * @param {Array<any>} array - Tablica do potasowania.
 * @returns {Array<any>} - Ta sama, potasowana tablica.
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

/**
 * Dobiera określoną liczbę kart do ręki gracza.
 * W razie potrzeby tasuje stos kart odrzuconych.
 * @param {object} player - Obiekt gracza.
 * @param {number} count - Liczba kart do dobrania.
 */
function drawCards(player, count) {
    for (let i = 0; i < count; i++) {
        if (player.deck.length === 0) {
            if (player.discard.length === 0) break; // Nie ma kart do dobrania
            player.deck = shuffle([...player.discard]); // Używamy kopii, aby nie modyfikować oryginału w trakcie pętli
            player.discard = [];
            console.log("Player shuffles their discard pile to form a new deck.");
        }
        player.hand.push(player.deck.pop());
    }
}