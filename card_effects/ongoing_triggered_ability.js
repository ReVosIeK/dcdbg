cardEffects.ongoing_triggered_ability = (gameState, player, params, engine, details) => {
    const effectTag = params.join(':');
    const { playedCard, playsOfThisType } = details;
    if (!playedCard) return;
    if (effectTag === 'on_play_first_equipment_per_turn_draw_1') {
        if (playedCard.type === 'Equipment' && playsOfThisType === 0) {
            console.log("The Batcave triggered: drawing 1 card.");
            drawCards(player, 1);
        }
    }
};