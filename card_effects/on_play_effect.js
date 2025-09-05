function parseTypeFromTag(typeString) {
    switch (typeString) {
        case 'superpower': return 'Super Power';
        default: return typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
}
cardEffects.on_play_effect = async (gameState, player, params, engine) => {
    const effectTag = params.join(':');
    const command = effectTag.split('_')[0];

    // ================== LOG DIAGNOSTYCZNY #3 ==================
    console.log(`[DEBUG] Efekt 'on_play_effect' został wywołany z komendą: '${command}' (pełny tag: ${effectTag})`);
    // ==========================================================

    switch (command) {
        case 'move': {
            console.log("[DEBUG] Rozpoznano komendę 'move'.");
            const parts = effectTag.split('_');
            const cardType = parseTypeFromTag(parts[parts.length - 1]);
            const validChoices = player.discard.filter(card => card.type === cardType);
            if (validChoices.length === 0) return;
            const chosenCardInstanceId = await engine.promptPlayerChoice(`Wybierz ${cardType} do wzięcia na rękę:`, validChoices);
            if (chosenCardInstanceId) {
                const cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [movedCard] = player.discard.splice(cardIndex, 1);
                    player.hand.push(movedCard);
                }
            }
            break;
        }
        case 'may': {
            console.log("[DEBUG] Rozpoznano komendę 'may'.");
            if (effectTag.startsWith('may_destroy_card_from_hand_or_discard')) {
                const validChoices = [...player.hand, ...player.discard];
                if (validChoices.length === 0) return;
                const chosenCardInstanceId = await engine.promptPlayerChoice('Wybierz kartę do zniszczenia:', validChoices);
                if (chosenCardInstanceId) {
                    let found = false;
                    let cardIndex = player.hand.findIndex(c => c.instanceId === chosenCardInstanceId);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = player.hand.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                        found = true;
                    }
                    if (!found) {
                        cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                        if (cardIndex !== -1) {
                            const [destroyedCard] = player.discard.splice(cardIndex, 1);
                            gameState.destroyedPile.push(destroyedCard);
                        }
                    }
                }
            } else if (effectTag === 'may_gain_card_type_kick_from_kick_stack_to_hand') {
                if (gameState.kickStack.length > 0) {
                    const userConfirmed = await engine.promptConfirmation("Czy chcesz wziąć kartę 'Kopniak' (Kick) na rękę?");
                    if (userConfirmed) {
                        const gainedCard = gameState.kickStack.shift();
                        player.hand.push(gainedCard);
                    }
                }
            }
            break;
        }
        case 'gain': {
            console.log("[DEBUG] Rozpoznano komendę 'gain'.");
            const parts = effectTag.split('_');
            const maxCost = parseInt(parts[parts.length - 1], 10);
            const validChoices = gameState.lineUp.filter(card => card && card.cost <= maxCost);
            if (validChoices.length === 0) return;
            const chosenCardInstanceId = await engine.promptPlayerChoice(`Wybierz kartę (koszt ${maxCost} lub mniej) do zdobycia:`, validChoices);
            if (chosenCardInstanceId) {
                const cardIndex = gameState.lineUp.findIndex(c => c && c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [gainedCard] = gameState.lineUp.splice(cardIndex, 1, null);
                    await engine.gainCard(player, gainedCard);
                }
            }
            break;
        }
        case 'choice': {
            console.log("[DEBUG] Rozpoznano komendę 'choice'. Uruchamianie modala...");
            const parts = effectTag.split('_');
            const drawCount = parseInt(parts[2], 10);
            const powerAmount = parseInt(parts[6], 10);
            const userChoiceIsDraw = await engine.promptConfirmation(
                `Wybierz efekt: Dobierz ${drawCount} karty czy zyskaj +${powerAmount} Mocy?`,
                `Dobierz ${drawCount} karty`,
                `+${powerAmount} Mocy`
            );
            if (userChoiceIsDraw) {
                drawCards(player, drawCount);
            } else {
                gameState.currentPower += powerAmount;
            }
            break;
        }
        case 'play': {
            if (effectTag === 'play_again_card_choice_from_played_this_turn') {
                if (!player.playedCards || player.playedCards.length === 0) return;

                // wybieramy karty zagrane wcześniej w tej turze, bez Clayface
                const validChoices = player.playedCards.filter(c => c && c.id !== 'clayface');
                if (validChoices.length === 0) return;

                const selection = await engine.promptPlayerChoice('Wybierz kartę do zagrania ponownie:', validChoices);
                const chosenCardInstanceId = Array.isArray(selection) ? selection[0] : selection;
                if (!chosenCardInstanceId) return;

                const cardToReplay = validChoices.find(c => c.instanceId === chosenCardInstanceId);
                if (!cardToReplay) return;

                console.log(`[Clayface] Ponowne zagranie karty: ${cardToReplay.name_en || cardToReplay.id}`);

                // 1) tylko licznik typu — NIE dodajemy ponownie do playedCards
                const playsOfThisType = player.playedCardTypeCounts.get(cardToReplay.type) || 0;
                player.playedCardTypeCounts.set(cardToReplay.type, playsOfThisType + 1);

                // 2) triggery z lokacji
                for (const locationCard of player.ongoing) {
                    if (!locationCard || locationCard.instanceId === cardToReplay.instanceId) continue;
                    const locTags = Array.isArray(locationCard.effect_tags) ? locationCard.effect_tags : [];
                    for (const tag of locTags) {
                        await engine.applyCardEffect(tag, gameState, player, { playedCard: cardToReplay, playsOfThisType });
                    }
                }

                // 3) moc i wszystkie efekty karty
                gameState.currentPower += cardToReplay.power || 0;
                const replayTags = Array.isArray(cardToReplay.effect_tags) ? cardToReplay.effect_tags : [];
                for (const tag of replayTags) {
                    await engine.applyCardEffect(tag, gameState, player, {});
                }

                engine.renderGameBoard();
            }
            break;
        }
    case 'bottom': {
            if (effectTag.startsWith('bottom_deck_hand_cards_cost_ge_1_then_draw')) {
                const validChoices = player.hand.filter(c => c.cost >= 1);
                if (validChoices.length === 0) return;

                const useAbility = await engine.promptConfirmation("Czy chcesz odłożyć karty z ręki na spód talii, aby dobrać nowe?");
                if (!useAbility) return;
                
                const chosenCardIds = await engine.promptPlayerChoice(
                    'Wybierz karty, które chcesz odłożyć:', 
                    validChoices,
                    // Gracz może wybrać od 0 do wszystkich pasujących kart
                    { selectionCount: validChoices.length, isCancellable: true, canSelectLess: true }
                );

                if (chosenCardIds && chosenCardIds.length > 0) {
                    const cardsToMove = [];
                    chosenCardIds.forEach(instanceId => {
                        const cardIndex = player.hand.findIndex(c => c.instanceId === instanceId);
                        if (cardIndex !== -1) {
                            cardsToMove.push(player.hand.splice(cardIndex, 1)[0]);
                        }
                    });
                    
                    // Umieść karty na spodzie talii
                    player.deck.splice(0, 0, ...cardsToMove);
                    
                    // Dobierz tyle samo kart
                    drawCards(player, cardsToMove.length);
                }
            }
            break;
        }
        default:
            console.warn(`Unknown on_play_effect tag: ${effectTag}`);
    }
};