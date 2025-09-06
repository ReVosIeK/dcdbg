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
    } else if (effectTag.startsWith('register_trigger_on_play_id_catwoman')) {
        const newTrigger = {
            condition: { on: 'play', id: 'catwoman' },
            effectTag: 'internal_effect:dark_knight_combo'
        };
        player.turnTriggers.push(newTrigger);
        console.log('Dark Knight trigger has been set.');
    // --- POPRAWKA TUTAJ ---
    } else if (effectTag.startsWith('may_destroy_cards_from_hand_or_discard')) { // Dodano 's' do 'cards'
        const validChoices = [...player.hand, ...player.discard];
        if (validChoices.length === 0) return;

        let maxCount = 1;
        if (effectTag.includes('_count_le_')) {
            maxCount = parseInt(effectTag.split('_count_le_')[1], 10);
        } else if (effectTag.includes('_count_')) {
            maxCount = parseInt(effectTag.split('_count_')[1], 10);
        }
        
        const actualMax = Math.min(maxCount, validChoices.length);

        const useAbility = await engine.promptConfirmation(`Czy chcesz zniszczyć do ${actualMax} kart z ręki lub stosu kart odrzuconych?`);
        if (!useAbility) return;

        const chosenCardIds = await engine.promptPlayerChoice(
            `Wybierz do ${actualMax} kart do zniszczenia:`,
            validChoices,
            { selectionCount: actualMax, isCancellable: true, canSelectLess: true }
        );

        if (chosenCardIds && chosenCardIds.length > 0) {
            const cardsToDestroy = [];
            
            chosenCardIds.forEach(id => {
                const card = validChoices.find(c => c.instanceId === id);
                if (card) cardsToDestroy.push(card);
            });
            
            gameState.destroyedPile.push(...cardsToDestroy);

            player.hand = player.hand.filter(card => !chosenCardIds.includes(card.instanceId));
            player.discard = player.discard.filter(card => !chosenCardIds.includes(card.instanceId));
            
            console.log(`Destroyed ${cardsToDestroy.length} card(s).`);
            engine.renderGameBoard();
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
                    console.log(`[Clayface] Replaying card: ${cardToReplay.name_pl}`);
                    await engine.playCard(cardToReplay, { isTemporary: true });
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
    } else if (effectTag === 'play_card_from_lineup_choice_type_equipment_hero_superpower_then_return_eot') {
        const validChoices = gameState.lineUp.filter(card => card && ['Equipment', 'Hero', 'Super Power'].includes(card.type));
        if (validChoices.length === 0) return;
        const chosenIdArr = await engine.promptPlayerChoice('Wybierz kartę z Line-Upu do zagrania:', validChoices, { selectionCount: 1 });
        if (!chosenIdArr || chosenIdArr.length === 0) return;
        const chosenId = chosenIdArr[0];
        const cardToPlay = validChoices.find(c => c.instanceId === chosenId);
        const originalIndex = gameState.lineUp.findIndex(c => c && c.instanceId === chosenId);
        if (cardToPlay && originalIndex !== -1) {
            console.log(`Emerald Knight borrows ${cardToPlay.name_pl} from Line-Up.`);
            gameState.lineUp[originalIndex] = null;
            player.borrowedCards.push({ card: cardToPlay, originalIndex: originalIndex });
            await engine.playCard(cardToPlay, { isTemporary: true });
        }
    } else if (effectTag === 'play_top_card_from_sv_stack_no_fa_attack_then_return_top') {
        if (gameState.superVillainStack.length === 0) return;
        const svOriginalCard = gameState.superVillainStack.shift();
        engine.renderGameBoard();
        console.log(`J'onn J'onzz is playing ${svOriginalCard.name_pl}...`);
        const cardToPlay = { ...svOriginalCard };
        cardToPlay.effect_tags = cardToPlay.effect_tags.filter(tag => !tag.startsWith('first_appearance_attack'));
        await engine.playCard(cardToPlay, { isTemporary: true });
        gameState.superVillainStack.unshift(svOriginalCard);
        console.log(`${svOriginalCard.name_pl} has been returned to the Super-Villain stack.`);
    } else {
        console.warn(`Unknown on_play_effect tag: ${effectTag}`);
    }
};

cardEffects.internal_effect = async (gameState, player, effectTag, engine, details) => {
    if (effectTag === 'dark_knight_combo') {
        if (player.gainedCardsThisTurn.length > 0) {
            const useAbility = await engine.promptWithCard(
                t('catwoman_combo_prompt_text'),
                player.gainedCardsThisTurn,
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