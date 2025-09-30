cardEffects.eot_effect = async (gameState, player, effectTag, engine, details) => {
    const { logEvent, t } = engine;
    const { cardWithEffect } = details;
    const langKey = `name_${currentLang}`;

    switch (effectTag) {
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