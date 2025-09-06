cardEffects.conditional_effect = async (gameState, player, effectTag, engine) => {

    if (effectTag === 'if_first_card_played_this_turn_then_discard_hand_draw_5_else_gain_power_1') {
        const isFirstCard = (player.playedCards.length + player.ongoing.length) === 1;

        if (isFirstCard) {
            console.log("Batmobile is the first card played: discarding hand and drawing 5.");
            player.discard.push(...player.hand);
            player.hand = [];
            drawCards(player, 5);
        } else {
            console.log("Batmobile is not the first card: gaining +1 Power.");
            gameState.currentPower += 1;
        }
    
    } else if (effectTag === 'may_destroy_card_from_discard_then_gain_power_3_else_gain_power_1') {
        if (player.discard.length === 0) {
            console.log("King of Atlantis: Discard pile is empty, gaining +1 Power.");
            gameState.currentPower += 1;
            return;
        }

        const chosenCardIdArr = await engine.promptPlayerChoice(
            'Wybierz kartę do zniszczenia (+3 Mocy) lub Anuluj (+1 Moc)',
            player.discard,
            { selectionCount: 1, isCancellable: true }
        );

        if (chosenCardIdArr && chosenCardIdArr.length > 0) {
            const chosenId = chosenCardIdArr[0];
            const cardIndex = player.discard.findIndex(c => c.instanceId === chosenId);
            if (cardIndex !== -1) {
                const [destroyedCard] = player.discard.splice(cardIndex, 1);
                gameState.destroyedPile.push(destroyedCard);
                console.log(`King of Atlantis destroyed ${destroyedCard.name_pl}, gaining +3 Power.`);
                gameState.currentPower += 3;
            }
        } else {
            console.log("King of Atlantis: Player chose not to destroy, gaining +1 Power.");
            gameState.currentPower += 1;
        }
    } else {
        console.warn(`Unhandled conditional_effect tag: ${effectTag}`);
    }
};