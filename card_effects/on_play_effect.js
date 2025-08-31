function parseTypeFromTag(typeString) {
    switch (typeString) {
        case 'superpower': return 'Super Power';
        default: return typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
}
cardEffects.on_play_effect = async (gameState, player, params, engine) => {
    const effectTag = params.join(':');
    const command = effectTag.split('_')[0];

    switch (command) {
        case 'move': {
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
                if(!player.playedCards) return;
                const lastPlayedCard = player.playedCards[player.playedCards.length - 1];
                const validChoices = player.playedCards.filter(c => c && lastPlayedCard && c.instanceId !== lastPlayedCard.instanceId);
                if (validChoices.length === 0) return;
                const chosenCardInstanceId = await engine.promptPlayerChoice('Wybierz kartę do zagrania ponownie:', validChoices);
                if (chosenCardInstanceId) {
                    const cardToReplay = validChoices.find(c => c.instanceId === chosenCardInstanceId);
                    if (cardToReplay) {
                        console.log(`Replaying card: ${cardToReplay.name_en}`);
                        gameState.currentPower += cardToReplay.power || 0;
                        for (const tag of cardToReplay.effect_tags) {
                            await engine.applyCardEffect(tag, gameState, player, {});
                        }
                        engine.renderGameBoard();
                    }
                }
            }
            break;
        }
        default:
            console.warn(`Unknown on_play_effect tag: ${effectTag}`);
    }
};