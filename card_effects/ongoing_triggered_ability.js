// card_effects/ongoing_triggered_ability.js

cardEffects.ongoing_triggered_ability = (gameState, player, effectTag, engine, details) => {
    const { playedCard } = details;
    if (!playedCard) return;

    const { isSuperPowerType } = engine;

    switch (effectTag) {
        case 'on_play_first_equipment_per_turn_draw_1': {
            const playsOfThisType = player.playedCardTypeCounts.get(playedCard.type) || 0;
            if (playedCard.type === 'Equipment' && playsOfThisType === 1) { 
                console.log("The Batcave triggered: drawing 1 card.");
                engine.drawCards(player, 1, gameState, { source: 'ability' })
            }
            break;
        }
        case 'on_play_first_villain_per_turn_draw_1': {
            const isVillainType = (playedCard.type === 'Villain' || playedCard.type === 'Super-Villain');
            if (isVillainType) {
                const villainCount = player.playedCardTypeCounts.get('Villain') || 0;
                const svCount = player.playedCardTypeCounts.get('Super-Villain') || 0;
                const totalVillainsPlayed = villainCount + svCount;

                if (totalVillainsPlayed === 1) {
                    console.log("Arkham Asylum triggered: drawing 1 card.");
                    engine.drawCards(player, 1, gameState, { source: 'ability' })
                }
            }
            break;
        }
        case 'on_play_first_superpower_per_turn_draw_1': { // Efekt dla Fortecy Samotności
            if (isSuperPowerType(playedCard)) {
                const totalSuperPowersPlayed = [...player.playedCards]
                    .filter(card => isSuperPowerType(card))
                    .length;

                if (totalSuperPowersPlayed === 1) {
                    console.log("Fortress of Solitude triggered: drawing 1 card.");
                    engine.drawCards(player, 1, gameState, { source: 'ability' });
                }
            }
            break;
        }
        case 'on_play_first_hero_per_turn_draw_1': {
            const playsOfThisType = player.playedCardTypeCounts.get(playedCard.type) || 0;
            if (playedCard.type === 'Hero' && playsOfThisType === 1) {
                console.log("The Watchtower triggered: drawing 1 card.");
                engine.drawCards(player, 1, gameState, { source: 'ability' })
            }
            break;
        }
        case 'on_play_first_card_per_turn_cost_eq_2_or_3_draw_1': {
            const totalPlays = player.playedCards.length;
            if ((playedCard.cost === 2 || playedCard.cost === 3) && totalPlays === 1) {
                 console.log("Titans Tower triggered: drawing 1 card.");
                 engine.drawCards(player, 1, gameState, { source: 'ability' })
            }
            break;
        }
        default:
            console.warn(`Unhandled ongoing ability: ${effectTag}`);
            break;
    }
};