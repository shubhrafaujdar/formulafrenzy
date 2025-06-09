// --- GAME STATE & CONSTANTS ---
const cardValues = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const cardDisplays = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = ['♥', '♦', '♣', '♠'];

let deck = [];
let playerHand = [];
let targetCard = null;
let score = 0;

// --- HTML ELEMENT REFERENCES ---
const targetCardEl = document.getElementById('target-card');
const handAreaEl = document.getElementById('hand-area');
const scoreDisplayEl = document.getElementById('score-display');
const messageDisplayEl = document.getElementById('message-display');
const formulaInputEl = document.getElementById('formula-input');
const submitBtn = document.getElementById('submit-btn');
const passBtn = document.getElementById('pass-btn');

// --- CORE GAME LOGIC ---

function createDeck() {
    deck = [];
    for (const suit of suits) {
        for (const display of cardDisplays) {
            deck.push({ 
                display: display, 
                value: cardValues[display] 
            });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
    }
}

function dealNewRound() {
    // If deck is low, create and shuffle a new one
    if (deck.length < 10) {
        createDeck();
        shuffleDeck();
        console.log("Deck reshuffled.");
    }
    
    // Deal target card
    targetCard = deck.pop();

    // Deal hand
    playerHand = [];
    for (let i = 0; i < 5; i++) {
        playerHand.push(deck.pop());
    }
    
    // Clear input
    formulaInputEl.value = '';

    renderGame();
}

function renderGame() {
    // Render Target Card
    targetCardEl.textContent = targetCard.display;
    
    // Render Player Hand
    handAreaEl.innerHTML = '<h2>Your Hand</h2>'; // Clear previous hand
    playerHand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = card.display;
        handAreaEl.appendChild(cardEl);
    });

    // Update Score
    scoreDisplayEl.textContent = `Score: ${score}`;
}

function handleSubmit() {
    const formula = formulaInputEl.value;
    if (!formula) {
        updateMessage("Please enter a formula.", "error");
        return;
    }
    
    // 1. Validate that the formula only uses numbers from the hand
    const numbersInFormula = formula.match(/\d+/g)?.map(Number) || [];
    const handValues = playerHand.map(c => c.value);
    
    let tempHand = [...handValues];
    let usedCardsValid = true;
    for (const num of numbersInFormula) {
        const index = tempHand.indexOf(num);
        if (index > -1) {
            tempHand.splice(index, 1); // Remove the used card
        } else {
            usedCardsValid = false;
            break;
        }
    }

    if (!usedCardsValid) {
        updateMessage(`Invalid formula! You can only use the numbers in your hand: ${handValues.join(', ')}.`, "error");
        return;
    }

    // 2. Safely evaluate the formula result
    let result;
    try {
        result = math.evaluate(formula);
    } catch (error) {
        updateMessage("Invalid math formula. Try again!", "error");
        return;
    }

    // 3. Check if result matches target
    if (result === targetCard.value) {
        // Correct! Calculate score
        const cardsUsed = numbersInFormula.length;
        if (cardsUsed === 5) {
            score += 3; // Formula Frenzy!
            updateMessage(`Formula Frenzy! +3 points! (${result} = ${targetCard.value})`, "success");
        } else {
            score += 1;
            updateMessage(`Correct! +1 point. (${result} = ${targetCard.value})`, "success");
        }
        setTimeout(dealNewRound, 1500); // Wait 1.5s then start next round
    } else {
        updateMessage(`Incorrect. Your formula equals ${result}, not ${targetCard.value}.`, "error");
    }
}

function handlePass() {
    updateMessage("Passed. Here's a new hand.", "normal");
    // Just deal a new hand, keeping the same target
    playerHand = [];
    for (let i = 0; i < 5; i++) {
        playerHand.push(deck.pop());
    }
    renderGame();
}

function updateMessage(text, type) {
    messageDisplayEl.textContent = text;
    if (type === "success") {
        messageDisplayEl.style.color = "#a0ffa0"; // Light green
    } else if (type === "error") {
        messageDisplayEl.style.color = "#ff8a8a"; // Light red
    } else {
        messageDisplayEl.style.color = "#ffc"; // Default yellow-white
    }
}

// --- EVENT LISTENERS ---
submitBtn.addEventListener('click', handleSubmit);
passBtn.addEventListener('click', handlePass);
// Allow pressing Enter to submit
formulaInputEl.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

// --- INITIALIZE GAME ---
console.log("Starting Formula Frenzy!");
dealNewRound();