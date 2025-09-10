// card_effects/on_play_effect.js

function parseTypeFromTag(typeString) {
    switch (typeString) {
        case 'superpower': return 'Super Power';
        default: return typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
}

cardEffects.on_play_effect = async (gameState, player, effectTag, engine, details) => {
    const langKey = `name_${currentLang}`;
    console.log(`[DEBUG] Runing on_play_effect with tag: ${effectTag}`);

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
            const translatedCardType = t(`card_type_${cardType.toLowerCase().replace(' ', '_')}`);
            const promptText = t('choose_X_to_take_to_hand').replace('{TYPE}', translatedCardType);

            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(promptText, validChoices, { selectionCount: 1 });
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
        const useAbility = await engine.promptConfirmation(t('confirm_move_from_discard_to_bottom'));
        if (!useAbility) return;
        const maxToMove = Math.min(2, player.discard.length);
        const chosenCardIds = await engine.promptPlayerChoice(
            t('choose_up_to_X_cards_to_move').replace('{X}', maxToMove),
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
        const allPlayedCards = [...player.playedCards, ...player.ongoing];
        const catwomanAlreadyPlayed = allPlayedCards.some(card => card.id === 'catwoman');

        if (catwomanAlreadyPlayed) {
            // Jeśli Catwoman już jest w grze, uruchom efekt natychmiast
            console.log('Dark Knight trigger: Catwoman already in play. Firing combo immediately.');
            await engine.applyCardEffect('internal_effect:dark_knight_combo', gameState, player, {});
        } else {
            // Jeśli nie, ustaw trigger na przyszłość
            const newTrigger = {
                condition: { on: 'play', id: 'catwoman' },
                effectTag: 'internal_effect:dark_knight_combo'
            };
            player.turnTriggers.push(newTrigger);
            console.log('Dark Knight trigger has been set for future Catwoman play.');
        }
    } else if (effectTag.startsWith('may_destroy_cards_from_hand_or_discard')) {
        const validChoices = [...player.hand, ...player.discard];
        if (validChoices.length === 0) return;
        let maxCount = 1;
        if (effectTag.includes('_count_le_')) {
            maxCount = parseInt(effectTag.split('_count_le_')[1], 10);
        } else if (effectTag.includes('_count_')) {
            maxCount = parseInt(effectTag.split('_count_')[1], 10);
        }
        const actualMax = Math.min(maxCount, validChoices.length);
        const useAbility = await engine.promptConfirmation(t('confirm_destroy_up_to_X').replace('{X}', actualMax));
        if (!useAbility) return;
        const chosenCardIds = await engine.promptPlayerChoice(
            t('choose_up_to_X_cards_to_move').replace('{X}', actualMax),
            validChoices,
            { selectionCount: actualMax, isCancellable: true, canSelectLess: true }
        );
        if (chosenCardIds && chosenCardIds.length > 0) {
            const cardsToDestroy = validChoices.filter(card => chosenCardIds.includes(card.instanceId));
            gameState.destroyedPile.push(...cardsToDestroy);
            player.hand = player.hand.filter(card => !chosenCardIds.includes(card.instanceId));
            player.discard = player.discard.filter(card => !chosenCardIds.includes(card.instanceId));
            console.log(`Destroyed ${cardsToDestroy.length} card(s).`);
            engine.renderGameBoard();
        }
    } else if (effectTag === 'may_destroy_cards_from_discard_choice_count_le_2') {
        const validChoices = [...player.discard];
        if (validChoices.length === 0) return;
        const maxToDestroy = Math.min(2, validChoices.length);
        const useAbility = await engine.promptConfirmation(`Czy chcesz zniszczyć do ${maxToDestroy} kart ze swojego stosu kart odrzuconych?`);
        if (!useAbility) return;
        const chosenCardIds = await engine.promptPlayerChoice(
            `Wybierz do ${maxToDestroy} kart do zniszczenia:`,
            validChoices,
            { selectionCount: maxToDestroy, isCancellable: true, canSelectLess: true }
        );
        if (chosenCardIds && chosenCardIds.length > 0) {
            const cardsToDestroy = validChoices.filter(card => chosenCardIds.includes(card.instanceId));
            gameState.destroyedPile.push(...cardsToDestroy);
            player.discard = player.discard.filter(card => !chosenCardIds.includes(card.instanceId));
            console.log(`Destroyed ${cardsToDestroy.length} card(s) from discard.`);
            engine.renderGameBoard();
        }
    } else if (effectTag === 'may_gain_card_type_kick_from_kick_stack_to_hand') {
        if (gameState.kickStack.length > 0) {
            const userConfirmed = await engine.promptConfirmation(t('confirm_gain_kick_to_hand'));
            if (userConfirmed) {
                const gainedCard = gameState.kickStack.shift();
                player.hand.push(gainedCard);
            }
        }
    } else if (effectTag.startsWith('gain_card_from_lineup_choice_cost_le_')) {
        const maxCost = parseInt(effectTag.split('_').pop(), 10);
        const validChoices = gameState.lineUp.filter(card => card && card.cost <= maxCost);
        if (validChoices.length > 0) {
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(
                t('choose_card_to_gain_cost_le_X').replace('{X}', maxCost),
                validChoices,
                { selectionCount: 1 }
            );
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
            const selection = await engine.promptPlayerChoice(t('choose_card_to_replay'), validChoices);
            const chosenCardInstanceId = Array.isArray(selection) ? selection[0] : selection;
            if (chosenCardInstanceId) {
                const cardToReplay = validChoices.find(c => c.instanceId === chosenCardInstanceId);
                if (cardToReplay) {
                    await engine.playCard(cardToReplay, { isTemporary: true });
                }
            }
        }
    } else if (effectTag === 'reveal_deck_top_1_then_may_destroy_revealed') {
        if (player.deck.length === 0) return;
        const topCard = player.deck[player.deck.length - 1];
        const userWantsToDestroy = await engine.promptWithCard(
            t('confirm_destroy_from_deck_top').replace('{CARD_NAME}', topCard[langKey] || topCard.name_en),
            topCard,
            [
                { text: t('destroy_button'), value: true },
                { text: t('keep_button'), value: false, isSecondary: true }
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
        const chosenIdArr = await engine.promptPlayerChoice(t('choose_card_from_lineup_to_play'), validChoices, { selectionCount: 1 });
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
        engine.renderGameBoard(); // Odśwież widok, aby pokazać pusty stos
        console.log(`J'onn J'onzz is playing ${svOriginalCard.name_pl}...`);

        // KROK 1: Ręcznie dodaj moc bazową pożyczonej karty
        gameState.currentPower += svOriginalCard.power || 0;

        // KROK 2: Uruchom tylko efekty "on_play" pożyczonej karty, ignorując inne
        for (const tag of svOriginalCard.effect_tags) {
            const effectName = tag.split(':')[0];
            if (effectName !== 'eot_effect' && effectName !== 'cleanup_effect' && effectName !== 'first_appearance_attack') {
                await engine.applyCardEffect(tag, gameState, player, {});
            }
        }

        // KROK 3: Odłóż oryginalną kartę z powrotem na stos
        gameState.superVillainStack.unshift(svOriginalCard);
        console.log(`${svOriginalCard.name_pl} has been returned to the Super-Villain stack.`);

        // KROK 4: Na koniec odśwież planszę, aby pokazać nową wartość mocy
        engine.renderGameBoard();
    } else if (effectTag === 'player_chooses_even_or_odd_then_reveal_deck_top_1_if_cost_matches_choice_move_to_hand_else_discard') {
        if (player.deck.length === 0) {
            await engine.showNotification(t('deck_is_empty_effect_cannot_be_used'));
            return;
        }
        const choseEven = await engine.promptConfirmation(
            t('two_face_prompt'),
            t('two_face_even'),
            t('two_face_odd')
        );
        const topCard = player.deck.pop();
        const isEven = topCard.cost % 2 === 0;
        const wasCorrect = (choseEven && isEven) || (!choseEven && !isEven);
        let message = '';
        if (wasCorrect) {
            player.hand.push(topCard);
            message = `${t('two_face_correct')} "${topCard[langKey] || topCard.name_en}" (koszt ${topCard.cost}) ${t('two_face_to_hand')}.`;
        } else {
            player.discard.push(topCard);
            message = `${t('two_face_incorrect')} "${topCard[langKey] || topCard.name_en}" (koszt ${topCard.cost}) ${t('two_face_to_discard')}.`;
        }
        await engine.promptWithCard(message, topCard, [{ text: 'OK', value: true }]);
    } else if (effectTag === 'choice_either_repeatable_action_spend_3_power_buy_blind_main_deck_top_1_or_gain_1_power') {
        const useSpecialAbility = await engine.promptConfirmation(
            t('riddler_initial_prompt'),
            t('riddler_special_ability'),
            t('riddler_gain_power')
        );
        if (!useSpecialAbility) {
            gameState.currentPower += 1;
            console.log('Riddler adds +1 bonus Power.');
        } else {
            let continueLoop = true;
            while (continueLoop) {
                if (gameState.mainDeck.length === 0) {
                    await engine.showNotification(t('riddler_deck_empty'));
                    continueLoop = false;
                    break;
                }
                if (gameState.currentPower < 3) {
                    await engine.showNotification(t('riddler_no_power'));
                    continueLoop = false;
                    break;
                }
                const topCard = gameState.mainDeck[gameState.mainDeck.length - 1];
                const buyCard = await engine.promptWithCard(
                    t('riddler_buy_prompt').replace('{POWER}', gameState.currentPower),
                    topCard,
                    [
                        { text: t('riddler_buy_confirm'), value: true },
                        { text: t('riddler_buy_cancel'), value: false, isSecondary: true }
                    ]
                );
                if (buyCard) {
                    gameState.currentPower -= 3;
                    const gainedCard = gameState.mainDeck.pop();
                    await engine.gainCard(player, gainedCard);
                    engine.renderGameBoard();
                } else {
                    continueLoop = false;
                }
            }
        }
    } else if (effectTag === 'reveal_deck_top_1_then_if_cost_ge_1_gain_power_3_else_gain_power_2_finally_return_revealed_to_top') {
        let powerGained;
        let message;
        let topCard = null;
        const langKey = `name_${currentLang}`;

        if (player.deck.length > 0) {
            topCard = player.deck[player.deck.length - 1];
            powerGained = (topCard.cost >= 1) ? 3 : 2;
            message = t('power_ring_reveal')
                .replace('{CARD_NAME}', topCard[langKey] || topCard.name_en)
                .replace('{COST}', topCard.cost)
                .replace('{POWER}', powerGained);
        } else {
            powerGained = 2;
            message = t('power_ring_deck_empty').replace('{POWER}', powerGained);
        }

        gameState.currentPower += powerGained;
        console.log(message.replace('\n', ' '));

        if (topCard) {
            await engine.promptWithCard(message, topCard, [{ text: 'OK', value: true }], t('card_revealed_title'));
        } else {
            await engine.showNotification(message);
        }
    } else if (effectTag === 'may_gain_card_from_lineup_choice_type_hero_or_villain_else_gain_power_3') {
    const validChoices = gameState.lineUp.filter(card => card && (card.type === 'Hero' || card.type === 'Villain'));

    if (validChoices.length === 0) {
        gameState.bonusPower += 3;
        await engine.showNotification(t('deathstroke_no_targets'));
        return;
    }

    const useAbility = await engine.promptConfirmation(t('deathstroke_on_play_prompt'));

    if (useAbility) {
        const chosenCardIdArr = await engine.promptPlayerChoice(
            t('deathstroke_choose_card_to_gain'),
            validChoices,
            { selectionCount: 1, isCancellable: true }
        );

        if (chosenCardIdArr && chosenCardIdArr.length > 0) {
            const chosenId = chosenCardIdArr[0];
            const cardIndex = gameState.lineUp.findIndex(c => c && c.instanceId === chosenId);
            if (cardIndex !== -1) {
                const [gainedCard] = gameState.lineUp.splice(cardIndex, 1, null);
                await engine.gainCard(player, gainedCard);
            }
        } else {
            gameState.bonusPower += 3;
        }
    } else {
        gameState.bonusPower += 3;
    }
    } else if (effectTag === 'reveal_main_deck_top_1_then_if_type_hero_gain_power_3_and_destroy_revealed_else_move_revealed_to_hand') {
        if (gameState.mainDeck.length === 0) {
            await engine.showNotification(t('deck_is_empty_effect_cannot_be_used'));
            return;
        }

        const topCard = gameState.mainDeck.pop();
        let message = '';

        if (topCard.type === 'Hero') {
            gameState.bonusPower += 3;
            gameState.destroyedPile.push(topCard);
            message = t('sinestro_reveal_hero').replace('{CARD_NAME}', topCard[`name_${currentLang}`] || topCard.name_en);
        } else {
            player.hand.push(topCard);
            message = t('sinestro_reveal_other').replace('{CARD_NAME}', topCard[`name_${currentLang}`] || topCard.name_en);
        }
        
        await engine.promptWithCard(message, topCard, [{ text: 'OK', value: true }]);

        } else if (effectTag === 'double_total_power_this_turn') {
            player.turnFlags.powerIsDoubled = true;
            console.log("Parallax effect activated: Power will be doubled this turn.");
            gameState.currentPower *= 2;

        } else if (effectTag === 'each_opponent_chooses_discard_1_random_from_hand_or_active_player_draws_1') {
            console.log("Joker's on-play effect: No opponents to target in solo mode.");

    } else if (effectTag === 'destroy_any_number_of_cards_from_lineup_choice_then_refill_lineup') {
        const validChoices = gameState.lineUp.filter(c => c !== null);
        if (validChoices.length === 0) {
            await engine.showNotification(t('anti_monitor_no_cards_to_destroy'));
            return;
        }

        const chosenCardIds = await engine.promptPlayerChoice(
            t('anti_monitor_choose_to_destroy'),
            validChoices,
            { selectionCount: validChoices.length, isCancellable: true, canSelectLess: true }
        );

        if (chosenCardIds && chosenCardIds.length > 0) {
            const cardsToDestroy = [];
            gameState.lineUp = gameState.lineUp.map(card => {
                if (card && chosenCardIds.includes(card.instanceId)) {
                    cardsToDestroy.push(card);
                    return null;
                }
                return card;
            });

            gameState.destroyedPile.push(...cardsToDestroy);
            console.log(`Anti-Monitor destroyed ${cardsToDestroy.length} card(s) from the Line-Up.`);

            for (let i = 0; i < gameState.lineUp.length; i++) {
                if (gameState.lineUp[i] === null && gameState.mainDeck.length > 0) {
                    gameState.lineUp[i] = gameState.mainDeck.pop();
                }
            }
        }

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