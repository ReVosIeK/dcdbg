cardEffects.then_discard_card = async (gameState, player, params, engine) => {
    const effectTag = params.join(':');
    const parts = effectTag.split('_');
    const count = parseInt(parts[0].split('=')[1], 10);
    if (player.hand.length <= count) {
        const cardsToDiscard = [...player.hand];
        cardsToDiscard.forEach(card => {
            const cardIndex = player.hand.findIndex(c => c.instanceId === card.instanceId);
            if(cardIndex > -1) {
                player.discard.push(player.hand.splice(cardIndex, 1)[0]);
            }
        });
        return;
    }
    const chosenCardIds = await engine.promptPlayerChoice(`Wybierz ${count} karty do odrzucenia:`, player.hand, { selectionCount: count, isCancellable: false });
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