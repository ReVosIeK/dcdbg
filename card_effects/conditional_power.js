// card_effects/conditional_power.js - PRZYWRÓCONA WERSJA

cardEffects.conditional_power = (gameState, player, conditionTag, engine) => {
    
    if (conditionTag.startsWith('if_player_controls_type_location')) {
        const parts = conditionTag.split('_');
        const powerIfTrue = parseInt(parts[parts.indexOf('then') + 1], 10);
        const powerIfFalse = parseInt(parts[parts.indexOf('else') + 1], 10);
        const conditionMet = player.ongoing.length > 0;
        gameState.currentPower += conditionMet ? powerIfTrue : powerIfFalse;
        return;
    }

    if (conditionTag.startsWith('if_card_type_played_this_turn')) {
        const allPlayedCards = [...player.playedCards, ...player.ongoing];
        const parts = conditionTag.split('_');
        const thenIndex = parts.indexOf('then');
        const elseIndex = parts.indexOf('else');
        const typesToCheck = parts.slice(parts.indexOf('turn') + 1, thenIndex);
        const powerIfTrue = parseInt(parts[thenIndex + 1], 10);
        const powerIfFalse = parseInt(parts[elseIndex + 1], 10);

        // Sprawdzamy karty zagrane DO TEJ PORY
        const conditionMet = typesToCheck.some(type => {
            const formattedType = type === 'superpower' ? 'Super Power' : type.charAt(0).toUpperCase() + type.slice(1);
            return allPlayedCards.some(card => card.type === formattedType);
        });
        gameState.currentPower += conditionMet ? powerIfTrue : powerIfFalse;
        return;
    }

    if (conditionTag.startsWith('if_discard_pile_empty')) {
        const parts = conditionTag.split('_');
        const powerIfTrue = parseInt(parts[parts.indexOf('then') + 1], 10);
        const powerIfFalse = parseInt(parts[parts.indexOf('else') + 1], 10);
        const isDiscardEmpty = player.discard.length === 0;
        gameState.currentPower += isDiscardEmpty ? powerIfTrue : powerIfFalse;
        return;
    }
};