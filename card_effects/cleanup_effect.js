cardEffects.cleanup_effect = async (gameState, player, effectTag, engine, details) => {
    const { cardWithEffect } = details;
    const { logEvent, t } = engine;
    const langKey = `name_${currentLang}`;

    if (effectTag === 'move_this_card_to_bottom_of_deck') {
        const message = t('log_cleanup_effect').replace('{CARD_NAME}', cardWithEffect[langKey] || cardWithEffect.name_en);
        logEvent(message, 'system');
        player.deck.splice(0, 0, cardWithEffect);
    } else {
        console.warn(`Unknown cleanup_effect tag: ${effectTag}`);
    }
};