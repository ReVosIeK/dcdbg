// card_effects/defense_effect.js

cardEffects.defense_effect = async (gameState, player, effectTag, engine, details) => {
    const { cardWithEffect } = details;

    const parts = effectTag.split(':');
    const effectName = parts.length > 1 ? parts[1] : parts[0];

    switch (effectName) {
        case 'on_reveal_from_hand_discard_this_avoid_attack_then_draw_1': { // Lasso of Truth
            const cardIndex = player.hand.findIndex(c => c.instanceId === cardWithEffect.instanceId);
            if (cardIndex !== -1) {
                const [discardedCard] = player.hand.splice(cardIndex, 1);
                player.discard.push(discardedCard);
                engine.drawCards(player, 1, gameState, { source: 'ability' });
            }
            break;
        }

        case 'on_reveal_from_hand_discard_this_avoid_attack_then_draw_2': { // The Cape and Cowl, Super Speed
            const cardIndex = player.hand.findIndex(c => c.instanceId === cardWithEffect.instanceId);
            if (cardIndex !== -1) {
                const [discardedCard] = player.hand.splice(cardIndex, 1);
                player.discard.push(discardedCard);
                engine.drawCards(player, 2, gameState, { source: 'ability' });
            }
            break;
        }

        case 'on_reveal_from_hand_discard_this_avoid_attack_then_draw_1_and_may_destroy_card_from_discard_choice': { // Bulletproof
            const cardIndex = player.hand.findIndex(c => c.instanceId === cardWithEffect.instanceId);
            if (cardIndex !== -1) {
                const [discardedCard] = player.hand.splice(cardIndex, 1);
                player.discard.push(discardedCard);
                engine.drawCards(player, 1, gameState, { source: 'ability' });
            }

            if (player.discard.length > 0) {
                const chosenCardIdArr = await engine.promptPlayerChoice('Choose a card to destroy from your discard pile:', player.discard, { isCancellable: true });
                if (chosenCardIdArr && chosenCardIdArr.length > 0) {
                    const chosenId = chosenCardIdArr[0];
                    const cardToDestroyIndex = player.discard.findIndex(c => c.instanceId === chosenId);
                    if (cardToDestroyIndex !== -1) {
                        const [destroyedCard] = player.discard.splice(cardToDestroyIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                    }
                }
            }
            break;
        }

        case 'on_reveal_from_hand_keep_this_avoid_attack': { // Blue Beetle
            // Karta zostaje w ręku, więc nie robimy nic.
            console.log("Blue Beetle defended. Card remains in hand.");
            break;
        }

        default:
            console.warn(`Unhandled defense_effect tag: ${effectTag}`);
    }
};