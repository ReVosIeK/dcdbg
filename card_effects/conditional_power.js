cardEffects.conditional_power = (gameState, player, params, engine) => {
    const conditionTag = params[0];
    if (conditionTag.includes('if_card_type_played_this_turn')) {
        const conditionMet = player.playedCardTypes.has('Super Power') || player.playedCardTypes.has('Equipment');
        gameState.currentPower += conditionMet ? 3 : 1;
        return;
    }
    if (conditionTag.includes('if_discard_pile_empty')) {
        const isDiscardEmpty = player.discard.length === 0;
        gameState.currentPower += isDiscardEmpty ? 4 : 2;
        return;
    }
};