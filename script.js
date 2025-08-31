document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKTORY ELEMENTÓW DOM ---
    const screens = {
        start: document.getElementById('start-screen'),
        mainMenu: document.getElementById('main-menu-screen'),
        settings: document.getElementById('settings-screen'),
        game: document.getElementById('game-container')
    };
    const buttons = {
        play: document.getElementById('play-button'),
        singlePlayer: document.getElementById('single-player-button'),
        multiplayer: document.getElementById('multiplayer-button'),
        settings: document.getElementById('settings-button'),
        backToMenu: document.getElementById('back-to-menu-button'),
        endTurn: document.getElementById('end-turn-button')
    };
    const gameBoardElements = {
        playerHand: document.getElementById('player-hand-container'),
        handCardsWrapper: document.getElementById('hand-cards-wrapper'),
        lineUp: document.getElementById('line-up-container'),
        playArea: document.getElementById('play-area-container'),
        playAreaWrapper: document.getElementById('play-area-wrapper'),
        mainDeck: document.getElementById('main-deck-container'),
        playerDeck: document.getElementById('player-deck-container'),
        playerDiscard: document.getElementById('discard-pile-container'),
        locations: document.getElementById('locations-container'),
        destroyed: document.getElementById('destroyed-pile-container'),
        kickStack: document.getElementById('kick-stack-container'),
        weaknessStack: document.getElementById('weakness-stack-container'),
        superVillainStack: document.getElementById('super-villain-stack-container'),
        superheroArea: document.getElementById('superhero-card-area'),
        powerValue: document.getElementById('power-value'),
    };
    const debug = {
        toggleButton: document.getElementById('debug-toggle-button'),
        closeButton: document.getElementById('debug-close-button'),
        panel: document.getElementById('debug-panel'),
        powerPlus: document.getElementById('debug-power-plus-1'),
        powerMinus: document.getElementById('debug-power-minus-1'),
        drawCard: document.getElementById('debug-draw-card'),
        endGame: document.getElementById('debug-end-game'),
        addToHandBtn: document.getElementById('debug-add-to-hand-btn'),
        addToLineupBtn: document.getElementById('debug-add-to-lineup-btn'),
        destroyCardBtn: document.getElementById('debug-destroy-card-btn'),
        selectionContainer: document.getElementById('debug-selection-container'),
    };
    const cardInspectorModal = document.getElementById('card-inspector-modal');
    const cardInspectorImage = cardInspectorModal?.querySelector('img');
    const closeModalButton = cardInspectorModal?.querySelector('.close-button');
    const languageSelect = document.getElementById('language-select');
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
    let currentLang = 'pl';

    // --- GŁÓWNA FUNKCJA INICJALIZACYJNA ---
    async function init() {
        setupEventListeners();
        await loadCardData();
        showScreen('start');
    }
    
    // --- ŁADOWANIE DANYCH KART ---
    async function loadCardData() {
        try {
            const response = await fetch('cards.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            gameState.allCards = await response.json();
        } catch (error) { console.error("Could not load card data:", error); }
    }

    // --- NAWIGACJA I OBSŁUGA ZDARZEŃ ---
    function setupEventListeners() {
        if(buttons.play) buttons.play.addEventListener('click', () => showScreen('mainMenu'));
        if(buttons.settings) buttons.settings.addEventListener('click', () => showScreen('settings'));
        if(buttons.backToMenu) buttons.backToMenu.addEventListener('click', () => showScreen('mainMenu'));
        if(buttons.singlePlayer) buttons.singlePlayer.addEventListener('click', () => { showScreen('game'); startGame(); });
        if(gameBoard) gameBoard.addEventListener('contextmenu', handleCardRightClick);
        if(closeModalButton) closeModalButton.addEventListener('click', hideInspector);
        if(cardInspectorModal) cardInspectorModal.addEventListener('click', (e) => { if (e.target === cardInspectorModal) hideInspector(); });
        if(choiceModal) choiceModal.addEventListener('contextmenu', handleCardRightClick);
        if(gameBoardElements.playerHand) gameBoardElements.playerHand.addEventListener('click', handlePlayerHandClick);
        if(gameBoardElements.lineUp) gameBoardElements.lineUp.addEventListener('click', handleLineUpClick);
        if(gameBoardElements.kickStack) gameBoardElements.kickStack.addEventListener('click', handleKickStackClick);
        if(buttons.endTurn) buttons.endTurn.addEventListener('click', endTurn);
        if(languageSelect) languageSelect.addEventListener('change', (e) => { currentLang = e.target.value; });
        if(settingsIngameButton) settingsIngameButton.addEventListener('click', () => { if(ingameSettingsModal) ingameSettingsModal.classList.remove('hidden'); });
        if(closeIngameSettingsButton) closeIngameSettingsButton.addEventListener('click', () => { if(ingameSettingsModal) ingameSettingsModal.classList.add('hidden'); });
        if(ingameSettingsModal) ingameSettingsModal.addEventListener('click', (e) => { if (e.target === ingameSettingsModal) ingameSettingsModal.classList.add('hidden'); });
        if(uiScaleSlider) uiScaleSlider.addEventListener('input', (e) => { if(gameBoard) gameBoard.style.transform = `scale(${e.target.value})`; });
        if(resetGameButton) resetGameButton.addEventListener('click', () => { if (confirm('Czy na pewno chcesz zresetować grę?')) startGame(); });
        if(debug.toggleButton) debug.toggleButton.addEventListener('click', () => { debug.panel.classList.toggle('hidden'); debug.selectionContainer.innerHTML = ''; });
        if(debug.closeButton) debug.closeButton.addEventListener('click', () => { debug.panel.classList.add('hidden'); debug.selectionContainer.innerHTML = ''; });
        if(debug.powerPlus) debug.powerPlus.addEventListener('click', () => { if (!gameState.player) return; gameState.currentPower++; renderGameBoard(); });
        if(debug.powerMinus) debug.powerMinus.addEventListener('click', () => { if (!gameState.player) return; gameState.currentPower = Math.max(0, gameState.currentPower - 1); renderGameBoard(); });
        if(debug.drawCard) debug.drawCard.addEventListener('click', () => { if (!gameState.player) return; drawCards(gameState.player, 1); renderGameBoard(); });
        if(debug.endGame) debug.endGame.addEventListener('click', () => alert("KONIEC GRY (funkcja debugowania)"));
        if(debug.addToHandBtn) debug.addToHandBtn.addEventListener('click', () => createCardSelector('addToHand', 'Dodaj do ręki:'));
        if(debug.addToLineupBtn) debug.addToLineupBtn.addEventListener('click', () => createCardSelector('addToLineup', 'Dodaj do Line-Up:'));
        if(debug.destroyCardBtn) debug.destroyCardBtn.addEventListener('click', () => createCardSelector('destroyCard', 'Wybierz typ karty do zniszczenia:'));
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
    
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => {
            if(screen) screen.classList.remove('active');
        });
        if(screens[screenId]) screens[screenId].classList.add('active');
    }

    function findCardByInstanceId(instanceId) {
        if (!gameState.player) return null;
        const allCardLocations = [ ...gameState.player.hand, ...gameState.player.discard, ...gameState.player.playedCards, ...gameState.player.deck, ...gameState.lineUp, ...gameState.kickStack, ...gameState.weaknessStack, ...gameState.superVillainStack, ...gameState.destroyedPile, ...gameState.player.ongoing ];
        if(gameState.player.superhero) {
            allCardLocations.push(gameState.player.superhero);
        }
        return allCardLocations.find(card => card && card.instanceId === instanceId);
    }
    function handleCardRightClick(event) {
        event.preventDefault();
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        const instanceId = cardElement.dataset.instanceId;
        if (!instanceId) return;
        const cardData = findCardByInstanceId(instanceId);
        if (cardData && cardData.image_path) {
            cardInspectorImage.src = cardData.image_path;
            cardInspectorModal.classList.remove('hidden');
        }
    }
    function hideInspector() {
        if(cardInspectorModal) cardInspectorModal.classList.add('hidden');
    }
    
    function promptPlayerChoice(title, cards, options = {}) {
        const { selectionCount = 1, isCancellable = true } = options;
        return new Promise(resolve => {
            if (!choiceModal) {
                console.error("Choice modal not found in HTML!");
                return resolve(isCancellable ? null : []);
            }
            let selectedIds = [];
            const updateTitle = () => {
                const selectionInfo = selectionCount > 1 ? `(${selectedIds.length}/${selectionCount})` : '';
                choiceModalTitle.textContent = `${title} ${selectionInfo}`;
            };
            const cleanupAndResolve = (value) => {
                choiceModal.classList.add('hidden');
                resolve(value);
            };
            updateTitle();
            choiceModalCards.innerHTML = '';
            const cancelBtn = document.getElementById('choice-modal-cancel');
            if (cancelBtn) {
                if (isCancellable) {
                    cancelBtn.style.display = 'inline-block';
                    const newCancelBtn = cancelBtn.cloneNode(true);
                    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                    newCancelBtn.addEventListener('click', () => cleanupAndResolve(null), { once: true });
                } else {
                    cancelBtn.style.display = 'none';
                }
            }
            cards.forEach(card => {
                const cardEl = createCardElement(card);
                cardEl.addEventListener('click', () => {
                    if (selectedIds.includes(card.instanceId)) {
                        selectedIds = selectedIds.filter(id => id !== card.instanceId);
                        cardEl.classList.remove('selected');
                    } else {
                        if (selectedIds.length < selectionCount) {
                            selectedIds.push(card.instanceId);
                            cardEl.classList.add('selected');
                        }
                    }
                    updateTitle();
                    if (selectedIds.length === selectionCount) {
                        cleanupAndResolve(selectedIds);
                    }
                });
                choiceModalCards.appendChild(cardEl);
            });
            choiceModal.classList.remove('hidden');
        });
    }
    function promptConfirmation(text, yesText = 'Tak', noText = 'Nie') {
        return new Promise(resolve => {
            if(!confirmationModal) {
                console.error("Confirmation modal not found in HTML!");
                return resolve(false);
            }
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

    function createCardSelector(action, labelText) {
        if (!debug.selectionContainer) return;
        debug.selectionContainer.innerHTML = '';
        const label = document.createElement('label');
        label.textContent = labelText;
        const select = document.createElement('select');
        let cardsToDisplay = [];
        const langKey = `name_${currentLang}`;
        cardsToDisplay = [...new Map(gameState.allCards.map(item => [item.id, item])).values()]
            .filter(card => !['Starter', 'Super-Hero', 'Weakness'].includes(card.type))
            .sort((a, b) => (a[langKey] || a.name_en).localeCompare(b[langKey] || b.name_en));
        cardsToDisplay.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            option.textContent = `${card[langKey] || card.name_en} [${card.type}]`;
            select.appendChild(option);
        });
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Zatwierdź';
        confirmButton.onclick = () => { if (select.value) handleDebugAction(action, select.value); debug.selectionContainer.innerHTML = ''; };
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Anuluj';
        cancelButton.onclick = () => { debug.selectionContainer.innerHTML = ''; };
        debug.selectionContainer.append(label, select, confirmButton, cancelButton);
        select.style.width = 'auto';
        const scrollWidth = select.scrollWidth;
        select.style.width = `${scrollWidth + 25}px`;
        select.size = Math.min(10, cardsToDisplay.length > 0 ? cardsToDisplay.length : 5);
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
                    const emptySlotIndex = gameState.lineUp.findIndex(slot => slot === null);
                    if (emptySlotIndex !== -1) gameState.lineUp[emptySlotIndex] = {...cardData, instanceId: `${value}_${Date.now()}`};
                    else alert("Brak wolnych miejsc w Line-Up!");
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

    function startGame() {
        if (uiScaleSlider && gameBoard) { gameBoard.style.transform = `scale(${uiScaleSlider.value})`; }
        console.log("Starting a new game...");
        resetGameState();
        const decksPrepared = prepareDecks();
        if (!decksPrepared) return;
        preparePlayer();
        for (let i = 0; i < 5; i++) {
            if (gameState.mainDeck.length > 0) {
                gameState.lineUp[i] = gameState.mainDeck.pop();
            } else {
                gameState.lineUp[i] = null;
            }
        }
        renderGameBoard();
    }
    
    function resetGameState() {
        gameState.currentPower = 0;
        gameState.mainDeck = [];
        gameState.kickStack = [];
        gameState.weaknessStack = [];
        gameState.superVillainStack = [];
        gameState.lineUp = new Array(5).fill(null);
        gameState.destroyedPile = [];
        gameState.player = { superhero: null, deck: [], hand: [], discard: [], playedCards: [], playedCardTypeCounts: new Map(), ongoing: [] };
    }
    
    function prepareDecks() {
        if (!gameState.allCards || gameState.allCards.length === 0) {
            alert("BŁĄD KRYTYCZNY: Nie udało się wczytać danych kart.");
            return false;
        }
        const mainDeckCards = gameState.allCards.filter(card => !['Starter', 'Kick', 'Weakness', 'Super-Villain', 'Super-Hero'].includes(card.type));
        for(const card of mainDeckCards) {
            for(let i=0; i<card.count; i++) gameState.mainDeck.push({...card, instanceId: `${card.id}_${i}`});
        }
        gameState.mainDeck = shuffle(gameState.mainDeck);
        gameState.kickStack = createSpecialStack('kick');
        gameState.weaknessStack = createSpecialStack('weakness');
        const superVillains = gameState.allCards.filter(c => c.type === 'Super-Villain');
        gameState.superVillainStack = shuffle(superVillains.map(sv => ({...sv, instanceId: `${sv.id}_0`})));
        return true;
    }
    function createSpecialStack(cardId) {
        const cardData = gameState.allCards.find(c => c.id === cardId);
        if (!cardData) return [];
        const stack = [];
        for (let i = 0; i < cardData.count; i++) stack.push({...cardData, instanceId: `${cardId}_${i}`});
        return stack;
    }
    function preparePlayer() {
        const superheroData = gameState.allCards.find(c => c.id === 'batman');
        if (superheroData) {
            gameState.player.superhero = {...superheroData, instanceId: `${superheroData.id}_hero`};
        }
        const punches = gameState.allCards.find(c => c.id === 'punch');
        const vulnerabilities = gameState.allCards.find(c => c.id === 'vulnerability');
        for (let i = 0; i < 7; i++) gameState.player.deck.push({...punches, instanceId: `punch_${i}`});
        for (let i = 0; i < 3; i++) gameState.player.deck.push({...vulnerabilities, instanceId: `vulnerability_${i}`});
        gameState.player.deck = shuffle(gameState.player.deck);
        drawCards(gameState.player, 5);
    }

    async function handlePlayerHandClick(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement || !gameBoardElements.handCardsWrapper.contains(cardElement)) return;
        const instanceId = cardElement.dataset.instanceId;
        const cardIndex = gameState.player.hand.findIndex(c => c.instanceId === instanceId);
        if (cardIndex === -1) return;
        const [playedCard] = gameState.player.hand.splice(cardIndex, 1);
        
        const playsOfThisType = gameState.player.playedCardTypeCounts.get(playedCard.type) || 0;
        
        if (playedCard.type === 'Location') {
            gameState.player.ongoing.push(playedCard);
        } else {
            gameState.player.playedCards.push(playedCard);
        }
        gameState.player.playedCardTypeCounts.set(playedCard.type, playsOfThisType + 1);
        
        for (const locationCard of gameState.player.ongoing) {
            if (locationCard.instanceId !== playedCard.instanceId) { 
                for (const tag of locationCard.effect_tags) {
                    await applyCardEffect(tag, gameState, gameState.player, { playedCard, playsOfThisType });
                }
            }
        }

        gameState.currentPower += playedCard.power || 0;
        
        for (const tag of playedCard.effect_tags) {
            await applyCardEffect(tag, gameState, gameState.player, {});
        }
        
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
            const [gainedCard] = gameState.lineUp.splice(cardIndex, 1, null);
            await gainCard(gameState.player, gainedCard);
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
    async function gainCard(player, cardToGain) {
        console.log(`Player is gaining ${cardToGain.name_en}`);
        let destination = player.discard;
        if (cardToGain.effect_tags.includes('on_gain_or_buy:may_move_to_deck_top')) {
            const userConfirmed = await promptConfirmation(`Czy chcesz położyć "${cardToGain.name_pl || cardToGain.name_en}" na wierzchu swojej talii?`);
            if (userConfirmed) {
                destination = player.deck;
            }
        }
        if (destination === player.deck) {
            destination.unshift(cardToGain);
        } else {
            destination.push(cardToGain);
        }
    }
    function endTurn() {
        if(!gameState.player) return;
        gameState.player.discard.push(...gameState.player.hand);
        gameState.player.discard.push(...gameState.player.playedCards);
        gameState.player.hand = [];
        gameState.player.playedCards = [];
        gameState.player.playedCardTypeCounts.clear();
        for (let i = 0; i < gameState.lineUp.length; i++) {
            if (gameState.lineUp[i] === null) {
                if (gameState.mainDeck.length > 0) {
                    gameState.lineUp[i] = gameState.mainDeck.pop();
                }
            }
        }
        drawCards(gameState.player, 5);
        gameState.currentPower = 0;
        renderGameBoard();
    }
    async function applyCardEffect(tag, gameState, player, details = {}) {
        const [effectName, ...params] = tag.split(':');
        if (cardEffects && typeof cardEffects[effectName] === 'function') {
            const engine = {
                promptPlayerChoice,
                promptConfirmation,
                gainCard,
                applyCardEffect,
                renderGameBoard 
            };
            await cardEffects[effectName](gameState, player, params, engine, details);
        } else {
            console.warn(`Effect '${effectName}' not found in effects.js`);
        }
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
        updateHUD();
        updateBuyableStatus();
    }
    function createCardElement(cardData) {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.instanceId = cardData.instanceId;
        cardEl.dataset.cardId = cardData.id;
        cardEl.style.backgroundImage = `url('${cardData.image_path}')`;
        cardEl.style.backgroundSize = 'cover';
        cardEl.style.backgroundPosition = 'center';
        return cardEl;
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
    function createLineUpPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'lineup-placeholder';
        placeholder.textContent = '[ Karta Kupiona ]';
        return placeholder;
    }
    function renderStacks() {
        if(!gameState.player) return;
        gameBoardElements.mainDeck.innerHTML = '';
        if (gameState.mainDeck.length > 0) gameBoardElements.mainDeck.appendChild(createCardBack()); else gameBoardElements.mainDeck.appendChild(createDashedPlaceholder());
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
        const destroyedCount = gameState.destroyedPile.length;
        gameBoardElements.destroyed.innerHTML = '';
        if (destroyedCount > 0) {
            const topCard = gameState.destroyedPile[destroyedCount - 1];
            gameBoardElements.destroyed.appendChild(createCardElement(topCard));
        } else {
            gameBoardElements.destroyed.appendChild(createDashedPlaceholder());
        }
        gameBoardElements.destroyed.appendChild(createCounterOverlay(destroyedCount));
        gameBoardElements.kickStack.innerHTML = '';
        if (gameState.kickStack.length > 0) gameBoardElements.kickStack.appendChild(createCardElement(gameState.kickStack[0]));
        else gameBoardElements.kickStack.appendChild(createDashedPlaceholder());
        gameBoardElements.weaknessStack.innerHTML = '';
        if (gameState.weaknessStack.length > 0) gameBoardElements.weaknessStack.appendChild(createCardElement(gameState.weaknessStack[0]));
        else gameBoardElements.weaknessStack.appendChild(createDashedPlaceholder());
        gameBoardElements.superVillainStack.innerHTML = '';
        if (gameState.superVillainStack.length > 0) gameBoardElements.superVillainStack.appendChild(createCardElement(gameState.superVillainStack[0]));
        else gameBoardElements.superVillainStack.appendChild(createDashedPlaceholder());
    }
    function renderHand() {
        if(!gameBoardElements.handCardsWrapper || !gameState.player) return;
        gameBoardElements.handCardsWrapper.innerHTML = '';
        gameState.player.hand.forEach(card => gameBoardElements.handCardsWrapper.appendChild(createCardElement(card)));
    }
    function renderLineUp() {
        if(!gameBoardElements.lineUp || !gameState.lineUp) return;
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
        if (gameState.player && gameState.player.superhero) {
            gameBoardElements.superheroArea.appendChild(createCardElement(gameState.player.superhero));
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
    }

    init();
});