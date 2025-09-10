// card_effects/first_appearance_attack.js

cardEffects.first_appearance_attack = async (gameState, player, effectTag, engine, details) => {
    const { revealedCard } = details;
    console.log(`FIRST APPEARANCE ATTACK triggered by ${revealedCard.name_pl}: ${effectTag}`);

    switch(effectTag) {
        case 'each_player_moves_1_random_card_from_hand_to_under_superhero_return_on_defeat': {
            if (player.hand.length === 0) {
                await engine.showNotification(t('atrocitus_fa_no_cards'));
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
            t('atrocitus_fa_card_taken'),
            removedCard,
            [{ text: 'OK', value: true }],
            t('attack_incoming_title')
        );
            break;
        }

        case 'each_player_discards_deck_top_1_then_if_cost_ge_1_player_chooses_destroy_discarded_or_discard_hand': {
            if (player.deck.length === 0) {
                await engine.showNotification(t('deck_is_empty_effect_cannot_be_used'));
                return;
            }
            const topCard = player.deck.pop();
            player.discard.push(topCard);
            await engine.promptWithCard(
                t('black_manta_fa_discarded'),
                topCard,
                [{ text: 'OK', value: true }],
                t('attack_incoming_title')
            );
            if (topCard.cost >= 1) {
                const destroyCard = await engine.promptConfirmation(
                    t('black_manta_fa_prompt'),
                    t('black_manta_destroy_it'),
                    t('black_manta_discard_hand')
                );
                if (destroyCard) {
                    const cardIndex = player.discard.findIndex(c => c.instanceId === topCard.instanceId);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = player.discard.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                        await engine.showNotification(t('card_destroyed_notification').replace('{CARD_NAME}', destroyedCard[langKey] || destroyedCard.name_en));
                    }
                } else {
                    if (player.hand.length > 0) {
                        player.discard.push(...player.hand);
                        player.hand = [];
                        await engine.showNotification(t('hand_discarded_notification'));
                    } else {
                        await engine.showNotification(t('hand_already_empty_notification'));
                    }
                }
            }
            break;
        }
        case 'each_player_chooses_2_from_hand_to_pool_shuffle_pool_deal_2_from_pool_to_each_player_hand': {
            if (player.hand.length < 2) {
                await engine.showNotification(t('brainiac_fa_not_enough_cards'));
                return;
            }
            const chosenCardIds = await engine.promptPlayerChoice(
                t('brainiac_choose_cards'),
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
            console.log("Brainiac's Attack: Card pool created.", pooledCards);
            shuffle(pooledCards);
            player.hand.push(...pooledCards);
            await engine.showCardPoolNotification(
                t('brainiac_cards_returned'),
                pooledCards
            );
            break;
        }

        case 'each_player_flips_superhero_face_down_until_this_defeated': {
            gameState.superheroAbilitiesDisabled = true;
            await engine.showNotification(t('captain_cold_fa_text'));
            engine.renderGameBoard();
            break;
        }

        case 'each_player_discards_2_cards_from_hand_unless_reveals_villain_or_supervillain_from_hand': {
            await engine.showNotification(t('darkseid_fa_text'));
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
        }

        case 'each_player_reveals_hand_then_must_destroy_card_type_hero_or_superpower_or_equipment_from_hand_or_discard_choice': {
            const validTargets = [...player.hand, ...player.discard].filter(c => ['Hero', 'Super Power', 'Equipment'].includes(c.type));

            if (validTargets.length === 0) {
                await engine.showNotification(t('deathstroke_fa_no_targets'));
                return;
            }

            await engine.promptWithCard(t('deathstroke_fa_reveal_hand'), player.hand, [{text: "OK", value: true}]);

            const chosenToDestroyIdArr = await engine.promptPlayerChoice(
                t('deathstroke_fa_must_destroy'),
                validTargets,
                { selectionCount: 1, isCancellable: false },
                t('attack_incoming_title')
            );

            const chosenId = chosenToDestroyIdArr[0];

            // Znajdź i zniszcz kartę
            let cardIndex = player.hand.findIndex(c => c.instanceId === chosenId);
            if (cardIndex !== -1) {
                const [destroyedCard] = player.hand.splice(cardIndex, 1);
                gameState.destroyedPile.push(destroyedCard);
                await engine.showNotification(`Zniszczyłeś "${destroyedCard.name_pl}" z ręki.`);
            } else {
                cardIndex = player.discard.findIndex(c => c.instanceId === chosenId);
                if (cardIndex !== -1) {
                    const [destroyedCard] = player.discard.splice(cardIndex, 1);
                    gameState.destroyedPile.push(destroyedCard);
                    await engine.showNotification(`Zniszczyłeś "${destroyedCard.name_pl}" ze stosu kart odrzuconych.`);
                }
            }
            break;
    }
        case 'each_player_reveals_hand_then_discards_cards_from_hand_count_equal_to_heroes_in_hand_choice': {
            await engine.promptWithCard(t('sinestro_fa_reveal_hand'), player.hand, [{text: "OK", value: true}]);

            const heroesInHand = player.hand.filter(c => c.type === 'Hero');
            const cardsToDiscardCount = heroesInHand.length;

            if (cardsToDiscardCount === 0) {
                await engine.showNotification(t('sinestro_fa_no_heroes'));
                return;
            }

            if (player.hand.length <= cardsToDiscardCount) {
                await engine.showNotification(t('darkseid_discard_all'));
                player.discard.push(...player.hand);
                player.hand = [];
            } else {
                const chosenCardIds = await engine.promptPlayerChoice(
                    t('sinestro_fa_discard_X').replace('{X}', cardsToDiscardCount),
                    player.hand,
                    { selectionCount: cardsToDiscardCount, isCancellable: false },
                    t('attack_incoming_title')
                );
                const cardsToDiscard = player.hand.filter(c => chosenCardIds.includes(c.instanceId));
                player.hand = player.hand.filter(c => !chosenCardIds.includes(c.instanceId));
                player.discard.push(...cardsToDiscard);
            }
            break;
        }
        case 'each_player_reveals_hand_then_discards_all_cards_from_hand_cost_le_2': {
            await engine.promptWithCard(t('parallax_fa_reveal_hand'), player.hand, [{text: "OK", value: true}]);

            const cardsToDiscard = player.hand.filter(c => c.cost <= 2);

            if (cardsToDiscard.length === 0) {
                await engine.showNotification(t('parallax_fa_no_targets'));
                return;
            }

            player.hand = player.hand.filter(c => c.cost > 2);
            player.discard.push(...cardsToDiscard);

            await engine.promptWithCard(
                t('parallax_fa_discarded'),
                cardsToDiscard,
                [{text: "OK", value: true}],
                t('attack_incoming_title')
            );
            break;
        }
        case 'each_player_chooses_1_from_hand_puts_on_left_opponent_discard_then_if_received_card_cost_ge_1_gain_weakness_on_top_of_deck': {
            console.log("Joker's First Appearance Attack: No other players to pass cards to in solo mode.");
            await engine.showNotification(t('joker_fa_solo_effect'));
            break;
        }
        case 'each_player_reveals_hand_then_chooses_1_card_cost_ge_1_from_hand_and_adds_to_lineup': {
            const validCards = player.hand.filter(c => c.cost >= 1);

            if (validCards.length === 0) {
                await engine.showNotification(t('anti_monitor_fa_no_cards'));
                return;
            }

            await engine.promptWithCard(t('anti_monitor_fa_reveal_hand'), player.hand, [{text: "OK", value: true}]);

            const chosenCardIdArr = await engine.promptPlayerChoice(
                t('anti_monitor_fa_choose_card'),
                validCards,
                { selectionCount: 1, isCancellable: false },
                t('attack_incoming_title')
            );

            const emptySlotIndex = gameState.lineUp.findIndex(c => c === null);
            if (emptySlotIndex === -1) {
                await engine.showNotification(t('anti_monitor_fa_no_space'));
                return;
            }

            const chosenId = chosenCardIdArr[0];
            const cardIndex = player.hand.findIndex(c => c.instanceId === chosenId);
            if (cardIndex !== -1) {
                const [movedCard] = player.hand.splice(cardIndex, 1);
                gameState.lineUp[emptySlotIndex] = movedCard;
            }
            break;
        }

        case 'each_player_gains_weakness_count_equal_to_villains_in_lineup': {
            const villainCount = gameState.lineUp.filter(card => card && (card.type === 'Villain' || card.type === 'Super-Villain')).length;

            if (villainCount === 0) {
                await engine.showNotification(t('lex_luthor_fa_no_villains'));
                return;
            }

            const weaknessesToGain = [];
            for (let i = 0; i < villainCount; i++) {
                if (gameState.weaknessStack.length > 0) {
                    weaknessesToGain.push(gameState.weaknessStack.shift());
                } else {
                    console.warn("Weakness stack is empty!");
                    break;
                }
            }

            if (weaknessesToGain.length > 0) {
                player.discard.push(...weaknessesToGain);

                const message = t('lex_luthor_fa_gain_weakness')
                    .replace('{X}', weaknessesToGain.length);

                await engine.promptWithCard(message, weaknessesToGain, [{ text: 'OK', value: true }]);
            }
            break;
        }
        default:
            console.warn(`Unhandled First Appearance Attack tag: ${effectTag}`);
    }
};