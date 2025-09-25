cardEffects.draw = (gameState, player, effectTag, engine) => {
    const cardsToDraw = parseInt(effectTag, 10);
    if (!isNaN(cardsToDraw)) {
        engine.drawCards(player, cardsToDraw, gameState, { source: 'card_effect' }); // ZMIANA
    }
};