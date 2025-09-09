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

            const randomIndex = Math.floor(Math.random() * player.hand.length);
            const [removedCard] = player.hand.splice(randomIndex, 1);

            gameState.cardsUnderSuperheroes.push({
                card: removedCard,
                playerId: 'player1',
                tiedToVillainId: revealedCard.id
            });
            
            await engine.promptWithCard(
                `Atak Atrocitusa! Zostałeś zmuszony do odłożenia tej karty pod swojego Superbohatera. Odzyskasz ją po pokonaniu Atrocitusa.`,
                removedCard,
                [{ text: 'OK', value: true }]
            );
            break;

        case 'each_player_discards_deck_top_1_then_if_cost_ge_1_player_chooses_destroy_discarded_or_discard_hand':
            if (player.deck.length === 0) {
                await engine.showNotification("Twoja talia jest pusta. Atak Black Manty nie ma efektu.");
                return;
            }

            const topCard = player.deck.pop(); // Zdejmij kartę z wierzchu talii
            player.discard.push(topCard);      // i umieść na stosie kart odrzuconych

            await engine.promptWithCard(
                `Atak Black Manty! Odrzucasz wierzchnią kartę ze swojej talii:`,
                topCard,
                [{ text: 'OK', value: true }]
            );

            if (topCard.cost >= 1) {
                const destroyCard = await engine.promptConfirmation(
                    `Odrzucona karta ma koszt 1 lub więcej. Wybierz opcję:`,
                    t('black_manta_destroy_it'),     // "Zniszcz ją"
                    t('black_manta_discard_hand') // "Odrzuć rękę"
                );

                if (destroyCard) {
                    const cardIndex = player.discard.findIndex(c => c.instanceId === topCard.instanceId);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = player.discard.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                        await engine.showNotification(`Karta "${destroyedCard.name_pl}" została zniszczona.`);
                    }
                } else {
                    if (player.hand.length > 0) {
                        player.discard.push(...player.hand);
                        player.hand = [];
                        await engine.showNotification("Odrzuciłeś wszystkie karty z ręki.");
                    } else {
                        await engine.showNotification("Twoja ręka jest już pusta.");
                    }
                }
            }
            break;
        
        case 'each_player_chooses_2_from_hand_to_pool_shuffle_pool_deal_2_from_pool_to_each_player_hand':
            if (player.hand.length < 2) {
                await engine.showNotification("Masz mniej niż 2 karty na ręce. Atak Brainiaca nie ma efektu.");
                return;
            }

            // Krok A: Gracz wybiera 2 karty do puli
            const chosenCardIds = await engine.promptPlayerChoice(
                t('brainiac_choose_cards'), // "Wybierz 2 karty do wspólnej puli:"
                player.hand,
                { selectionCount: 2, isCancellable: false }
            );

            const pooledCards = [];
            chosenCardIds.forEach(id => {
                const cardIndex = player.hand.findIndex(c => c.instanceId === id);
                if (cardIndex !== -1) {
                    pooledCards.push(player.hand.splice(cardIndex, 1)[0]);
                }
            });

            // W grze solo pula zawiera tylko karty jednego gracza
            console.log("Brainiac's Attack: Card pool created.", pooledCards);
            shuffle(pooledCards); // Tasujemy pulę

            // Krok B: Gracz otrzymuje 2 losowe karty z powrotem
            player.hand.push(...pooledCards);

            await engine.showCardPoolNotification(
                t('brainiac_cards_returned'), // "Karty zostały potasowane i zwrócone na Twoją rękę!"
                pooledCards
            );
            break;

        case 'each_player_flips_superhero_face_down_until_this_defeated':
            gameState.superheroAbilitiesDisabled = true;
            await engine.showNotification(t('captain_cold_fa_text'));
            engine.renderGameBoard(); // Przerenderuj, aby pokazać odwróconych Superbohaterów
            break;

        case 'each_player_discards_2_cards_from_hand_unless_reveals_villain_or_supervillain_from_hand':
            await engine.showNotification(t('darkseid_fa_text'));

            // Sprawdź, czy gracz może i chce się obronić
            const isDefended = await engine.applyCardEffect('defense_reveal:villain_or_supervillain_from_hand', gameState, player, {});

            if (!isDefended) {
                if (player.hand.length <= 2) {
                    await engine.showNotification(t('darkseid_discard_all'));
                    player.discard.push(...player.hand);
                    player.hand = [];
                } else {
                    const chosenCardIds = await engine.promptPlayerChoice(
                        t('darkseid_discard_2'),
                        player.hand,
                        { selectionCount: 2, isCancellable: false }
                    );
                    const cardsToDiscard = player.hand.filter(c => chosenCardIds.includes(c.instanceId));
                    player.hand = player.hand.filter(c => !chosenCardIds.includes(c.instanceId));
                    player.discard.push(...cardsToDiscard);
                }
            }
            break;
        
        default:
            console.warn(`Unhandled First Appearance Attack tag: ${effectTag}`);
    }
};