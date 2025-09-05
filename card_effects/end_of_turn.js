// card_effects/end_of_turn.js - POPRAWIONA WERSJA

cardEffects.eot_effect = async (gameState, player, params, engine, details) => { // <-- POPRAWKA JEST TUTAJ
    const { cardWithEffect } = details; // <-- ORAZ TUTAJ
    const effectTag = params.join(':');

    switch (effectTag) {
        case 'may_move_one_gained_card_this_turn_to_deck_top':
            if (player.gainedCardsThisTurn.length === 0) {
                return;
            }

            console.log(`Triggering end-of-turn effect for ${cardWithEffect.name_en}`);

            const useAbility = await engine.promptConfirmation(`Dzięki karcie "${cardWithEffect.name_pl || cardWithEffect.name_en}", możesz położyć jedną ze zdobytych w tej turze kart na wierzchu swojej talii. Czy chcesz to zrobić?`);
            if (!useAbility) {
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
                    console.log(`Moved ${movedCard.name_en} to the top of the deck.`);
                }
            }
            break;

        default:
            console.warn(`Unhandled end-of-turn effect: ${effectTag}`);
    }
};