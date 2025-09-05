cardEffects.draw = (gameState, player, params, engine) => {
  const cardsToDraw = parseInt(params[0], 10);
  if (!isNaN(cardsToDraw)) {
      drawCards(player, cardsToDraw);
  }
};