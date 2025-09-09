// card_effects/then_discard_card.js

cardEffects.then_discard_card = async (gameState, player, effectTag, engine) => {
    const parts = effectTag.split('_');
    const count = parseInt(parts[0].split('=')[1], 10);
    
    if (player.hand.length <= count) {
        const cardsToDiscard = [...player.hand];
        player.discard.push(...cardsToDiscard);
        player.hand = [];
        return;
    }

    const chosenCardIds = await engine.promptPlayerChoice(
        t('choose_X_cards_to_discard').replace('{X}', count), 
        player.hand, 
        { selectionCount: count, isCancellable: false }
    );
    if (chosenCardIds && chosenCardIds.length > 0) {
        chosenCardIds.forEach(instanceId => {
            const cardIndex = player.hand.findIndex(c => c.instanceId === instanceId);
            if (cardIndex !== -1) {
                const [discardedCard] = player.hand.splice(cardIndex, 1);
                player.discard.push(discardedCard);
            }
        });
    }
};