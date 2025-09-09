cardEffects.defense_reveal = async (gameState, player, effectTag, engine) => {
    if (effectTag === 'villain_or_supervillain_from_hand') {
        const validCards = player.hand.filter(c => c.type === 'Villain' || c.type === 'Super-Villain');
        if (validCards.length > 0) {
            const userWantsToReveal = await engine.promptConfirmation(t('darkseid_reveal_prompt'));
            if (userWantsToReveal) {
                await engine.showNotification(t('darkseid_reveal_success'));
                return true;
            }
        }
    }
    return false;
};