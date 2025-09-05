// card_effects/ongoing_triggered_ability.js

cardEffects.ongoing_triggered_ability = (gameState, player, params, engine, details) => {
    const effectTag = params.join(':');
    const { playedCard } = details;
    if (!playedCard) return;

    // Pobieramy liczbę zagrań tego konkretnego typu karty
    const playsOfThisType = player.playedCardTypeCounts.get(playedCard.type) || 0;

    switch (effectTag) {
        case 'on_play_first_equipment_per_turn_draw_1':
            if (playedCard.type === 'Equipment' && playsOfThisType === 1) { // Sprawdzamy, czy to PIERWSZE zagranie
                console.log("The Batcave triggered: drawing 1 card.");
                drawCards(player, 1);
            }
            break;
        case 'on_play_first_villain_per_turn_draw_1':
            if (playedCard.type === 'Villain' && playsOfThisType === 1) {
                console.log("Arkham Asylum triggered: drawing 1 card.");
                drawCards(player, 1);
            }
            break;
        case 'on_play_first_superpower_per_turn_draw_1':
            if (playedCard.type === 'Super Power' && playsOfThisType === 1) {
                console.log("Fortress of Solitude triggered: drawing 1 card.");
                drawCards(player, 1);
            }
            break;
        case 'on_play_first_hero_per_turn_draw_1':
            if (playedCard.type === 'Hero' && playsOfThisType === 1) {
                console.log("The Watchtower triggered: drawing 1 card.");
                drawCards(player, 1);
            }
            break;
        case 'on_play_first_card_per_turn_cost_eq_2_or_3_draw_1':
            // Ten warunek jest unikalny - nie sprawdza typu, tylko koszt
            // Musimy sprawdzić ogólną liczbę zagranych kart
            const totalPlays = Array.from(player.playedCardTypeCounts.values()).reduce((a, b) => a + b, 0);
            if ((playedCard.cost === 2 || playedCard.cost === 3) && totalPlays === 1) {
                 console.log("Titans Tower triggered: drawing 1 card.");
                 drawCards(player, 1);
            }
            break;
        default:
            console.warn(`Unhandled ongoing ability: ${effectTag}`);
            break;
    }
};