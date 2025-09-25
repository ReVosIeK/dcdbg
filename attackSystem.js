// attackSystem.js (Finalna, poprawiona wersja)
import { shuffle } from './utils.js';

export const AttackManager = {
    async handleAttack(attackDetails, gameState, engine) {
        const { attackingCard, source } = attackDetails;
        const target = gameState.player;        
        const defenseInfo = this.checkForDefenseOptions(attackingCard, target.hand);

        if (defenseInfo.options.length > 0) {
            const chosenDefense = await this.promptPlayerForDefense(defenseInfo, engine);
            
            if (chosenDefense) {
                if (defenseInfo.type === 'standard') {
                    const chosenDefenseCard = chosenDefense.card;
                    console.log(`[AttackManager] Player defended with ${chosenDefenseCard.name_en}`);
                    const langKey = `name_${currentLang}`;
                    const cardName = chosenDefenseCard[langKey] || chosenDefenseCard.name_en;
                    await engine.showNotification(t('attack_defended_notification').replace('{CARD_NAME}', cardName));
                    
                    const defenseTag = chosenDefenseCard.effect_tags.find(tag => tag.startsWith('defense_effect'));
                    if (defenseTag) {
                        await engine.applyCardEffect(defenseTag, gameState, target, { cardWithEffect: chosenDefenseCard });
                    }
                } else if (defenseInfo.type === 'reveal') {
                    await engine.showNotification(t('darkseid_reveal_success'));
                }
                return; 
            }
        }
        
        console.log('[AttackManager] Player did not defend. Applying attack effect.');
        await this.applyAttackEffect(attackingCard, target, gameState, engine);
    },

    checkForDefenseOptions(attackingCard, hand) {
        let defense = { type: 'none', options: [], prompt: '' };

        // 1. Sprawdź warunek specjalny (np. ujawnienie Łotra)
        if (attackingCard.attackDetails?.defenseCondition === 'reveal_villain') {
            const revealableCards = hand.filter(c => c.type === 'Villain' || c.type === 'Super-Villain');
            if (revealableCards.length > 0) {
                // Obrona specjalna ma priorytet i jest jedyną opcją
                defense.type = 'reveal';
                defense.options = revealableCards;
                defense.prompt = t('darkseid_reveal_prompt');
                return defense;
            }
        }

        // 2. Jeśli brak obrony specjalnej, szukaj standardowych kart z flagą isDefense
        const standardDefenses = hand.filter(card => card.isDefense === true);
        if (standardDefenses.length > 0) {
            defense.type = 'standard';
            defense.options = standardDefenses;
            defense.prompt = t('choose_defense_card_prompt');
        }

        return defense;
    },

    async promptPlayerForDefense(defenseInfo, engine) {
        const { options, prompt } = defenseInfo;
        const chosenIds = await engine.promptPlayerChoice(prompt, options, { selectionCount: 1, isCancellable: true });
        if (chosenIds && chosenIds.length > 0) {
            return { type: defenseInfo.type, card: options.find(card => card.instanceId === chosenIds[0]) };
        }
        return null;
    },

    async applyAttackEffect(attackingCard, target, gameState, engine) {
        const langKey = `name_${currentLang}`;
        const attackTag = attackingCard.effect_tags.find(tag => tag.startsWith('attack:') || tag.startsWith('first_appearance_attack:'));
        if (!attackTag) {
            console.error(`[AttackManager] No attack tag found on ${attackingCard.name_en}`);
            return;
        }
        const effectDetails = attackTag.split(':').slice(1).join(':');

        switch (effectDetails) {
            // === ATAKI Z KART GRACZA ===

            case 'each_opponent_discards_card_from_hand_choice': // Bane
                if (target.hand.length > 0) {
                    const chosenIds = await engine.promptPlayerChoice(t('choose_X_cards_to_discard').replace('{X}', 1), target.hand, { selectionCount: 1, isCancellable: false });
                    if (chosenIds && chosenIds.length > 0) {
                        const cardIndex = target.hand.findIndex(c => c.instanceId === chosenIds[0]);
                        if (cardIndex !== -1) {
                            const [discardedCard] = target.hand.splice(cardIndex, 1);
                            target.discard.push(discardedCard);
                        }
                    }
                }
                break;
            
            case 'each_opponent_gains_weakness': // Scarecrow
                if (gameState.weaknessStack.length > 0) {
                    const weaknessCard = gameState.weaknessStack.shift();
                    target.discard.push(weaknessCard);
                    await engine.showNotification(t('attack_hit_gain_weakness'));
                } else { console.log("[AttackManager] Weakness stack is empty, attack has no effect."); }
                break;
            
            case 'each_opponent_discards_deck_top_1_then_if_cost_ge_1_gain_weakness': // Poison Ivy
                if (target.deck.length > 0) {
                    const topCard = target.deck.pop();
                    target.discard.push(topCard);
                    if (topCard.cost >= 1) {
                        if (gameState.weaknessStack.length > 0) {
                            const weaknessCard = gameState.weaknessStack.shift();
                            target.discard.push(weaknessCard);
                            await engine.showNotification(t('attack_hit_gain_weakness'));
                        }
                    }
                }
                break;

            case 'each_opponent_moves_card_type_punch_or_vulnerability_from_discard_to_top_of_deck_choice': // Harley Quinn
                const validCards = target.discard.filter(c => c.id === 'punch' || c.id === 'vulnerability');
                if (validCards.length > 0) {
                    const chosenIds = await engine.promptPlayerChoice('Choose a card to move to the top of your deck', validCards, { selectionCount: 1, isCancellable: false });
                    if (chosenIds && chosenIds.length > 0) {
                        const cardIndex = target.discard.findIndex(c => c.instanceId === chosenIds[0]);
                        if (cardIndex !== -1) {
                            const [movedCard] = target.discard.splice(cardIndex, 1);
                            target.deck.push(movedCard);
                        }
                    }
                }
                break;

            case 'each_opponent_discards_deck_top_1_then_active_player_plays_discarded_non_locations': // Starro
                if (target.deck.length === 0) {
                    await engine.showNotification(t('deck_is_empty_effect_cannot_be_used'));
                    return;
                }

                const topCard = target.deck.pop();
                target.discard.push(topCard);

                if (topCard.type !== 'Location') {
                    const useAbility = await engine.promptWithCard(
                        `You discarded "${topCard.name_en}". Do you want to play it?`,
                        topCard,
                        [
                            { text: t('yes'), value: true },
                            { text: t('no'), value: false, isSecondary: true }
                        ],
                        'Starro\'s Attack'
                    );

                    if (useAbility) {
                        target.discard.pop(); // Usuń kartę z discard, bo ją zagramy
                        await engine.playCard(topCard, { isTemporary: false });
                    }
                }
                break;
    //next  case        
            
            // === ATAKI Z PIERWSZEGO POJAWIENIA ===

            case 'darkseid_fa': { // Darkseid
                if (target.hand.length <= 2) {
                    await engine.showNotification(t('darkseid_discard_all'));
                    target.discard.push(...target.hand);
                    target.hand = [];
                } else {
                    const chosenCardIds = await engine.promptPlayerChoice(t('darkseid_discard_2'), target.hand, { selectionCount: 2, isCancellable: false });
                    if (chosenCardIds && chosenCardIds.length > 0) {
                        const cardsToDiscard = target.hand.filter(c => chosenCardIds.includes(c.instanceId));
                        target.hand = target.hand.filter(c => !chosenCardIds.includes(c.instanceId));
                        target.discard.push(...cardsToDiscard);
                    }
                }
                break;
            }

            case 'deathstroke_fa': { // Deathstroke
                const validTargets = [...target.hand, ...target.discard].filter(c => ['Hero', 'Super Power', 'Equipment'].includes(c.type));
                if (validTargets.length > 0) {
                    await engine.promptWithCard(t('deathstroke_fa_reveal_hand'), target.hand, [{text: "OK", value: true}], t('attack_incoming_title'));
                    const chosenIdArr = await engine.promptPlayerChoice(t('deathstroke_fa_must_destroy'), validTargets, { selectionCount: 1, isCancellable: false });
                    const chosenId = chosenIdArr[0];
                    let cardIndex = target.hand.findIndex(c => c.instanceId === chosenId);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = target.hand.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                    } else {
                        cardIndex = target.discard.findIndex(c => c.instanceId === chosenId);
                        if (cardIndex !== -1) {
                            const [destroyedCard] = target.discard.splice(cardIndex, 1);
                            gameState.destroyedPile.push(destroyedCard);
                        }
                    }
                } else {
                    await engine.showNotification(t('deathstroke_fa_no_targets'));
                }
                break;
        }

            case 'joker_fa': { // Joker 
                await engine.showNotification(t('joker_fa_solo_effect'));
                break;
            }

            case 'captain_cold_fa': // Captain Cold
                gameState.superheroAbilitiesDisabled = true;
                await engine.showNotification(t('captain_cold_fa_text'));
                engine.renderGameBoard(); // Odśwież planszę, aby odwrócić kartę
                break;

            case 'brainiac_fa': { // Brainiac
                if (target.hand.length < 2) {
                    await engine.showNotification(t('brainiac_fa_not_enough_cards'));
                    return;
                }
                const chosenCardIds = await engine.promptPlayerChoice(
                    t('brainiac_choose_cards'),
                    target.hand,
                    { selectionCount: 2, isCancellable: false }
                );
                const pooledCards = [];
                chosenCardIds.forEach(id => {
                    const cardIndex = target.hand.findIndex(c => c.instanceId === id);
                    if (cardIndex !== -1) {
                        pooledCards.push(target.hand.splice(cardIndex, 1)[0]);
                    }
                });
                console.log("Brainiac's Attack: Card pool created.", pooledCards);
                shuffle(pooledCards);
                target.hand.push(...pooledCards);
                await engine.showCardPoolNotification(
                    t('brainiac_cards_returned'),
                    pooledCards
                );
                break;
            }

            case 'black_manta_fa': { // Black Manta
                if (target.deck.length === 0) {
                    await engine.showNotification(t('deck_is_empty_effect_cannot_be_used'));
                    return;
                }
                const topCard = target.deck.pop();
                target.discard.push(topCard);
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
                        const cardIndex = target.discard.findIndex(c => c.instanceId === topCard.instanceId);
                        if (cardIndex !== -1) {
                            const [destroyedCard] = target.discard.splice(cardIndex, 1);
                            gameState.destroyedPile.push(destroyedCard);
                            await engine.showNotification(t('card_destroyed_notification').replace('{CARD_NAME}', destroyedCard[langKey] || destroyedCard.name_en));
                        }
                    } else {
                        if (target.hand.length > 0) {
                            target.discard.push(...target.hand);
                            target.hand = [];
                            await engine.showNotification(t('hand_discarded_notification'));
                        } else {
                            await engine.showNotification(t('hand_already_empty_notification'));
                        }
                    }
                }
                break;
            }

            case 'anti_monitor_fa': { // Anti Monitor
                const validCards = target.hand.filter(c => c.cost >= 1);
                if (validCards.length === 0) {
                    await engine.showNotification(t('anti_monitor_fa_no_cards'));
                    return;
                }

                await engine.promptWithCard(t('anti_monitor_fa_reveal_hand'), target.hand, [{text: "OK", value: true}], t('attack_incoming_title'));

                const chosenCardIdArr = await engine.promptPlayerChoice(
                    t('anti_monitor_fa_choose_card'),
                    validCards,
                    { selectionCount: 1, isCancellable: false }
                );

                if (!chosenCardIdArr || chosenCardIdArr.length === 0) return;

                const chosenId = chosenCardIdArr[0];
                const cardIndex = target.hand.findIndex(c => c.instanceId === chosenId);
                if (cardIndex !== -1) {
                    const [movedCard] = target.hand.splice(cardIndex, 1);

                    gameState.lineUp.push(movedCard);

                    console.log(`Anti-Monitor's attack added ${movedCard.name_pl} to the Line-Up, expanding it to ${gameState.lineUp.length} cards.`);
                }
                break;
            }

            case 'atrocitus_fa': {
                if (target.hand.length === 0) {
                    await engine.showNotification(t('atrocitus_fa_no_cards'));
                    return;
                }
                const randomIndex = Math.floor(Math.random() * target.hand.length);
                const [removedCard] = target.hand.splice(randomIndex, 1);
                gameState.cardsUnderSuperheroes.push({
                    card: removedCard,
                    playerId: 'player1',
                    tiedToVillainId: attackingCard.id
                });
                await engine.promptWithCard(
                t('atrocitus_fa_card_taken'),
                removedCard,
                [{ text: 'OK', value: true }],
                t('attack_incoming_title')
                );
                break;
            }

            case 'lex_luthor_fa': {
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
                    target.discard.push(...weaknessesToGain);

                    const message = t('lex_luthor_fa_gain_weakness')
                        .replace('{X}', weaknessesToGain.length);

                    await engine.promptWithCard(message, weaknessesToGain, [{ text: 'OK', value: true }]);
                }
                break;
            }

            case 'parallax_fa': {
                await engine.promptWithCard(t('parallax_fa_reveal_hand'), target.hand, [{text: "OK", value: true}], t('attack_incoming_title'));

                const cardsToDiscard = target.hand.filter(c => c.cost <= 2);

                if (cardsToDiscard.length === 0) {
                    await engine.showNotification(t('parallax_fa_no_targets'));
                    return;
                }

                target.hand = target.hand.filter(c => c.cost > 2);
                target.discard.push(...cardsToDiscard);

                await engine.promptWithCard(
                    t('parallax_fa_discarded'),
                    cardsToDiscard,
                    [{text: "OK", value: true}],
                    t('attack_incoming_title')
                );
                break;
            }

            case 'sinestro_fa': {
                await engine.promptWithCard(t('sinestro_fa_reveal_hand'), target.hand, [{text: "OK", value: true}], t('attack_incoming_title'));

                const heroesInHand = target.hand.filter(c => c.type === 'Hero');
                const cardsToDiscardCount = heroesInHand.length;

                if (cardsToDiscardCount === 0) {
                    await engine.showNotification(t('sinestro_fa_no_heroes'));
                    return;
                }

                if (target.hand.length <= cardsToDiscardCount) {
                    await engine.showNotification(t('darkseid_discard_all'));
                    target.discard.push(...target.hand);
                    target.hand = [];
                } else {
                    const chosenCardIds = await engine.promptPlayerChoice(
                        t('sinestro_fa_discard_X').replace(/{X}/g, cardsToDiscardCount),
                        target.hand,
                        { selectionCount: cardsToDiscardCount, isCancellable: false },
                        t('attack_incoming_title')
                    );
                    const cardsToDiscard = target.hand.filter(c => chosenCardIds.includes(c.instanceId));
                    target.hand = target.hand.filter(c => !chosenCardIds.includes(c.instanceId));
                    target.discard.push(...cardsToDiscard);
                }
                break;
            }
    //next  case
            
            default:
                // Sprawdź, czy logika istnieje jeszcze w starym systemie
                if (cardEffects.first_appearance_attack) {
                    console.warn(`[AttackManager] Using fallback logic for FA Attack: ${effectDetails}`);
                    await cardEffects.first_appearance_attack(gameState, target, `first_appearance_attack:${effectDetails}`, engine, { revealedCard: attackingCard });
                } else {
                    console.warn(`[AttackManager] Unhandled attack effect: ${effectDetails}`);
                }
        }
    }
};