cardEffects.draw = (gameState, player, effectTag, engine) => {
    const cardsToDraw = parseInt(effectTag, 10);
    if (!isNaN(cardsToDraw)) {
        drawCards(player, cardsToDraw);
    }
};