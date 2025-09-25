// card_effects/conditional_effect.js

cardEffects.conditional_effect = async (gameState, player, effectTag, engine) => {

    if (effectTag === 'if_first_card_played_this_turn_then_discard_hand_draw_5_else_gain_power_1') {
        const isFirstCard = (player.playedCards.length + player.ongoing.length) === 1;
        if (isFirstCard) {
            player.discard.push(...player.hand);
            player.hand = [];
            engine.drawCards(player, 5, gameState, { source: 'card_effect' });
        } else {
            gameState.currentPower += 1;
        }
    } else if (effectTag === 'may_destroy_card_from_discard_then_gain_power_3_else_gain_power_1') {
        if (player.discard.length === 0) {
            gameState.currentPower += 1;
            return;
        }
        const chosenCardIdArr = await engine.promptPlayerChoice(t('king_of_atlantis_prompt'), player.discard, { selectionCount: 1, isCancellable: true });
        if (chosenCardIdArr && chosenCardIdArr.length > 0) {
            const chosenId = chosenCardIdArr[0];
            const cardIndex = player.discard.findIndex(c => c.instanceId === chosenId);
            if (cardIndex !== -1) {
                const [destroyedCard] = player.discard.splice(cardIndex, 1);
                gameState.destroyedPile.push(destroyedCard);
                gameState.currentPower += 3;
            }
        } else {
            gameState.currentPower += 1;
        }
    } else if (effectTag === 'may_destroy_2_cards_from_hand_then_gain_power_5_else_gain_power_3') {
        if (player.hand.length < 2) {
            gameState.currentPower += 3;
            return;
        }
        const useAbility = await engine.promptConfirmation(t('darkseid_on_play_prompt'));
        if (useAbility) {
            const chosenCardIds = await engine.promptPlayerChoice(t('darkseid_choose_2_to_destroy'), player.hand, { selectionCount: 2, isCancellable: false });
            if (chosenCardIds && chosenCardIds.length === 2) {
                const cardsToDestroy = player.hand.filter(c => chosenCardIds.includes(c.instanceId));
                player.hand = player.hand.filter(c => !chosenCardIds.includes(c.instanceId));
                gameState.destroyedPile.push(...cardsToDestroy);
                gameState.currentPower += 5;
            }
        } else {
            gameState.currentPower += 3;
        }
    } else if (effectTag === 'may_gain_card_from_lineup_choice_type_hero_or_villain_else_gain_power_3') {
        const validChoices = gameState.lineUp.filter(card => card && (card.type === 'Hero' || card.type === 'Villain'));
        if (validChoices.length === 0) {
            gameState.currentPower += 3;
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
                gameState.currentPower += 3;
            }
        } else {
            gameState.currentPower += 3;
        }
    } else {
        console.warn(`Unhandled conditional_effect tag: ${effectTag}`);
    }
};