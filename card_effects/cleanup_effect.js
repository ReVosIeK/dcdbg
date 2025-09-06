cardEffects.cleanup_effect = async (gameState, player, effectTag, engine, details) => {
    const { cardWithEffect } = details;

    if (effectTag === 'move_this_card_to_bottom_of_deck') {
        console.log(`Cleanup effect for ${cardWithEffect.name_pl}: moving to bottom of deck.`);
        // Umieść kartę na spodzie talii (na początku tablicy)
        player.deck.splice(0, 0, cardWithEffect);
    } else {
        console.warn(`Unknown cleanup_effect tag: ${effectTag}`);
    }
};