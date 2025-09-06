// card_effects/first_appearance_attack.js

cardEffects.first_appearance_attack = async (gameState, player, effectTag, engine, details) => {
    const { revealedCard } = details;
    console.log(`FIRST APPEARANCE ATTACK triggered by ${revealedCard.name_pl}: ${effectTag}`);

    switch(effectTag) {
        case 'each_player_moves_1_random_card_from_hand_to_under_superhero_return_on_defeat':
            if (player.hand.length === 0) {
                await engine.showNotification("Twoja ręka jest pusta. Atak Atrocitusa nie ma efektu.");
                return;
            }

            // Wybierz losową kartę z ręki gracza
            const randomIndex = Math.floor(Math.random() * player.hand.length);
            const [removedCard] = player.hand.splice(randomIndex, 1);

            // Zapisz "uwięzioną" kartę
            gameState.cardsUnderSuperheroes.push({
                card: removedCard,
                playerId: 'player1', // W przyszłości dla multiplayer
                tiedToVillainId: revealedCard.id
            });
            
            await engine.promptWithCard(
                `Atak Atrocitusa! Zostałeś zmuszony do odłożenia tej karty pod swojego Superbohatera. Odzyskasz ją po pokonaniu Atrocitusa.`,
                removedCard,
                [{ text: 'OK', value: true }]
            );
            break;
        
        default:
            console.warn(`Unhandled First Appearance Attack tag: ${effectTag}`);
    }
};