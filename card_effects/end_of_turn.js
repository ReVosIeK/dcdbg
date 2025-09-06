// card_effects/end_of_turn.js

cardEffects.eot_effect = async (gameState, player, effectTag, engine, details) => {
    const { cardWithEffect } = details;

    switch (effectTag) {
        case 'may_move_one_gained_card_this_turn_to_deck_top':
            if (player.gainedCardsThisTurn.length === 0) {
                return;
            }
            console.log(`Triggering end-of-turn effect for ${cardWithEffect.name_pl}`);
            const useAbilityTrident = await engine.promptConfirmation(`Dzięki karcie "${cardWithEffect.name_pl}", możesz położyć jedną ze zdobytych w tej turze kart na wierzchu swojej talii. Czy chcesz to zrobić?`);
            if (!useAbilityTrident) {
                return;
            }
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(
                'Wybierz kartę, którą chcesz położyć na wierzchu talii:',
                player.gainedCardsThisTurn,
                { selectionCount: 1, isCancellable: true }
            );
            if (chosenCardInstanceIdArr && chosenCardInstanceIdArr.length > 0) {
                const chosenCardInstanceId = chosenCardInstanceIdArr[0];
                const cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [movedCard] = player.discard.splice(cardIndex, 1);
                    player.deck.unshift(movedCard);
                    console.log(`Moved ${movedCard.name_pl} to the top of the deck.`);
                }
            }
            break;

        case 'if_card_played_this_turn_id_catwoman_then_may_move_all_gained_or_bought_cards_this_turn_to_hand':
            const allPlayedCards = [...player.playedCards, ...player.ongoing];
            const catwomanPlayed = allPlayedCards.some(card => card.id === 'catwoman');

            if (catwomanPlayed && player.gainedCardsThisTurn.length > 0) {
                const cardNames = player.gainedCardsThisTurn.map(c => c[`name_${currentLang}`] || c.name_en).join(', ');
                const useAbilityKnight = await engine.promptConfirmation(`${t('catwoman_combo_prompt_start')} (${cardNames}) ${t('catwoman_combo_prompt_end')}`);
                
                if (useAbilityKnight) {
                    const gainedCardIds = player.gainedCardsThisTurn.map(c => c.instanceId);
                    const cardsToMove = player.discard.filter(c => gainedCardIds.includes(c.instanceId));
                    
                    if(cardsToMove.length > 0) {
                        player.discard = player.discard.filter(c => !gainedCardIds.includes(c.instanceId));
                        player.hand.push(...cardsToMove);
                        console.log(`Dark Knight (Catwoman combo): Moved ${cardsToMove.length} card(s) to hand.`);
                    }
                }
            }
            break;

        default:
            console.warn(`Unhandled end-of-turn effect: ${effectTag}`);
    }
};