// card_effects/on_play_effect.js

function parseTypeFromTag(typeString) {
    switch (typeString) {
        case 'superpower': return 'Super Power';
        default: return typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
}

cardEffects.on_play_effect = async (gameState, player, effectTag, engine, details) => {

    console.log(`[DEBUG] Uruchomiono on_play_effect z tagiem: ${effectTag}`);

    if (effectTag.startsWith('reduce_cost_to_defeat_sv_by_')) {
        const parts = effectTag.split('_');
        const byIndex = parts.indexOf('by');
        const amount = parseInt(parts[byIndex + 1], 10);
        if (!isNaN(amount)) {
            gameState.superVillainCostModifier += amount;
            engine.renderGameBoard();
        }
    } else if (effectTag.startsWith('move_card_from_discard_to_hand')) {
        const parts = effectTag.split('_');
        const cardType = parseTypeFromTag(parts[parts.length - 1]);
        const validChoices = player.discard.filter(card => card.type === cardType);
        if (validChoices.length > 0) {
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(`Wybierz ${cardType} do wzięcia na rękę:`, validChoices, { selectionCount: 1 });
            const chosenCardInstanceId = Array.isArray(chosenCardInstanceIdArr) ? chosenCardInstanceIdArr[0] : chosenCardInstanceIdArr;
            if (chosenCardInstanceId) {
                const cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [movedCard] = player.discard.splice(cardIndex, 1);
                    player.hand.push(movedCard);
                }
            }
        }
    } else if (effectTag === 'move_all_cards_type_superpower_from_discard_to_hand') {
        const cardsToMove = [];
        const newDiscard = [];
        for (const card of player.discard) {
            if (card.type === 'Super Power') {
                cardsToMove.push(card);
            } else {
                newDiscard.push(card);
            }
        }
        if (cardsToMove.length > 0) {
            player.discard = newDiscard;
            player.hand.push(...cardsToMove);
            console.log(`Man of Steel moved ${cardsToMove.length} Super Power(s) to hand.`);
        }
    } else if (effectTag === 'may_move_cards_from_discard_to_bottom_of_deck_choice_count_2') {
        if (player.discard.length === 0) return;
        const useAbility = await engine.promptConfirmation('Czy chcesz przełożyć karty ze stosu kart odrzuconych na spód swojej talii?');
        if (!useAbility) return;
        const maxToMove = Math.min(2, player.discard.length);
        const chosenCardIds = await engine.promptPlayerChoice(
            `Wybierz do ${maxToMove} kart do przełożenia:`,
            player.discard,
            { selectionCount: maxToMove, isCancellable: true, canSelectLess: true }
        );
        if (chosenCardIds && chosenCardIds.length > 0) {
            const cardsToMove = [];
            chosenCardIds.forEach(id => {
                const card = player.discard.find(c => c.instanceId === id);
                if (card) cardsToMove.push(card);
            });
            player.discard = player.discard.filter(card => !chosenCardIds.includes(card.instanceId));
            player.deck.splice(0, 0, ...cardsToMove);
            console.log(`Zatanna moved ${cardsToMove.length} card(s) to the bottom of the deck.`);
        }
    } else if (effectTag === 'gain_all_type_villain_from_lineup_cost_le_7') {
        const cardsToGain = [];
        const newLineUp = gameState.lineUp.map(card => {
            if (card && card.type === 'Villain' && card.cost <= 7) {
                cardsToGain.push(card);
                return null;
            }
            return card;
        });
        if (cardsToGain.length > 0) {
            gameState.lineUp = newLineUp;
            console.log(`Princess Diana is gaining ${cardsToGain.length} Villain(s) from the Line-Up.`);
            for (const card of cardsToGain) {
                await engine.gainCard(player, card);
            }
        }
    } else if (effectTag === 'gain_all_type_equipment_from_lineup') {
        const cardsToGain = [];
        const newLineUp = gameState.lineUp.map(card => {
            if (card && card.type === 'Equipment') {
                cardsToGain.push(card);
                return null;
            }
            return card;
        });
        if (cardsToGain.length > 0) {
            gameState.lineUp = newLineUp;
            console.log(`Dark Knight is gaining ${cardsToGain.length} Equipment(s).`);
            for (const card of cardsToGain) {
                await engine.gainCard(player, card);
            }
        }
    } else if (effectTag.startsWith('may_destroy_card_from_hand_or_discard')) {
        const validChoices = [...player.hand, ...player.discard];
        if (validChoices.length > 0) {
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice('Wybierz kartę do zniszczenia:', validChoices);
            const chosenCardInstanceId = Array.isArray(chosenCardInstanceIdArr) ? chosenCardInstanceIdArr[0] : chosenCardInstanceIdArr;
            if (chosenCardInstanceId) {
                let cardIndex = player.hand.findIndex(c => c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [destroyedCard] = player.hand.splice(cardIndex, 1);
                    gameState.destroyedPile.push(destroyedCard);
                } else {
                    cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = player.discard.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                    }
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
    } else if (effectTag.startsWith('gain_card_from_lineup_choice_cost_le_')) {
        const maxCost = parseInt(effectTag.split('_').pop(), 10);
        const validChoices = gameState.lineUp.filter(card => card && card.cost <= maxCost);
        if (validChoices.length > 0) {
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(`Wybierz kartę (koszt ${maxCost} lub mniej) do zdobycia:`, validChoices, { selectionCount: 1 });
            const chosenCardInstanceId = Array.isArray(chosenCardInstanceIdArr) ? chosenCardInstanceIdArr[0] : chosenCardInstanceIdArr;
            if (chosenCardInstanceId) {
                const cardIndex = gameState.lineUp.findIndex(c => c && c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [gainedCard] = gameState.lineUp.splice(cardIndex, 1, null);
                    await engine.gainCard(player, gainedCard);
                }
            }
        }
    } else if (effectTag === 'play_again_card_choice_from_played_this_turn') {
        if (!player.playedCards || player.playedCards.length === 0) return;
        const validChoices = player.playedCards.filter(c => c && c.id !== 'clayface');
        if (validChoices.length > 0) {
            const selection = await engine.promptPlayerChoice('Wybierz kartę do zagrania ponownie:', validChoices);
            const chosenCardInstanceId = Array.isArray(selection) ? selection[0] : selection;
            if (chosenCardInstanceId) {
                const cardToReplay = validChoices.find(c => c.instanceId === chosenCardInstanceId);
                if (cardToReplay) {
                    console.log(`[Clayface] Ponowne zagranie karty: ${cardToReplay.name_en || cardToReplay.id}`);
                    const playsOfThisType = player.playedCardTypeCounts.get(cardToReplay.type) || 0;
                    player.playedCardTypeCounts.set(cardToReplay.type, playsOfThisType + 1);
                    for (const locationCard of player.ongoing) {
                        if (!locationCard || locationCard.instanceId === cardToReplay.instanceId) continue;
                        for (const tag of locationCard.effect_tags) {
                            await engine.applyCardEffect(tag, gameState, player, { playedCard: cardToReplay });
                        }
                    }
                    // Moc z karty i jej efektów zostanie dodana przez recalculatePower po zakończeniu pętli w handlePlayerHandClick
                    engine.recalculatePower();
                    engine.renderGameBoard();
                }
            }
        }
    } else if (effectTag === 'reveal_deck_top_1_then_may_destroy_revealed') {
        if (player.deck.length === 0) return;
        const topCard = player.deck[player.deck.length - 1];
        const userWantsToDestroy = await engine.promptWithCard(
            "Czy chcesz zniszczyć tę kartę z wierzchu swojej talii?",
            topCard,
            [
                { text: 'Zniszcz', value: true },
                { text: 'Zostaw', value: false, isSecondary: true }
            ]
        );
        if (userWantsToDestroy) {
            const destroyedCard = player.deck.pop();
            gameState.destroyedPile.push(destroyedCard);
            console.log(`Nth Metal destroyed ${destroyedCard.name_en} from the top of the deck.`);
        } else {
            console.log(`Nth Metal left ${topCard.name_en} on top of the deck.`);
        }
    } else if (effectTag.startsWith('register_trigger_on_play_id_catwoman')) {
        const newTrigger = {
            condition: { on: 'play', id: 'catwoman' },
            effectTag: 'internal_effect:dark_knight_combo'
        };
        player.turnTriggers.push(newTrigger);
        console.log('Dark Knight trigger has been set.');
    } else {
        console.warn(`Unknown on_play_effect tag: ${effectTag}`);
    }
};

// Efekty, które nie są 'on_play_effect' mogą potrzebować osobnych plików lub być wywoływane inaczej
cardEffects.internal_effect = async (gameState, player, effectTag, engine, details) => {
    if (effectTag === 'dark_knight_combo') {
    if (player.gainedCardsThisTurn.length > 0) {
        const useAbility = await engine.promptWithCard(
            t('catwoman_combo_prompt_text'), // Nowy, prostszy klucz tłumaczenia
            player.gainedCardsThisTurn,      // Przekazujemy całą tablicę kart!
            [
                { text: t('yes'), value: true },
                { text: t('no'), value: false, isSecondary: true }
            ]
        );
            
            if (useAbility) {
                const gainedCardIds = player.gainedCardsThisTurn.map(c => c.instanceId);
                const cardsToMove = player.discard.filter(c => gainedCardIds.includes(c.instanceId));
                
                if(cardsToMove.length > 0) {
                    player.discard = player.discard.filter(c => !gainedCardIds.includes(c.instanceId));
                    player.hand.push(...cardsToMove);
                    console.log(`Dark Knight (Catwoman combo): Moved ${cardsToMove.length} card(s) to hand.`);
                }
            }
        }
    }
};