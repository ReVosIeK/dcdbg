import { AttackManager } from './attackSystem.js';
import { shuffle, drawCards } from './utils.js';
import { aiPlayer, initializeAI, executeAITurn } from './aiPlayer.js';

export const STANDARD_LINEUP_SIZE = 5;

export function createCardElement(cardData) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.dataset.instanceId = cardData.instanceId;
    cardEl.dataset.cardId = cardData.id;
    cardEl.style.backgroundImage = `url('${cardData.image_path}')`;
    cardEl.style.backgroundSize = 'cover';
    cardEl.style.backgroundPosition = 'center';
    return cardEl;
}

document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKTORY ELEMENTÓW DOM ---
    const screens = { start: document.getElementById('start-screen'), mainMenu: document.getElementById('main-menu-screen'), settings: document.getElementById('settings-screen'), game: document.getElementById('game-container'), 'pre-game': document.getElementById('pre-game-modal') };
    const buttons = { play: document.getElementById('play-button'), singlePlayer: document.getElementById('single-player-button'), multiplayer: document.getElementById('multiplayer-button'), settings: document.getElementById('settings-button'), backToMenu: document.getElementById('back-to-menu-button'), endTurn: document.getElementById('end-turn-button') };
    const gameBoardElements = { playerHand: document.getElementById('player-hand-container'), handCardsWrapper: document.getElementById('hand-cards-wrapper'), lineUp: document.getElementById('line-up-container'), playArea: document.getElementById('play-area-container'), playAreaWrapper: document.getElementById('play-area-wrapper'), mainDeck: document.getElementById('main-deck-container'), playerDeck: document.getElementById('player-deck-container'), playerDiscard: document.getElementById('discard-pile-container'), locations: document.getElementById('locations-container'), destroyed: document.getElementById('destroyed-pile-container'), kickStack: document.getElementById('kick-stack-container'), weaknessStack: document.getElementById('weakness-stack-container'), superVillainStack: document.getElementById('super-villain-stack-container'), superheroArea: document.getElementById('superhero-card-area'), powerValue: document.getElementById('power-value'), };
    const debug = { toggleButton: document.getElementById('debug-toggle-button'), closeButton: document.getElementById('debug-close-button'), panel: document.getElementById('debug-panel'), powerAdd: document.getElementById('debug-power-add'), powerRemove: document.getElementById('debug-power-remove'), drawCard: document.getElementById('debug-draw-card'), endGame: document.getElementById('debug-end-game'), addToHandBtn: document.getElementById('debug-add-to-hand-btn'), addToLineupBtn: document.getElementById('debug-add-to-lineup-btn'), destroyCardBtn: document.getElementById('debug-destroy-card-btn'), selectionContainer: document.getElementById('debug-selection-container'), browseStacksBtn: document.getElementById('debug-browse-stacks-btn'), setSpecialBtn: document.getElementById('debug-set-special-btn') };
    const cardInspectorModal = document.getElementById('card-inspector-modal');
    const closeModalButton = cardInspectorModal?.querySelector('.close-button');
    const settingsIngameButton = document.getElementById('settings-ingame-button');
    const resetGameButton = document.getElementById('reset-game-button');
    const ingameSettingsModal = document.getElementById('ingame-settings-modal');
    const closeIngameSettingsButton = ingameSettingsModal?.querySelector('.close-button');
    const uiScaleSlider = document.getElementById('ui-scale-slider-ingame');
    const gameBoard = document.getElementById('game-board');
    const choiceModal = document.getElementById('choice-modal');
    const choiceModalTitle = document.getElementById('choice-modal-title');
    const choiceModalCards = document.getElementById('choice-modal-cards');
    const choiceModalCancel = document.getElementById('choice-modal-cancel');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationText = document.getElementById('confirmation-text');

    // --- STAN GRY I USTAWIENIA ---
    let gameState = {};
    let settingsState = {
        showPolishTooltips: false
    };
    let temporaryCardContext = [];

    function t(key) {
        return translations[currentLang][key] || key;
    }

    async function init() {
        setupEventListeners();
        await loadCardData();
        setLanguage('en');
        showScreen('start');
    }

    async function loadCardData() {
        try {
            const response = await fetch('cards.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            gameState.allCards = await response.json();
            console.log("Card data loaded successfully.");
        } catch (error) { console.error("Could not load card data:", error); }
    }

    function setupEventListeners() {
        const languageSelect = document.getElementById('language-select');
        const languageSelectIngame = document.getElementById('language-select-ingame');
        const polishToggle = document.getElementById('polish-descriptions-toggle');
        const polishToggleIngame = document.getElementById('polish-descriptions-toggle-ingame');
        const preGameModal = document.getElementById('pre-game-modal');
        const exitGameButton = document.getElementById('exit-game-button');

        if(buttons.play) buttons.play.addEventListener('click', () => showScreen('mainMenu'));
        if(buttons.settings) buttons.settings.addEventListener('click', () => showScreen('settings'));
        if(buttons.backToMenu) buttons.backToMenu.addEventListener('click', () => showScreen('mainMenu'));
        
        if(buttons.singlePlayer) buttons.singlePlayer.addEventListener('click', () => showScreen('pre-game'));
        
        if(preGameModal) {
            const step1 = document.getElementById('pre-game-step-1');
            const step2 = document.getElementById('pre-game-step-2');
            let chosenSuperheroCount = 1; // Domyślna wartość

            const setupDifficultyButtons = () => {
                step2.querySelectorAll('.btn').forEach(button => {
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    newButton.addEventListener('click', () => {
                        const difficulty = newButton.dataset.difficulty;
                        showScreen('game');
                        startGame({ 
                            superheroCount: chosenSuperheroCount,
                            difficulty: difficulty 
                        });
                    });
                });
            };

            document.getElementById('play-one-superhero-btn').addEventListener('click', () => {
                chosenSuperheroCount = 1;
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
            });

            document.getElementById('play-two-superheroes-btn').addEventListener('click', () => {
                chosenSuperheroCount = 2;
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
            });

            document.getElementById('back-to-main-menu-from-pre-game').addEventListener('click', () => {

                step2.classList.add('hidden');
                step1.classList.remove('hidden');
                showScreen('mainMenu');
            });

            setupDifficultyButtons();
        }

        if(gameBoard) gameBoard.addEventListener('contextmenu', handleCardRightClick);
        if(choiceModal) choiceModal.addEventListener('contextmenu', handleCardRightClick);
        
        if(closeModalButton) closeModalButton.addEventListener('click', hideInspector);
        if(cardInspectorModal) cardInspectorModal.addEventListener('click', (e) => { if (e.target === cardInspectorModal) hideInspector(); });
        if(gameBoardElements.playerHand) gameBoardElements.playerHand.addEventListener('click', handlePlayerHandClick);
        if(gameBoardElements.lineUp) gameBoardElements.lineUp.addEventListener('click', handleLineUpClick);
        if(gameBoardElements.kickStack) gameBoardElements.kickStack.addEventListener('click', handleKickStackClick);
        if(gameBoardElements.superVillainStack) gameBoardElements.superVillainStack.addEventListener('click', handleSuperVillainStackClick);
        if(buttons.endTurn) buttons.endTurn.addEventListener('click', endTurn);
        
        if(languageSelect) languageSelect.addEventListener('change', (e) => { setLanguage(e.target.value); });
        if(languageSelectIngame) languageSelectIngame.addEventListener('change', (e) => { setLanguage(e.target.value); renderGameBoard(); });

        if(polishToggle) polishToggle.addEventListener('change', (e) => {
            settingsState.showPolishTooltips = e.target.checked;
            if(polishToggleIngame) polishToggleIngame.checked = e.target.checked;
        });
        if(polishToggleIngame) polishToggleIngame.addEventListener('change', (e) => {
            settingsState.showPolishTooltips = e.target.checked;
            if(polishToggle) polishToggle.checked = e.target.checked;
        });

        if(settingsIngameButton) settingsIngameButton.addEventListener('click', () => { if(ingameSettingsModal) ingameSettingsModal.classList.remove('hidden'); });
        if(closeIngameSettingsButton) closeIngameSettingsButton.addEventListener('click', () => { if(ingameSettingsModal) ingameSettingsModal.classList.add('hidden'); });
        if(ingameSettingsModal) ingameSettingsModal.addEventListener('click', (e) => { if (e.target === ingameSettingsModal) ingameSettingsModal.classList.add('hidden'); });
        
        if(resetGameButton) resetGameButton.addEventListener('click', async () => {
            const userConfirmed = await promptConfirmation(t('reset_game_confirm'));
            if (userConfirmed) {
                console.clear(); 
                startGame({ superheroCount: gameState.player.superheroes.length });
            }
        });
        
        if(exitGameButton) {
            exitGameButton.addEventListener('click', async () => {
                const userConfirmed = await promptConfirmation(t('exit_game_confirm'));
                if (userConfirmed) {
                    console.clear();

                    const step1 = document.getElementById('pre-game-step-1');
                    const step2 = document.getElementById('pre-game-step-2');
                    if (step1 && step2) {
                        step2.classList.add('hidden');
                        step1.classList.remove('hidden');
                    }

                    showScreen('mainMenu');
                }
            });
        }

        if(uiScaleSlider) uiScaleSlider.addEventListener('input', (e) => { if(gameBoard) gameBoard.style.transform = `scale(${e.target.value})`; });
        
        if(debug.toggleButton) debug.toggleButton.addEventListener('click', () => { debug.panel.classList.toggle('hidden'); debug.selectionContainer.innerHTML = ''; });
        if(debug.closeButton) debug.closeButton.addEventListener('click', () => { debug.panel.classList.add('hidden'); debug.selectionContainer.innerHTML = ''; });
        
        if(debug.powerAdd) debug.powerAdd.addEventListener('click', async () => {
            if (!gameState.player) return;
            const amount = await promptForValue(t('debug_add_power'));
            if (amount !== null && amount > 0) {
                gameState.currentPower += amount;
                renderGameBoard();
            }
        });

        if(debug.powerRemove) debug.powerRemove.addEventListener('click', async () => {
            if (!gameState.player) return;
            const amount = await promptForValue(t('debug_remove_power'));
            if (amount !== null && amount > 0) {
                gameState.currentPower = Math.max(0, gameState.currentPower - amount);
                renderGameBoard();
            }
        });

        if(debug.drawCard) debug.drawCard.addEventListener('click', () => { if (!gameState.player) return; drawCards(gameState.player, 1, gameState); renderGameBoard(); });
        if(debug.endGame) debug.endGame.addEventListener('click', () => {
            const score = calculatePlayerScore(gameState.player);
            alert(t('debug_end_game_alert').replace('{SCORE}', score));
        });
        if(debug.addToHandBtn) debug.addToHandBtn.addEventListener('click', () => createCardSelector('addToHand', t('add_to_hand_prompt')));
        if(debug.addToLineupBtn) debug.addToLineupBtn.addEventListener('click', () => createCardSelector('addToLineup', t('add_to_lineup_prompt')));
        if(debug.destroyCardBtn) debug.destroyCardBtn.addEventListener('click', () => createCardSelector('destroyCard', t('destroy_card_prompt')));
        if(debug.browseStacksBtn) debug.browseStacksBtn.addEventListener('click', () => showStackSelector());
        if(debug.setSpecialBtn) debug.setSpecialBtn.addEventListener('click', () => createSpecialCardSetter());
        
        if(choiceModalCancel) choiceModalCancel.addEventListener('click', () => choiceModal.classList.add('hidden'));
        
        const debugHeader = debug.panel?.querySelector('h3');
        if (debugHeader) {
            let isDragging = false, offsetX, offsetY;
            debugHeader.addEventListener('mousedown', (e) => { isDragging = true; offsetX = e.clientX - debug.panel.offsetLeft; offsetY = e.clientY - debug.panel.offsetTop; debug.panel.style.transform = 'none'; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); });
            function onMouseMove(e) { if (!isDragging) return; debug.panel.style.left = `${e.clientX - offsetX}px`; debug.panel.style.top = `${e.clientY - offsetY}px`; }
            function onMouseUp() { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); }
        }
        
        const makeWrapperDraggable = (wrapperElement) => {
            if(!wrapperElement) return;
            let isDown = false, startX, scrollLeft;
            wrapperElement.addEventListener('mousedown', (e) => { isDown = true; wrapperElement.classList.add('active'); startX = e.pageX - wrapperElement.offsetLeft; scrollLeft = wrapperElement.scrollLeft; });
            wrapperElement.addEventListener('mouseleave', () => { isDown = false; wrapperElement.classList.remove('active'); });
            wrapperElement.addEventListener('mouseup', () => { isDown = false; wrapperElement.classList.remove('active'); });
            wrapperElement.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - wrapperElement.offsetLeft; const walk = (x - startX) * 2; wrapperElement.scrollLeft = scrollLeft - walk; });
        };
        makeWrapperDraggable(gameBoardElements.handCardsWrapper);
        makeWrapperDraggable(gameBoardElements.playAreaWrapper);
    }

    window.showDebugPanel = function(visible) {
        if (debug.toggleButton) {
            if (visible) {
                debug.toggleButton.classList.remove('hidden');
                console.log('Przycisk panelu debugowania został WŁĄCZONY.');
            } else {
                debug.toggleButton.classList.add('hidden');
                debug.panel.classList.add('hidden');
                console.log('Przycisk panelu debugowania został WYŁĄCZONY.');
            }
        } else {
            console.error('Nie znaleziono przycisku panelu debugowania.');
        }
    };
    
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => { if(screen) screen.classList.remove('active'); });
        if(screens[screenId]) screens[screenId].classList.add('active');
    }

    function findCardByInstanceId(instanceId) {
        if (!gameState.player) return null;
        const allCardLocations = [ ...gameState.player.hand, ...gameState.player.discard, ...gameState.player.playedCards, ...gameState.player.deck, ...gameState.lineUp, ...gameState.kickStack, ...gameState.weaknessStack, ...gameState.superVillainStack, ...gameState.destroyedPile, ...gameState.player.ongoing, ...gameState.player.superheroes, ...temporaryCardContext ];
        const uniqueCards = [...new Map(allCardLocations.filter(c => c).map(item => [item.instanceId, item])).values()];
        return uniqueCards.find(card => card && card.instanceId === instanceId);
    }

    function handleCardRightClick(event) {
        event.preventDefault();
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        
        const instanceId = cardElement.dataset.instanceId;
        if (!instanceId) return;
        
        const cardData = findCardByInstanceId(instanceId);
        if (!cardData || !cardData.image_path) return;

        const inspectorImage = document.getElementById('inspector-image');
        const descriptionPanel = document.getElementById('inspector-description-panel');
        const descriptionText = document.getElementById('inspector-description-text');

        if (!inspectorImage || !descriptionPanel || !descriptionText) return;

        inspectorImage.src = cardData.image_path;

        if (settingsState.showPolishTooltips && cardData.ability_pl && cardData.ability_pl.trim() !== "") {
            descriptionText.innerHTML = cardData.ability_pl;
            descriptionPanel.classList.remove('hidden');
        } else {
            descriptionPanel.classList.add('hidden');
        }

        cardInspectorModal.classList.remove('hidden');
    }

    function hideInspector() {
        if(cardInspectorModal) cardInspectorModal.classList.add('hidden');
    }
    
    function promptPlayerChoice(title, cards, options = {}) {
        const { selectionCount = 1, isCancellable = true, canSelectLess = false, modalClass = '' } = options;
        
        let selectedIds = [];

        const updateTitle = () => {
            const selectionInfo = selectionCount > 1 ? `(${selectedIds.length}/${selectionCount})` : '';
            choiceModalTitle.textContent = `${title} ${selectionInfo}`;
        };

        return new Promise(resolve => {
            if (!choiceModal) return resolve(isCancellable ? null : []);
            
            temporaryCardContext = cards;
            if (modalClass) choiceModal.classList.add(modalClass);

            const confirmBtn = document.getElementById('choice-modal-confirm');
            const cancelBtn = document.getElementById('choice-modal-cancel');

            const cleanupAndResolve = (value) => {
                temporaryCardContext = [];
                if (modalClass) choiceModal.classList.remove(modalClass);
                choiceModal.classList.add('hidden');
                resolve(value);
            };

            updateTitle();
            choiceModalCards.innerHTML = '';
            
            if(confirmBtn) confirmBtn.classList.toggle('hidden', !canSelectLess);
            if(cancelBtn) cancelBtn.style.display = isCancellable ? 'inline-block' : 'none';

            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => cleanupAndResolve(null), { once: true });
            
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', () => cleanupAndResolve(selectedIds), { once: true });

            cards.forEach(card => {
                const cardEl = createCardElement(card);
                cardEl.addEventListener('click', () => {
                    cardEl.classList.toggle('selected');
                    if (selectedIds.includes(card.instanceId)) {
                        selectedIds = selectedIds.filter(id => id !== card.instanceId);
                    } else {
                        if (selectedIds.length < selectionCount) {
                            selectedIds.push(card.instanceId);
                        }
                    }
                    updateTitle();
                    if (!canSelectLess && selectedIds.length === selectionCount) {
                        cleanupAndResolve(selectedIds);
                    }
                });
                choiceModalCards.appendChild(cardEl);
            });
            
            choiceModal.classList.remove('hidden');
        });
    }

    function promptConfirmation(text, yesText = t('yes'), noText = t('no')) {
        return new Promise(resolve => {
            if(!confirmationModal) { console.error("Confirmation modal not found in HTML!"); return resolve(false); }
            confirmationText.textContent = text;
            const yesBtn = document.getElementById('confirm-yes-btn');
            const noBtn = document.getElementById('confirm-no-btn');
            yesBtn.textContent = yesText;
            noBtn.textContent = noText;
            confirmationModal.classList.remove('hidden');
            const cleanupAndResolve = (value) => {
                confirmationModal.classList.add('hidden');
                resolve(value);
            };
            const onYes = () => cleanupAndResolve(true);
            const onNo = () => cleanupAndResolve(false);
            const newYesBtn = yesBtn.cloneNode(true);
            const newNoBtn = noBtn.cloneNode(true);
            yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
            noBtn.parentNode.replaceChild(newNoBtn, noBtn);
            newYesBtn.addEventListener('click', onYes, { once: true });
            newNoBtn.addEventListener('click', onNo, { once: true });
        });
    }

    function promptForValue(title, defaultValue = 1) {
        return new Promise(resolve => {
            const inputModal = document.getElementById('input-modal');
            const titleEl = document.getElementById('input-modal-title');
            const inputEl = document.getElementById('input-modal-input');
            const okBtn = document.getElementById('input-modal-ok');
            const cancelBtn = document.getElementById('input-modal-cancel');
            if(!inputModal || !titleEl || !inputEl || !okBtn || !cancelBtn) { return resolve(null); }
            titleEl.textContent = title;
            inputEl.value = defaultValue;
            inputModal.classList.remove('hidden');
            inputEl.focus();
            inputEl.select();
            const cleanupAndResolve = (value) => {
                inputModal.classList.add('hidden');
                okBtn.parentNode.replaceChild(okBtn.cloneNode(true), okBtn);
                cancelBtn.parentNode.replaceChild(cancelBtn.cloneNode(true), cancelBtn);
                resolve(value);
            };
            const onOk = () => {
                const value = parseInt(inputEl.value, 10);
                cleanupAndResolve(isNaN(value) ? null : value);
            };
            const onCancel = () => {
                cleanupAndResolve(null);
            };
            okBtn.addEventListener('click', onOk, { once: true });
            cancelBtn.addEventListener('click', onCancel, { once: true });
        });
    }

    function showNotification(text, buttonText = 'OK') {
        return new Promise(resolve => {
            if(!confirmationModal) { return resolve(); }
            confirmationText.textContent = text;
            const yesBtn = document.getElementById('confirm-yes-btn');
            const noBtn = document.getElementById('confirm-no-btn');
            yesBtn.textContent = buttonText;
            noBtn.style.display = 'none';
            confirmationModal.classList.remove('hidden');
            const cleanupAndResolve = () => {
                confirmationModal.classList.add('hidden');
                noBtn.style.display = 'inline-block';
                resolve();
            };
            const onOk = () => cleanupAndResolve();
            const newYesBtn = yesBtn.cloneNode(true);
            yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
            newYesBtn.addEventListener('click', onOk, { once: true });
        });
    }

    function promptWithCard(text, cards, buttons, title = t('decision_title')) {
        return new Promise(resolve => {
            const modal = document.getElementById('card-prompt-modal');
            const titleEl = document.getElementById('card-prompt-title');
            const cardArea = document.getElementById('card-prompt-card-area');
            const textEl = document.getElementById('card-prompt-text');
            const buttonsArea = document.getElementById('card-prompt-buttons');
            if(!modal || !cardArea || !textEl || !buttonsArea) { return resolve(null); }

            titleEl.textContent = title; // Użyj przekazanego lub domyślnego tytułu
            textEl.textContent = text;
            cardArea.innerHTML = '';
            buttonsArea.innerHTML = '';

            const cardList = Array.isArray(cards) ? cards : [cards];
            cardList.forEach(card => {
                cardArea.appendChild(createCardElement(card));
            });

            const cleanupAndResolve = (value) => {
                modal.classList.add('hidden');
                resolve(value);
            };

            buttons.forEach(buttonInfo => {
                const button = document.createElement('button');
                button.textContent = buttonInfo.text;
                button.classList.add('btn');
                if (buttonInfo.isSecondary) {
                    button.classList.add('btn-secondary');
                }
                button.addEventListener('click', () => cleanupAndResolve(buttonInfo.value), { once: true });
                buttonsArea.appendChild(button);
            });

            modal.classList.remove('hidden');
        });
    }

    function showCardPoolNotification(text, cards) {
        return new Promise(resolve => {
            const modal = document.getElementById('card-pool-modal');
            const textEl = document.getElementById('card-pool-text');
            const cardsArea = document.getElementById('card-pool-cards');
            const buttonsArea = document.getElementById('card-pool-buttons');

            if(!modal || !textEl || !cardsArea || !buttonsArea) {
                console.error("Card Pool Modal elements not found!");
                return resolve();
            }

            textEl.textContent = text;
            cardsArea.innerHTML = '';
            buttonsArea.innerHTML = '';

            cards.forEach(card => cardsArea.appendChild(createCardElement(card)));

            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.classList.add('btn');
            okButton.addEventListener('click', () => {
                modal.classList.add('hidden');
                resolve();
            }, { once: true });

            buttonsArea.appendChild(okButton);
            modal.classList.remove('hidden');
        });
    }

    function createCardSelector(action, labelText) {
        if (!debug.selectionContainer) return;
        const langKey = `name_${currentLang}`;
        const showTypeSelector = () => {
            debug.selectionContainer.innerHTML = '';
            const label = document.createElement('label');
            label.textContent = t('debug_choose_card_type_first');
            const select = document.createElement('select');
            const cardTypes = ['Equipment', 'Hero', 'Location', 'Super Power', 'Villain', 'Super-Villain', 'Others'].sort();
            cardTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = (type === 'Super Power') ? 'Super Power / Kick' : type;
                select.appendChild(option);
            });
            const nextButton = document.createElement('button');
            nextButton.textContent = t('debug_next_button');
            nextButton.onclick = () => { showCardSelector(select.value); };
            const cancelButton = document.createElement('button');
            cancelButton.textContent = t('cancel');
            cancelButton.onclick = () => { debug.selectionContainer.innerHTML = ''; };
            debug.selectionContainer.append(label, select, nextButton, cancelButton);
            select.size = Math.min(10, cardTypes.length);
        };
        const showCardSelector = (selectedType) => {
            debug.selectionContainer.innerHTML = '';
            const label = document.createElement('label');
            label.textContent = labelText;
            const select = document.createElement('select');
            let cardsToDisplay;
            if (selectedType === 'Super Power') {
                cardsToDisplay = gameState.allCards.filter(card => card.type === 'Super Power' || card.type === 'Kick');
            } else if (selectedType === 'Others') {
                cardsToDisplay = gameState.allCards.filter(card => card.type === 'Starter' || card.type === 'Weakness');
            } else {
                cardsToDisplay = gameState.allCards.filter(card => card.type === selectedType);
            }
            cardsToDisplay.sort((a, b) => (a[langKey] || a.name_en).localeCompare(b[langKey] || b.name_en));
            cardsToDisplay.forEach(card => {
                const option = document.createElement('option');
                option.value = card.id;
                option.textContent = `${card[langKey] || card.name_en} [${card.type}]`;
                select.appendChild(option);
            });
            const confirmButton = document.createElement('button');
            confirmButton.textContent = t('confirm');
            confirmButton.onclick = () => {
                if (select.value) handleDebugAction(action, select.value);
                debug.selectionContainer.innerHTML = '';
            };
            const backButton = document.createElement('button');
            backButton.textContent = t('back_to_menu');
            backButton.onclick = showTypeSelector;
            const cancelButton = document.createElement('button');
            cancelButton.textContent = t('cancel');
            cancelButton.onclick = () => { debug.selectionContainer.innerHTML = ''; };
            debug.selectionContainer.append(label, select, confirmButton, backButton, cancelButton);
            select.size = Math.min(10, cardsToDisplay.length > 0 ? cardsToDisplay.length : 5);
            select.style.width = 'auto';
            select.style.minWidth = '250px';
        };
        showTypeSelector();
    }

    function handleDebugAction(action, value) {
        let cardData;
        switch(action) {
            case 'addToHand':
                cardData = gameState.allCards.find(c => c.id === value);
                if (cardData) gameState.player.hand.push({...cardData, instanceId: `${value}_${Date.now()}`});
                break;
            case 'addToLineup':
                cardData = gameState.allCards.find(c => c.id === value);
                if (cardData) {
                    gameState.lineUp.push({...cardData, instanceId: `${value}_${Date.now()}`});
                    console.log(`DEBUG: Added ${cardData.name_pl} to the Line-Up, expanding it to ${gameState.lineUp.length} cards.`);
                }
                break;
            case 'destroyCard':
                let wasDestroyed = false;
                let sourcePileName = '';
                let cardIndex = gameState.player.hand.findIndex(c => c.id === value);
                if (cardIndex !== -1) {
                    const [destroyedCard] = gameState.player.hand.splice(cardIndex, 1);
                    gameState.destroyedPile.push(destroyedCard);
                    wasDestroyed = true;
                    sourcePileName = 'ręki';
                }
                if (!wasDestroyed) {
                    cardIndex = gameState.player.discard.findIndex(c => c.id === value);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = gameState.player.discard.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                        wasDestroyed = true;
                        sourcePileName = 'stosu kart odrzuconych';
                    }
                }
                if (!wasDestroyed) {
                    cardIndex = gameState.player.deck.findIndex(c => c.id === value);
                    if (cardIndex !== -1) {
                        const [destroyedCard] = gameState.player.deck.splice(cardIndex, 1);
                        gameState.destroyedPile.push(destroyedCard);
                        wasDestroyed = true;
                        sourcePileName = 'talii';
                    }
                }
                if (wasDestroyed) {
                    console.log(`Zniszczono kartę typu ${value} z ${sourcePileName}.`);
                } else {
                    alert("Nie posiadasz tej karty w ręce, talii, ani na stosie kart odrzuconych.");
                }
                break;
        }
        renderGameBoard();
    }
    
    function showStackSelector() {
        if (!gameState.player) return;
        const options = [
            { key: 'player_deck_zone', name: t('player_deck_zone'), stack: gameState.player.deck },
            { key: 'discard_pile_zone', name: t('discard_pile_zone'), stack: gameState.player.discard },
            { key: 'destroyed_pile_zone', name: t('destroyed_pile_zone'), stack: gameState.destroyedPile }
        ];
        debug.selectionContainer.innerHTML = '';
        const label = document.createElement('label');
        label.textContent = t('debug_choose_stack_to_browse');
        const select = document.createElement('select');
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.key;
            option.textContent = `${opt.name} (${opt.stack.length})`;
            select.appendChild(option);
        });
        const confirmButton = document.createElement('button');
        confirmButton.textContent = t('debug_show_button');
        confirmButton.onclick = () => {
            const selectedOption = options.find(opt => opt.key === select.value);
            if (selectedOption) {
                choiceModalTitle.textContent = `${t('stack_contents_title')} ${selectedOption.name}`;
                choiceModalCards.innerHTML = '';
                if (selectedOption.stack.length > 0) {
                    // Używamy kopii do sortowania, aby nie modyfikować oryginalnej talii
                    [...selectedOption.stack].sort((a, b) => (a[`name_${currentLang}`] || a.name_en).localeCompare(b[`name_${currentLang}`] || b.name_en)).forEach(card => {
                        choiceModalCards.appendChild(createCardElement(card));
                    });
                } else {
                    choiceModalCards.innerHTML = `<p>${t('empty_stack_text')}</p>`;
                }
                choiceModal.classList.remove('hidden');
                
                // --- POPRAWKA: Prawidłowa obsługa przycisku Anuluj ---
                const cancelBtn = document.getElementById('choice-modal-cancel');
                const confirmBtn = document.getElementById('choice-modal-confirm');
                confirmBtn.classList.add('hidden'); // Ukryj przycisk Zatwierdź
                
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                newCancelBtn.style.display = 'inline-block';
                newCancelBtn.addEventListener('click', () => choiceModal.classList.add('hidden'), { once: true });
                // --- KONIEC POPRAWKI ---
            }
            debug.selectionContainer.innerHTML = '';
        };
        const cancelButton = document.createElement('button');
        cancelButton.textContent = t('cancel');
        cancelButton.onclick = () => { debug.selectionContainer.innerHTML = ''; };
        debug.selectionContainer.append(label, select, confirmButton, cancelButton);
    }
    
    function createSpecialCardSetter() {
        const langKey = `name_${currentLang}`;
        const container = debug.selectionContainer;
        if (!container) {
            console.error("Debug selection container not found!");
            return;
        }
        container.innerHTML = '';

        const showCardSelector = (cardType, position = null) => {
            container.innerHTML = '';
            const cardLabel = document.createElement('label');
            cardLabel.textContent = t('debug_choose_card_of_type').replace('{TYPE}', cardType);
            const cardSelect = document.createElement('select');
            
            const cardsToDisplay = gameState.allCards
                .filter(card => card.type === cardType)
                .sort((a, b) => (a[langKey] || a.name_en).localeCompare(b[langKey] || b.name_en));

            cardsToDisplay.forEach(card => {
                const option = document.createElement('option');
                option.value = card.id;
                option.textContent = card[langKey] || card.name_en;
                cardSelect.appendChild(option);
            });

            const confirmButton = document.createElement('button');
            confirmButton.textContent = t('confirm');
            confirmButton.onclick = () => {
                const cardId = cardSelect.value;
                const cardData = gameState.allCards.find(c => c.id === cardId);
                if (cardData) {
                    const newCardInstance = {...cardData, instanceId: `${cardData.id}_${Date.now()}`};
                    if (cardType === 'Super-Villain' && position !== null) {
                        const index = position - 1;
                        gameState.superVillainStack.splice(index, 0, newCardInstance);
                        console.log(`DEBUG: Set ${newCardInstance.name_en} as Super-Villain at position ${position}.`);
                    } else if (cardType === 'Super-Hero') {
                        gameState.player.superheroes = [newCardInstance];
                        console.log(`DEBUG: Set ${newCardInstance.name_en} as the current Superhero.`);
                    }
                    renderGameBoard();
                }
                container.innerHTML = '';
            };

            const backButton = document.createElement('button');
            backButton.textContent = t('back_to_menu');
            backButton.onclick = (cardType === 'Super-Villain') ? showSVPositionSelector : showSlotSelector;
            container.append(cardLabel, cardSelect, confirmButton, backButton);
        };

        const showSVPositionSelector = () => {
            container.innerHTML = '';
            const posLabel = document.createElement('label');
            posLabel.textContent = t('debug_choose_sv_position');
            const posSelect = document.createElement('select');
            posSelect.innerHTML = `
                <option value="1">${t('debug_sv_pos_first')}</option>
                <option value="2">${t('debug_sv_pos_second')}</option>
            `;
            const nextButton = document.createElement('button');
            nextButton.textContent = t('debug_next_button');
            nextButton.onclick = () => {
                showCardSelector('Super-Villain', parseInt(posSelect.value, 10));
            };
            const backButton = document.createElement('button');
            backButton.textContent = t('back_to_menu');
            backButton.onclick = showSlotSelector;
            container.append(posLabel, posSelect, nextButton, backButton);
        };

        const showSlotSelector = () => {
            container.innerHTML = '';
            const label = document.createElement('label');
            label.textContent = t('debug_choose_special_card_to_set');
            const select = document.createElement('select');
            select.innerHTML = `
                <option value="Super-Villain">${t('set_sv_prompt')}</option>
                <option value="Super-Hero">${t('set_sh_prompt')}</option>
            `;
            const nextButton = document.createElement('button');
            nextButton.textContent = t('debug_next_button');
            nextButton.onclick = () => {
                const selectedType = select.value;
                if (selectedType === 'Super-Villain') {
                    showSVPositionSelector();
                } else {
                    showCardSelector('Super-Hero');
                }
            };
            const cancelButton = document.createElement('button');
            cancelButton.textContent = t('cancel');
            cancelButton.onclick = () => { container.innerHTML = ''; };
            container.append(label, select, nextButton, cancelButton);
        };

        showSlotSelector();
    }

    async function startGame(options = { superheroCount: 1, difficulty: 'medium' }) {
        const endTurnButton = document.getElementById('end-turn-button');
        if (endTurnButton) {
            endTurnButton.disabled = false;
        }
        if (gameBoardElements.playerHand) gameBoardElements.playerHand.style.pointerEvents = 'auto';
        if (gameBoardElements.lineUp) gameBoardElements.lineUp.style.pointerEvents = 'auto';

        if (uiScaleSlider && gameBoard) { gameBoard.style.transform = `scale(${uiScaleSlider.value})`; }
        console.log(`Starting a new game with ${options.superheroCount} hero(es) on ${options.difficulty} difficulty.`);

        resetGameState();
        gameState.difficulty = options.difficulty;

        const decksPrepared = prepareDecks();
        if (!decksPrepared) return;

        initializeAI(gameState.allCards);
        drawCards(aiPlayer, 5, gameState);
        
        await preparePlayer(options);
        
        for (let i = 0; i < 5; i++) {
            if (gameState.mainDeck.length > 0) {
                gameState.lineUp[i] = gameState.mainDeck.pop();
            } else {
                gameState.lineUp[i] = null;
            }
        }
        await triggerFirstAppearanceAttack();
        renderGameBoard();
    }
    
    function resetGameState() {
        gameState.currentPower = 0;
        gameState.superVillainCostModifier = 0;
        gameState.mainDeck = [];
        gameState.kickStack = [];
        gameState.weaknessStack = [];
        gameState.superVillainStack = [];
        gameState.lineUp = new Array(5).fill(null);
        gameState.destroyedPile = [];
        gameState.svDefeatedThisTurn = false;
        gameState.cardsUnderSuperheroes = [];
        gameState.superheroAbilitiesDisabled = false;
        gameState.bonusPower = 0;
        gameState.player = { 
            superheroes: [], 
            deck: [], 
            hand: [], 
            discard: [], 
            playedCards: [], 
            playedCardTypeCounts: new Map(), 
            ongoing: [], 
            gainedCardsThisTurn: [], 
            turnTriggers: [], 
            borrowedCards: [],
            turnFlags: { aquamanTridentUsed: false }
        };
    }
    
    function prepareDecks() {
        if (!gameState.allCards || gameState.allCards.length === 0) { return false; }
        const mainDeckCards = gameState.allCards.filter(card => !['Starter', 'Kick', 'Weakness', 'Super-Villain', 'Super-Hero'].includes(card.type));
        for(const card of mainDeckCards) {
            for(let i=0; i<card.count; i++) gameState.mainDeck.push({...card, instanceId: `${card.id}_${i}`});
        }
        gameState.mainDeck = shuffle(gameState.mainDeck);
        gameState.kickStack = createSpecialStack('kick');
        gameState.weaknessStack = createSpecialStack('weakness');

        // --- POPRAWKA: Prawidłowe tworzenie stosu Super-złoczyńców (łącznie 8) ---
        const allSuperVillains = gameState.allCards.filter(c => c.type === 'Super-Villain');
        const rasAlGhul = allSuperVillains.find(c => c.id === 'ras_al_ghul');
        let otherSuperVillains = allSuperVillains.filter(c => c.id !== 'ras_al_ghul');
        otherSuperVillains = shuffle(otherSuperVillains); // Tasujemy przed instancjonowaniem
        
        // Bierzemy 7 losowych złoczyńców i nadajemy im unikalne ID
        gameState.superVillainStack = otherSuperVillains.slice(0, 7).map(sv => ({...sv, instanceId: `${sv.id}_instance_0`}));

        if (rasAlGhul) {
            // Dodajemy Ra's al Ghula, aby był ostatni w kolejce (na wierzchu po odwróceniu)
            gameState.superVillainStack.push({...rasAlGhul, instanceId: `${rasAlGhul.id}_instance_0`});
        }
        // Odwracamy stos, aby Ra's al Ghul był na wierzchu na początku gry
        gameState.superVillainStack.reverse(); 
        console.log(`Super-Villain stack created with ${gameState.superVillainStack.length} villains.`);
        // --- KONIEC POPRAWKI ---

        return true;
    }
    
    function createSpecialStack(cardId) {
        const cardData = gameState.allCards.find(c => c.id === cardId);
        if (!cardData) return [];
        const stack = [];
        for (let i = 0; i < cardData.count; i++) stack.push({...cardData, instanceId: `${cardId}_${i}`});
        return stack;
    }
    
    async function preparePlayer(options) {
        const allSuperheroes = shuffle(gameState.allCards.filter(c => c.type === 'Super-Hero'));
        if (options.superheroCount === 1) {
            const chosenHero = allSuperheroes.pop();
            gameState.player.superheroes = [{...chosenHero, instanceId: `${chosenHero.id}_hero_1`}];
        } else if (options.superheroCount === 2) {
            const heroesToChooseFrom = allSuperheroes.slice(0, 3).map((h, i) => ({...h, instanceId: `${h.id}_option_${i}`}));
            const chosenIds = await promptPlayerChoice(t('choose_two_superheroes'), heroesToChooseFrom, { selectionCount: 2, isCancellable: false, modalClass: 'superhero-selection-modal' });
            gameState.player.superheroes = chosenIds.map((id, i) => {
                const heroData = heroesToChooseFrom.find(h => h.instanceId === id);
                return {...heroData, instanceId: `${heroData.id}_hero_${i+1}`};
            });
        }
        const punches = gameState.allCards.find(c => c.id === 'punch');
        const vulnerabilities = gameState.allCards.find(c => c.id === 'vulnerability');
        for (let i = 0; i < 7; i++) gameState.player.deck.push({...punches, instanceId: `punch_${i}`});
        for (let i = 0; i < 3; i++) gameState.player.deck.push({...vulnerabilities, instanceId: `vulnerability_${i}`});
        gameState.player.deck = shuffle(gameState.player.deck);
        drawCards(gameState.player, 5, gameState);
    }
    
    async function playCard(cardToPlay, options = {}) {

        const engine = {
        promptPlayerChoice,
        promptConfirmation,
        showNotification,
        promptWithCard,
        showCardPoolNotification,
        playCard,
        drawCards,
        gainCard,
        applyCardEffect,
        renderGameBoard
        };

        const isTemporary = options.isTemporary || false;
        if (!isTemporary) {
            if (cardToPlay.type === 'Location') {
                gameState.player.ongoing.push(cardToPlay);
            } else {
                gameState.player.playedCards.push(cardToPlay);
            }
        }

        const currentPlays = gameState.player.playedCardTypeCounts.get(cardToPlay.type) || 0;
        gameState.player.playedCardTypeCounts.set(cardToPlay.type, currentPlays + 1);

        gameState.currentPower += cardToPlay.power || 0;

        if (!gameState.superheroAbilitiesDisabled && gameState.player.superheroes.some(h => h.id === 'cyborg') && !gameState.player.turnFlags.cyborgAbilityUsed && cardToPlay.type === 'Equipment') {
            drawCards(gameState.player, 1, gameState, { source: 'ability' });
            gameState.player.turnFlags.cyborgAbilityUsed = true;
        }

        for (const locationCard of gameState.player.ongoing) {
            if (locationCard.effect_tags && locationCard.effect_tags.some(tag => tag.startsWith('ongoing_triggered_ability'))) {
                for (const tag of locationCard.effect_tags) {
                    await applyCardEffect(tag, gameState, gameState.player, { playedCard: cardToPlay });
                }
            }
        }

        for (const tag of cardToPlay.effect_tags) {
            const effectName = tag.split(':')[0];

            if (effectName === 'attack') {
                await AttackManager.handleAttack({ attackingCard: cardToPlay, source: 'player' }, gameState, engine);
            } else if (effectName !== 'eot_effect' && effectName !== 'cleanup_effect' && effectName !== 'first_appearance_attack' && effectName !== 'defense_effect') {
                await applyCardEffect(tag, gameState, gameState.player, {});
            }
        }

        await checkTurnTriggers(cardToPlay);
    }

    async function handlePlayerHandClick(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement || !gameBoardElements.handCardsWrapper.contains(cardElement)) return;
        const instanceId = cardElement.dataset.instanceId;
        const cardIndex = gameState.player.hand.findIndex(c => c.instanceId === instanceId);
        if (cardIndex === -1) return;

        const [playedCard] = gameState.player.hand.splice(cardIndex, 1);
        
        // ZDOLNOŚCI SUPERBOHATERÓW DODAJĄCE MOC (ADDITIVE)
        if (!gameState.superheroAbilitiesDisabled) {
            const playerHeroes = gameState.player.superheroes;
            const allPlayedCards = [...gameState.player.playedCards, ...gameState.player.ongoing];

            if (playerHeroes.some(h => h.id === 'batman') && playedCard.type === 'Equipment') {
                gameState.currentPower += 1;
            }
            if (playerHeroes.some(h => h.id === 'superman')) {
                const isDistinctSuperPower = !allPlayedCards.some(c => c.id === playedCard.id && (c.type === 'Super Power' || c.type === 'Kick'));
                if ((playedCard.type === 'Super Power' || playedCard.type === 'Kick') && isDistinctSuperPower) {
                    gameState.currentPower += 1;
                }
            }
            if (playerHeroes.some(h => h.id === 'cyborg') && (playedCard.type === 'Super Power' || playedCard.type === 'Kick') && !gameState.player.turnFlags.cyborgPowerUsed) {
                gameState.currentPower += 1;
                gameState.player.turnFlags.cyborgPowerUsed = true;
            }
            if (playerHeroes.some(h => h.id === 'green_lantern')) {
                const validPlayedCards = allPlayedCards.filter(c => c.cost >= 1);
                const distinctCardIds = new Set(validPlayedCards.map(c => c.id));
                if (playedCard.cost >= 1 && !distinctCardIds.has(playedCard.id) && distinctCardIds.size === 2) {
                    gameState.currentPower += 3;
                }
            }
        }
        
        await playCard(playedCard);

        renderGameBoard();
    }

    async function handleLineUpClick(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        const instanceId = cardElement.dataset.instanceId;
        const cardIndex = gameState.lineUp.findIndex(c => c && c.instanceId === instanceId);
        if (cardIndex === -1) return;
        const cardToBuy = gameState.lineUp[cardIndex];
        if (gameState.currentPower >= cardToBuy.cost) {
            gameState.currentPower -= cardToBuy.cost;
            
            if (cardIndex < STANDARD_LINEUP_SIZE) {
                const [gainedCard] = gameState.lineUp.splice(cardIndex, 1, null);
                await gainCard(gameState.player, gainedCard);
            } else {
                const [gainedCard] = gameState.lineUp.splice(cardIndex, 1);
                await gainCard(gameState.player, gainedCard);
            }
            
            renderGameBoard();
        }
    }

    async function handleKickStackClick() {
        if (gameState.kickStack.length === 0) return;
        const cardToBuy = gameState.kickStack[0];
        if (gameState.currentPower >= cardToBuy.cost) {
            gameState.currentPower -= cardToBuy.cost;
            const boughtCard = gameState.kickStack.shift();
            await gainCard(gameState.player, boughtCard);
            renderGameBoard();
        }
    }
    
    async function handleSuperVillainStackClick() {
        if (gameState.player && gameState.svDefeatedThisTurn) {
            console.log("You can only defeat one Super-Villain per turn.");
            return;
        }
        if (gameState.superVillainStack.length === 0) return;
        const superVillain = gameState.superVillainStack[0];
        const effectiveCost = Math.max(0, superVillain.cost - (gameState.superVillainCostModifier || 0));
        if (gameState.currentPower >= effectiveCost) {
            if (gameState.superheroAbilitiesDisabled) {
                gameState.superheroAbilitiesDisabled = false;
                await showNotification(t('captain_cold_defeat_text'));
            }
            const cardsToReturn = gameState.cardsUnderSuperheroes.filter(data => data.tiedToVillainId === superVillain.id);
                if (cardsToReturn.length > 0) {
                    for (const data of cardsToReturn) {
                        gameState.player.deck.push(data.card);
                        const promptText = t('sv_defeat_recover_card_prompt').replace('{VILLAIN_NAME}', superVillain[`name_${currentLang}`] || superVillain.name_en);
                        await promptWithCard(promptText, data.card, [{ text: 'OK', value: true }], t('notification_title'));
                    }
                    gameState.cardsUnderSuperheroes = gameState.cardsUnderSuperheroes.filter(data => data.tiedToVillainId !== superVillain.id);
                }
            gameState.currentPower -= effectiveCost;
            const defeatedVillain = gameState.superVillainStack.shift();
            await gainCard(gameState.player, defeatedVillain);
            gameState.svDefeatedThisTurn = true;
            
            renderGameBoard();

            // --- POPRAWKA: Sprawdź warunki końca gry zaraz po pokonaniu SV ---
            if (checkEndGameConditions()) {
                return; // Zatrzymaj dalsze przetwarzanie, jeśli gra się skończyła
            }

            renderGameBoard();
        }
    }

    async function gainCard(player, cardToGain) {
        const langKey = `name_${currentLang}`;
        console.log(`Player is gaining ${cardToGain[langKey] || cardToGain.name_en}`);
        let destination = player.discard;

        // Sprawdź efekty, które zawsze mogą się aktywować (nie są jednorazowe na turę)
        let alwaysAsk = false;
        if (cardToGain.id === 'solomon_grundy' || 
        (!gameState.superheroAbilitiesDisabled && player.superheroes.some(h => h.id === 'aquaman') && cardToGain.cost <= 5)) {
            alwaysAsk = true;
        }

        if (alwaysAsk) {
            const userConfirmed = await promptConfirmation(t('confirm_place_on_top_deck').replace('{CARD_NAME}', cardToGain[langKey] || cardToGain.name_en));
            if (userConfirmed) {
                destination = player.deck;
            }
        }

        // OSOBNO sprawdź efekt Trójzębu, bo jest jednorazowy na turę
        const allPlayedCards = [...player.playedCards, ...player.ongoing];
        if (allPlayedCards.some(c => c.id === 'aquamans_trident') && !player.turnFlags.aquamanTridentUsed) {
            const useTrident = await promptConfirmation(t('aquaman_trident_prompt_each_time').replace('{CARD_NAME}', cardToGain[langKey] || cardToGain.name_en));
            if (useTrident) {
                destination = player.deck;
                player.turnFlags.aquamanTridentUsed = true; // "Zużyj" zdolność na tę turę
                console.log("Aquaman's Trident ability has been used for this turn.");
            }
        }

        player.gainedCardsThisTurn.push(cardToGain);
        destination.push(cardToGain);
    }


    async function checkTurnTriggers(playedCard) {
        const triggers = [...gameState.player.turnTriggers];
        for (const trigger of triggers) {
            if (trigger.condition.on === 'play' && trigger.condition.id === playedCard.id) {
                console.log(`Trigger activated: ${trigger.effectTag}`);
                await applyCardEffect(trigger.effectTag, gameState, gameState.player, {});
                gameState.player.turnTriggers = gameState.player.turnTriggers.filter(t => t !== trigger);
            }
        }
    }

    async function triggerFirstAppearanceAttack() {

        const engine = {
        promptPlayerChoice,
        promptConfirmation,
        showNotification,
        promptWithCard,
        showCardPoolNotification,
        playCard,
        gainCard,
        drawCards,
        applyCardEffect,
        renderGameBoard
        };
        
        if (gameState.superVillainStack.length > 0) {
            const newSuperVillain = gameState.superVillainStack[0];
            const faTag = newSuperVillain.effect_tags.find(tag => tag.startsWith('first_appearance_attack'));
            if (faTag) {
                const langKey = `name_${currentLang}`;
                console.log("A new Super-Villain is revealed, triggering First Appearance Attack!");

                // POPRAWKA: Użycie dynamicznego klucza języka
                const message = `${t('new_sv_arrives')} ${newSuperVillain[langKey] || newSuperVillain.name_en}!\n${t('fa_is_activated')}`;

                await showNotification(message);
                await AttackManager.handleAttack({ attackingCard: newSuperVillain, source: 'super_villain' }, gameState, engine)
            }
        }
    }

    async function endTurn() {
        if (!gameState.player) return;
        const player = gameState.player;
        const cardsThatWereInPlay = [...player.playedCards, ...player.ongoing];

        // FAZA ZWROTU KART (RETURN)
        if (player.borrowedCards.length > 0) {
            console.log("Returning borrowed cards to the Line-Up.");
            player.borrowedCards.forEach(borrowed => {
                const emptySlot = gameState.lineUp.findIndex(slot => slot === null);
                if (emptySlot !== -1) {
                    gameState.lineUp[emptySlot] = borrowed.card;
                } else if (gameState.lineUp.length < STANDARD_LINEUP_SIZE) {
                    gameState.lineUp.push(borrowed.card);
                }
            });
        }

        // FAZA SPRZĄTANIA (CLEAN-UP)
        console.log("--- Player's turn ends ---");

        const cardsWithCleanup = [];
        const regularPlayedCards = [];
        player.playedCards.forEach(card => {
            if (card.effect_tags.some(tag => tag.startsWith('cleanup_effect'))) {
                cardsWithCleanup.push(card);
            } else {
                regularPlayedCards.push(card);
            }
        });
        for (const card of cardsWithCleanup) {
            for (const tag of card.effect_tags) {
                if (tag.startsWith('cleanup_effect')) {
                    await applyCardEffect(tag, gameState, player, { cardWithEffect: card });
                }
            }
        }
        
        player.discard.push(...player.hand);
        player.discard.push(...regularPlayedCards);
        player.hand = [];
        player.playedCards = [];
        
        // FAZA EFEKTÓW KOŃCA TURY
        console.log("Entering End-of-Turn phase.");
        for (const card of cardsThatWereInPlay) {
            for (const tag of card.effect_tags) {
                if (tag.startsWith('eot_effect')) {
                    await applyCardEffect(tag, gameState, player, { cardWithEffect: card });
                }
            }
        }
        
        // Uzupełnienie Line-Up po turze gracza
        gameState.lineUp = gameState.lineUp.filter(card => card !== null);
        refillLineUp();
        
        // Dobieranie kart na podstawie zdolności i standardowe
        if (!gameState.superheroAbilitiesDisabled && player.superheroes.some(h => h.id === 'wonder_woman')) {
            const villainsGained = player.gainedCardsThisTurn.filter(c => c.type === 'Villain' || c.type === 'Super-Villain').length;
            if (villainsGained > 0) {
                drawCards(player, villainsGained, gameState, { source: 'ability' });
            }
        }
        drawCards(player, 5, gameState);
        
        // Reset flag na nową turę
        player.playedCardTypeCounts.clear();
        player.gainedCardsThisTurn = [];
        gameState.superVillainCostModifier = 0;
        player.turnTriggers = [];
        player.borrowedCards = [];
        player.turnFlags = {};
        gameState.bonusPower = 0;
        gameState.currentPower = 0;
        
        if (gameState.svDefeatedThisTurn) {
            await triggerFirstAppearanceAttack();
            gameState.svDefeatedThisTurn = false;
        }
        
        renderGameBoard(); // Renderuj planszę po wszystkich akcjach gracza
        if (checkEndGameConditions()) return; // Sprawdź koniec gry
        
        // TURA AI
        await executeAITurn(gameState);

        // Sprzątanie i uzupełnianie po turze AI
        gameState.lineUp = gameState.lineUp.filter(card => card !== null);
        refillLineUp();
        renderGameBoard(); // Renderuj planszę po wszystkich akcjach AI
        
        if (checkEndGameConditions()) return; // Sprawdź koniec gry ponownie

        // POCZĄTEK NOWEJ TURY GRACZA
        console.log("--- Player's turn begins ---");
        gameState.currentPower = 0;
        updateHUD();
    }

    function refillLineUp() {
        while (gameState.lineUp.length < STANDARD_LINEUP_SIZE && gameState.mainDeck.length > 0) {
            gameState.lineUp.push(gameState.mainDeck.pop());
        }
    }

    function checkEndGameConditions() {
        let reason = null;

        // Warunek 1: Pokonano ostatniego Super-złoczyńcę
        if (gameState.superVillainStack.length === 0) {
            console.log("Game Over: Final Super-Villain defeated.");
            reason = 'sv';
        }

        // Warunek 2: Talia główna jest pusta i nie można uzupełnić Line-Up do 5 kart
        const activeLineUpCards = gameState.lineUp.filter(card => card !== null).length;
        if (gameState.mainDeck.length === 0 && activeLineUpCards < STANDARD_LINEUP_SIZE) {
            console.log("Game Over: Main deck is empty and Line-Up cannot be refilled.");
            reason = 'deck';
        }

        if (reason) {
            // Przekazujemy powód do funkcji kończącej grę
            triggerEndGame(reason);
            return true; // Zwraca prawdę, aby zasygnalizować koniec gry.
        }
        
        return false;
    }

    function triggerEndGame() {
        console.log("Calculating final scores...");
        const playerScore = calculatePlayerScore(gameState.player);
        const aiScore = calculatePlayerScore(aiPlayer); // Obliczamy też wynik AI

        const reasonText = t(`game_over_reason_${reason.split('_')[0]}`); // Bierzemy 'sv' lub 'deck' z powodu
        const endMessage = t('game_over_alert')
            .replace('{REASON}', reasonText)
            .replace('{PLAYER_SCORE}', playerScore)
            .replace('{AI_SCORE}', aiScore);
        
        alert(endMessage);

        const endTurnButton = document.getElementById('end-turn-button');
        if (endTurnButton) {
            endTurnButton.disabled = true;
        }
        gameBoardElements.playerHand.style.pointerEvents = 'none';
        gameBoardElements.lineUp.style.pointerEvents = 'none';
    }
    
    async function applyCardEffect(tag, gameState, player, details = {}) {
        const [effectName, ...params] = tag.split(':');
        const allParams = params.join(':');
        
        const engine = {
            promptPlayerChoice,
            promptConfirmation,
            showNotification,
            promptWithCard,
            showCardPoolNotification,
            playCard,
            drawCards,
            gainCard,
            applyCardEffect,
            renderGameBoard
        };

        if (cardEffects && typeof cardEffects[effectName] === 'function') {
            // Przekazujemy 'engine' do każdej funkcji efektu
            return await cardEffects[effectName](gameState, player, allParams, engine, details);
        } else {
            console.warn(`Effect '${effectName}' not found in effects.js`);
        }
    }

    function calculatePlayerScore(player) {
        if (!player) return 0;

        // 1. Zbierz wszystkie karty posiadane przez gracza w jedną talię
        const allPlayerCards = [
            ...player.deck,
            ...player.hand,
            ...player.discard,
            ...player.playedCards,
            ...player.ongoing
        ];

        // 2. Stwórz kopię kart, aby nie modyfikować stanu gry
        const cardsForScoring = JSON.parse(JSON.stringify(allPlayerCards));

        // 3. Policz karty potrzebne do warunków
        const equipmentCount = cardsForScoring.filter(card => card.type === 'Equipment').length;
        const heroCount = cardsForScoring.filter(card => card.type === 'Hero').length;
        const weaknessCount = cardsForScoring.filter(card => card.id === 'weakness').length;
        const suicideSquadCount = cardsForScoring.filter(card => card.id === 'suicide_squad').length;

        // 4. Zastosuj efekty warunkowe modyfikujące punkty zwycięstwa
        cardsForScoring.forEach(card => {
            // --- Logika dla Pasa z Gadżetami (Utility Belt) ---
            if (card.id === 'utility_belt') {
                // Warunek: "4 lub więcej INNYCH Ekwipunków", co oznacza łącznie 5+ Ekwipunków
                if (equipmentCount >= 5) {
                    card.vp = 5;
                }
            }
            // --- Logika dla Green Arrowa ---
            if (card.id === 'green_arrow') {
                // Warunek: "4 lub więcej INNYCH Bohaterów", co oznacza łącznie 5+ Bohaterów
                if (heroCount >= 5) {
                    card.vp = 5;
                }
            }
            // --- Logika dla Bizarro ---
            if (card.id === 'bizarro') {
                card.vp = weaknessCount * 2;
            }
            // --- Logika dla Suicide Squad ---
            if (card.id === 'suicide_squad') {
                card.vp = suicideSquadCount;
            }
        });

        // 5. Zsumuj ostateczne wartości punktowe wszystkich kart
        let totalVP = 0;
        cardsForScoring.forEach(card => {
            totalVP += card.vp || 0;
        });

        return totalVP;
    }
    
    function renderGameBoard() {
        if (!gameState.player) return;
        gameBoardElements.playAreaWrapper.innerHTML = '';
        gameState.player.playedCards.forEach(card => gameBoardElements.playAreaWrapper.appendChild(createCardElement(card)));
        renderHand();
        renderLineUp();
        renderStacks();
        renderOngoing();
        renderSuperhero();
        renderAIBoard();
        updateHUD();
        updateBuyableStatus();
    }

    function renderAIBoard() {
        const aiInfo = {
            superhero: document.getElementById('ai-superhero-container'),
            deck: document.getElementById('ai-deck-container'),
            discard: document.getElementById('ai-discard-container'),
            power: document.getElementById('ai-power-value'),
        };

        if (!aiPlayer || !aiInfo.superhero) return;

        // Renderuj superbohatera AI
        aiInfo.superhero.innerHTML = '';
        if (aiPlayer.superheroes && aiPlayer.superheroes.length > 0) {
            // POPRAWKA: Kapitan Chłód działa teraz również na AI
            if (gameState.superheroAbilitiesDisabled) {
                aiInfo.superhero.appendChild(createCardBack());
            } else {
                aiInfo.superhero.appendChild(createCardElement(aiPlayer.superheroes[0]));
            }
        }

        // Renderuj talię AI
        aiInfo.deck.innerHTML = '';
        if (aiPlayer.deck.length > 0) {
            aiInfo.deck.appendChild(createCardBack());
            aiInfo.deck.appendChild(createCounterOverlay(aiPlayer.deck.length));
        } else {
            aiInfo.deck.appendChild(createDashedPlaceholder());
        }

        // Renderuj stos kart odrzuconych AI
        aiInfo.discard.innerHTML = '';
        if (aiPlayer.discard.length > 0) {
            const topCard = aiPlayer.discard[aiPlayer.discard.length - 1];
            aiInfo.discard.appendChild(createCardElement(topCard));
            aiInfo.discard.appendChild(createCounterOverlay(aiPlayer.discard.length));
        } else {
            aiInfo.discard.appendChild(createDashedPlaceholder());
        }
    }

    

    function createCounterOverlay(count) {
        const counter = document.createElement('div');
        counter.textContent = count;
        counter.style.cssText = `position: absolute; top: 5px; right: 5px; background-color: rgba(0, 0, 0, 0.8); color: white; font-weight: bold; font-size: 16px; min-width: 26px; height: 26px; padding: 2px; border-radius: 50%; pointer-events: none; display: flex; justify-content: center; align-items: center; box-sizing: border-box;`;
        return counter;
    }

    function createCardBack() {
        const cardBack = document.createElement('div');
        cardBack.classList.add('card');
        cardBack.style.backgroundImage = "url('assets/others/card_back.png')";
        cardBack.style.backgroundSize = 'cover';
        return cardBack;
    }

    function createDashedPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder-dashed';
        return placeholder;
    }

    function createEmptyPilePlaceholder(text) {
        const placeholder = document.createElement('div');
        placeholder.className = 'lineup-placeholder'; // Używamy tej samej klasy dla spójnego wyglądu
        placeholder.textContent = text;
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        return placeholder;
    }

    function createLineUpPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'lineup-placeholder';
        placeholder.textContent = t('bought_card_placeholder');
        return placeholder;
    }

    function renderStacks() {
        if(!gameState.player) return;

        // Main Deck
        gameBoardElements.mainDeck.innerHTML = '';
        if (gameState.mainDeck.length > 0) {
            gameBoardElements.mainDeck.appendChild(createCardBack());
        } else {
            gameBoardElements.mainDeck.appendChild(createEmptyPilePlaceholder(t('empty_pile_placeholder')));
        }

        // Player Deck & Discard
        const deckCount = gameState.player.deck.length;
        gameBoardElements.playerDeck.innerHTML = '';
        if (deckCount > 0) gameBoardElements.playerDeck.appendChild(createCardBack());
        else gameBoardElements.playerDeck.appendChild(createDashedPlaceholder());
        gameBoardElements.playerDeck.appendChild(createCounterOverlay(deckCount));

        const discardCount = gameState.player.discard.length;
        gameBoardElements.playerDiscard.innerHTML = '';
        if (discardCount > 0) {
            const topCard = gameState.player.discard[discardCount - 1];
            gameBoardElements.playerDiscard.appendChild(createCardElement(topCard));
        } else {
            gameBoardElements.playerDiscard.appendChild(createDashedPlaceholder());
        }
        gameBoardElements.playerDiscard.appendChild(createCounterOverlay(discardCount));

        // Destroyed Pile
        const destroyedCount = gameState.destroyedPile.length;
        gameBoardElements.destroyed.innerHTML = '';
        if (destroyedCount > 0) {
            const topCard = gameState.destroyedPile[destroyedCount - 1];
            gameBoardElements.destroyed.appendChild(createCardElement(topCard));
        } else {
            gameBoardElements.destroyed.appendChild(createDashedPlaceholder());
        }
        gameBoardElements.destroyed.appendChild(createCounterOverlay(destroyedCount));

        // Kick & Weakness
        gameBoardElements.kickStack.innerHTML = '';
        if (gameState.kickStack.length > 0) gameBoardElements.kickStack.appendChild(createCardElement(gameState.kickStack[0]));
        else gameBoardElements.kickStack.appendChild(createDashedPlaceholder());

        gameBoardElements.weaknessStack.innerHTML = '';
        if (gameState.weaknessStack.length > 0) gameBoardElements.weaknessStack.appendChild(createCardElement(gameState.weaknessStack[0]));
        else gameBoardElements.weaknessStack.appendChild(createDashedPlaceholder());
        
        // Super-Villain Stack
        gameBoardElements.superVillainStack.innerHTML = '';
        if (gameState.svDefeatedThisTurn && gameState.superVillainStack.length > 0) {
            gameBoardElements.superVillainStack.appendChild(createCardBack());
        } else if (gameState.superVillainStack.length > 0) {
            gameBoardElements.superVillainStack.appendChild(createCardElement(gameState.superVillainStack[0]));
        } else {
            gameBoardElements.superVillainStack.appendChild(createEmptyPilePlaceholder(t('empty_pile_placeholder')));
        }
    }

    function renderHand() {
        if(!gameBoardElements.handCardsWrapper || !gameState.player) return;
        gameBoardElements.handCardsWrapper.innerHTML = '';
        gameState.player.hand.forEach(card => gameBoardElements.handCardsWrapper.appendChild(createCardElement(card)));
    }

    function renderLineUp() {
        if (!gameBoardElements.lineUp || !gameState.lineUp) return;
        gameBoardElements.lineUp.innerHTML = '';
        gameState.lineUp.forEach(cardOrNull => {
            if (cardOrNull) {
                gameBoardElements.lineUp.appendChild(createCardElement(cardOrNull));
            } else {
                gameBoardElements.lineUp.appendChild(createLineUpPlaceholder());
            }
        });
    }

    function renderOngoing() {
        if(!gameBoardElements.locations || !gameState.player) return;
        gameBoardElements.locations.innerHTML = '';
        if (gameState.player.ongoing.length > 0) {
             gameState.player.ongoing.forEach(card => gameBoardElements.locations.appendChild(createCardElement(card)));
        } else {
            gameBoardElements.locations.appendChild(createDashedPlaceholder());
        }
    }

    function renderSuperhero() {
        if(!gameBoardElements.superheroArea) return;
        gameBoardElements.superheroArea.innerHTML = '';
        if (gameState.player && gameState.player.superheroes.length > 0) {
            gameState.player.superheroes.forEach(hero => {
                if (gameState.superheroAbilitiesDisabled) {
                    gameBoardElements.superheroArea.appendChild(createCardBack());
                } else {
                    gameBoardElements.superheroArea.appendChild(createCardElement(hero));
                }
            });
        } else {
            gameBoardElements.superheroArea.appendChild(createDashedPlaceholder());
        }
    }

    function updateHUD() {
        if (!gameState.player) return;
        gameBoardElements.powerValue.textContent = gameState.currentPower;
    }
    
    function updateBuyableStatus() {
        if (!gameState.player) return;
        const lineUpElements = Array.from(gameBoardElements.lineUp.children);
        lineUpElements.forEach((cardEl, index) => {
            const cardData = gameState.lineUp[index];
            if (cardData && cardEl.classList.contains('card')) {
                if (gameState.currentPower < cardData.cost) {
                    cardEl.classList.add('disabled');
                } else {
                    cardEl.classList.remove('disabled');
                }
            }
        });
        const kickCardEl = gameBoardElements.kickStack.querySelector('.card');
        if (kickCardEl && gameState.kickStack.length > 0) {
            if (gameState.currentPower < gameState.kickStack[0].cost) {
                kickCardEl.classList.add('disabled');
            } else {
                kickCardEl.classList.remove('disabled');
            }
        }
        const svCardEl = gameBoardElements.superVillainStack.querySelector('.card');
        if (svCardEl && gameState.superVillainStack.length > 0) {
            const superVillain = gameState.superVillainStack[0];
            const effectiveCost = Math.max(0, superVillain.cost - (gameState.superVillainCostModifier || 0));
            if (gameState.currentPower < effectiveCost) {
                svCardEl.classList.add('disabled');
            } else {
                svCardEl.classList.remove('disabled');
            }
        }
    }

    init();
});