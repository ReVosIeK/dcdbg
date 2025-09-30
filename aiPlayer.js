import { shuffle, drawCards } from './utils.js';
import { createCardElement, STANDARD_LINEUP_SIZE } from './script.js';

// Obiekt przechowujący stan AI. Będzie on rozbudowywany w trakcie gry.
export let aiPlayer = {};

/**
 * Resetuje i inicjalizuje stan AI na początku nowej gry.
 * @param {object} allCards - Pełna lista wszystkich kart z cards.json.
 */
export function initializeAI(allCards) {
    // Resetuj obiekt AI
    aiPlayer = {
        name: "AI Player",
        superheroes: [],
        deck: [],
        hand: [],
        discard: [],
        playedCards: [],
        ongoing: []
    };

    // Stwórz startową talię AI (7 Ciosów, 3 Bezsilności)
    const punch = allCards.find(c => c.id === 'punch');
    const vulnerability = allCards.find(c => c.id === 'vulnerability');
    for (let i = 0; i < 7; i++) aiPlayer.deck.push({ ...punch, instanceId: `ai_punch_${i}` });
    for (let i = 0; i < 3; i++) aiPlayer.deck.push({ ...vulnerability, instanceId: `ai_vulnerability_${i}` });
    
    shuffle(aiPlayer.deck);

    // Daj AI losowego Superbohatera (na razie jednego)
    const superheroes = shuffle(allCards.filter(c => c.type === 'Super-Hero'));
    if (superheroes.length > 0) {
        const chosenHero = superheroes.pop();
        aiPlayer.superheroes.push({ ...chosenHero, instanceId: `ai_hero_${chosenHero.id}` });
    }
    console.log("AI Player has been initialized with Superhero:", aiPlayer.superheroes[0]?.name_en);
}

/**
 * Główna funkcja wykonująca całą turę AI.
 * @param {object} gameState - Główny obiekt stanu gry.
 */
export async function executeAITurn(gameState) {
    console.log("%c--- Start AI's Turn ---", "color: red; font-weight: bold;");
    
    const playArea = document.getElementById('play-area-wrapper');
    const aiPowerDisplay = document.getElementById('ai-power-value');

    // Faza 1: Zagranie kart i zliczenie mocy
    let aiPower = 0;
    playArea.innerHTML = ''; // Wyczyść strefę gry z kart gracza

    while (aiPlayer.hand.length > 0) {
        const card = aiPlayer.hand.pop();
        aiPower += card.power || 0;
        aiPlayer.playedCards.push(card);
        playArea.appendChild(createCardElement(card)); // Pokaż kartę AI w strefie gry
        aiPowerDisplay.textContent = aiPower; // Aktualizuj moc AI na żywo
        await new Promise(resolve => setTimeout(resolve, 250)); // Pauza, aby gracz zobaczył co się dzieje
    }
    console.log(`AI generated ${aiPower} Power.`);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Dłuższa pauza przed zakupami

    // Faza 2: Zakupy
    await purchasePhase_Medium(aiPower, gameState);

    // Faza 3: Sprzątanie i dobranie nowej ręki
    cleanupPhase_AI(gameState);
    
    // Wyczyść strefę gry i liczniki po turze AI
    playArea.innerHTML = '';
    aiPowerDisplay.textContent = '0';
    
    console.log("%c--- End AI's Turn ---", "color: red; font-weight: bold;");
}

// --- LOGIKA FAZ DLA POZIOMU ŚREDNIEGO ---

function playCardsPhase_Medium(gameState) {
    let totalPower = 0;
    // Na razie prosta logika: zagraj wszystko, zlicz moc.
    while (aiPlayer.hand.length > 0) {
        const card = aiPlayer.hand.pop();
        totalPower += card.power || 0;
        aiPlayer.playedCards.push(card);
    }
    return totalPower;
}

async function purchasePhase_Medium(aiPower, gameState) {
    // Priorytet #1: Super-złoczyńca
    if (gameState.superVillainStack.length > 0) {
        const sv = gameState.superVillainStack[0];
        if (aiPower >= sv.cost) {
            console.log(`AI is defeating Super-Villain: ${sv.name_en}`);
            const defeatedSV = gameState.superVillainStack.shift();
            aiPlayer.discard.push(defeatedSV);
            aiPower -= sv.cost;
            return;
        }
    }

    // Priorytet #2: Karta z Line-Upu o najwyższej "ocenie wartości"
    const affordableCards = gameState.lineUp.filter(card => card && aiPower >= card.cost);
    if (affordableCards.length > 0) {
        affordableCards.sort((a, b) => {
            const scoreA = (a.cost || 0) + (a.vp || 0);
            const scoreB = (b.cost || 0) + (b.vp || 0);
            return scoreB - scoreA;
        });

        const bestCard = affordableCards[0];
        console.log(`AI is buying from Line-Up: ${bestCard.name_en}`);
        
        const cardIndex = gameState.lineUp.findIndex(c => c && c.instanceId === bestCard.instanceId);
        if (cardIndex > -1) {
            aiPower -= bestCard.cost;
            // --- POPRAWKA: Inteligentna obsługa placeholderów dla AI ---
            if (cardIndex < STANDARD_LINEUP_SIZE) {
                const [boughtCard] = gameState.lineUp.splice(cardIndex, 1, null);
                aiPlayer.discard.push(boughtCard);
            } else {
                const [boughtCard] = gameState.lineUp.splice(cardIndex, 1);
                aiPlayer.discard.push(boughtCard);
            }
        }
        return;
    }

    // Priorytet #3: Kopniak
    if (gameState.kickStack.length > 0 && aiPower >= gameState.kickStack[0].cost) {
        const kick = gameState.kickStack[0];
        console.log(`AI is buying: ${kick.name_en}`);
        const boughtKick = gameState.kickStack.shift();
        aiPlayer.discard.push(boughtKick);
        aiPower -= kick.cost;
    }
}

function cleanupPhase_AI(gameState) {
    // Przenieś zagrane karty i resztę ręki na stos kart odrzuconych
    aiPlayer.discard.push(...aiPlayer.playedCards);
    aiPlayer.discard.push(...aiPlayer.hand);
    aiPlayer.playedCards = [];
    aiPlayer.hand = [];

    // Dobierz 5 nowych kart
    drawCards(aiPlayer, 5, gameState);
    console.log("AI drew a new hand of 5 cards.");
}