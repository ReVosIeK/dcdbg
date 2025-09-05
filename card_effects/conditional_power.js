// card_effects/conditional_power.js

cardEffects.conditional_power = (gameState, player, params, engine) => {
    const conditionTag = params[0]; // np. "if_card_type_played_this_turn_superpower_or_equipment_then_3_else_1"

    // --- OBSŁUGA WARUNKU ZAGRANIA KARTY DANEGO TYPU ---
    if (conditionTag.startsWith('if_card_type_played_this_turn')) {
        const parts = conditionTag.split('_'); // Dzielimy tag na części
        const thenIndex = parts.indexOf('then');
        const elseIndex = parts.indexOf('else');

        // Wyciągamy typy kart do sprawdzenia (wszystko pomiędzy 'turn' a 'then')
        const typesToCheck = parts.slice(parts.indexOf('turn') + 1, thenIndex); 
        // Wyciągamy wartości Mocy
        const powerIfTrue = parseInt(parts[thenIndex + 1], 10);
        const powerIfFalse = parseInt(parts[elseIndex + 1], 10);

        // Sprawdzamy, czy jakikolwiek z wymaganych typów kart został zagrany
        const conditionMet = typesToCheck.some(type => {
            // Konwersja z 'superpower' na 'Super Power'
            const formattedType = type === 'superpower' ? 'Super Power' : type.charAt(0).toUpperCase() + type.slice(1);
            return player.playedCardTypeCounts.has(formattedType);
        });

        gameState.currentPower += conditionMet ? powerIfTrue : powerIfFalse;
        return;
    }

    // --- OBSŁUGA WARUNKU PUSTEGO STOSU KART ODRZUCONYCH ---
    if (conditionTag.startsWith('if_discard_pile_empty')) {
        const parts = conditionTag.split('_');
        const powerIfTrue = parseInt(parts[parts.indexOf('then') + 1], 10);
        const powerIfFalse = parseInt(parts[parts.indexOf('else') + 1], 10);

        const isDiscardEmpty = player.discard.length === 0;
        gameState.currentPower += isDiscardEmpty ? powerIfTrue : powerIfFalse;
        return;
    }
};