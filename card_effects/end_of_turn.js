cardEffects.eot_effect = async (gameState, player, effectTag, engine, details) => {
    const { cardWithEffect } = details;
    const langKey = `name_${currentLang}`;

    switch (effectTag) {
        case 'may_move_one_gained_card_this_turn_to_deck_top':
            if (player.gainedCardsThisTurn.length === 0) {
                return;
            }
            console.log(`Triggering end-of-turn effect for ${cardWithEffect[langKey]}`);
            const useAbilityTrident = await engine.promptConfirmation(
                t('aquaman_trident_prompt').replace('{CARD_NAME}', cardWithEffect[langKey] || cardWithEffect.name_en)
            );
            if (!useAbilityTrident) {
                return;
            }
            const chosenCardInstanceIdArr = await engine.promptPlayerChoice(
                t('choose_card_to_place_on_top'),
                player.gainedCardsThisTurn,
                { selectionCount: 1, isCancellable: true }
            );
            if (chosenCardInstanceIdArr && chosenCardInstanceIdArr.length > 0) {
                const chosenCardInstanceId = chosenCardInstanceIdArr[0];
                const cardIndex = player.discard.findIndex(c => c.instanceId === chosenCardInstanceId);
                if (cardIndex !== -1) {
                    const [movedCard] = player.discard.splice(cardIndex, 1);
                    player.deck.push(movedCard);
                    console.log(`Moved ${movedCard[langKey] || movedCard.name_en} to the top of the deck.`);
                }
            }
            break;

        case 'if_card_played_this_turn_id_catwoman_then_may_move_all_gained_or_bought_cards_this_turn_to_hand':
            const allPlayedCards = [...player.discard, ...player.ongoing];
            const catwomanPlayed = allPlayedCards.some(card => card.id === 'catwoman');

            if (catwomanPlayed && player.gainedCardsThisTurn.length > 0) {
                const useAbilityKnight = await engine.promptWithCard(
                    t('catwoman_combo_prompt_text'),
                    player.gainedCardsThisTurn,
                    [
                        { text: t('yes'), value: true },
                        { text: t('no'), value: false, isSecondary: true }
                    ]
                );
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