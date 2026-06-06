// blackjack.js – Блэкджек на XP (ставка, игра, возврат к ставкам)

// ========== Глобальные переменные ==========
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;      // идёт ли активная игра (разрешены hit/stand)
let bettingPhase = true;     // режим выбора ставки
let currentBet = 0;
let currentUserXP = 0;

// ========== DOM элементы ==========
const bettingMenu = document.getElementById('bettingMenu');
const gameArea = document.getElementById('gameArea');
const betInput = document.getElementById('betAmount');
const setMaxBetBtn = document.getElementById('setMaxBetBtn');
const confirmBetBtn = document.getElementById('confirmBetBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const exitToBetBtn = document.getElementById('exitToBetBtn');
const newRoundBtnContainer = document.getElementById('newRoundBtnContainer');
const gameResultDiv = document.getElementById('gameResult');
const dealerCardsDiv = document.getElementById('dealerCards');
const playerCardsDiv = document.getElementById('playerCards');
const dealerScoreSpan = document.getElementById('dealerScore');
const playerScoreSpan = document.getElementById('playerScore');
const currentXPDisplaySpan = document.getElementById('currentXPDisplay');

// ========== Вспомогательные функции карт ==========
function createDeck() {
    const suits = ['♠', '♥', '♣', '♦'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ suit, value });
        }
    }
    // Перемешивание (Fisher-Yates)
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['K','Q','J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function getCardHTML(card, hidden = false) {
    if (hidden) {
        return '<div class="card">?</div>';
    }
    const isRed = (card.suit === '♥' || card.suit === '♦');
    return `<div class="card ${isRed ? 'red' : ''}">${card.value}${card.suit}</div>`;
}

// Обновление отображения карт и очков
function updateUI() {
    // Карты игрока
    playerCardsDiv.innerHTML = playerHand.map(c => getCardHTML(c)).join('');
    playerScoreSpan.textContent = calculateScore(playerHand);
    
    if (gameActive && !bettingPhase) {
        // Во время игры – первая карта дилера скрыта
        if (dealerHand.length > 0) {
            const dealerHTML = getCardHTML(dealerHand[0], true) + dealerHand.slice(1).map(c => getCardHTML(c)).join('');
            dealerCardsDiv.innerHTML = dealerHTML;
            // Считаем очки только открытых карт (все, кроме первой)
            let visibleScore = 0;
            for (let i = 1; i < dealerHand.length; i++) {
                const c = dealerHand[i];
                if (c.value === 'A') visibleScore += 11;
                else if (['K','Q','J'].includes(c.value)) visibleScore += 10;
                else visibleScore += parseInt(c.value);
            }
            dealerScoreSpan.textContent = `? + ${visibleScore}`;
        }
    } else {
        dealerCardsDiv.innerHTML = dealerHand.map(c => getCardHTML(c)).join('');
        dealerScoreSpan.textContent = calculateScore(dealerHand);
    }
}

// ========== Управление XP ==========
async function refreshUserXP() {
    if (typeof getCurrentXP === 'function') {
        currentUserXP = await getCurrentXP();
        currentXPDisplaySpan.textContent = currentUserXP;
        betInput.max = currentUserXP;
        if (parseInt(betInput.value) > currentUserXP) betInput.value = Math.max(1, currentUserXP);
    }
}

// ========== Переключение между режимами ==========
function showBettingMode() {
    bettingPhase = true;
    gameActive = false;
    bettingMenu.style.display = 'block';
    gameArea.style.display = 'none';
    newRoundBtnContainer.innerHTML = '';
    // Сброс карт
    playerHand = [];
    dealerHand = [];
    updateUI();
    gameResultDiv.innerHTML = '';
}

function showGameMode() {
    bettingPhase = false;
    bettingMenu.style.display = 'none';
    gameArea.style.display = 'block';
    newRoundBtnContainer.innerHTML = '';
}

// ========== Завершение раунда ==========
async function endRound(result, message, xpChange) {
    gameActive = false;
    if (xpChange !== 0) {
        if (xpChange > 0) {
            await addXP(xpChange);
        } else {
            await subtractXP(-xpChange);
        }
        await refreshUserXP();
    }
    // Показываем полные карты дилера
    updateUI();
    gameResultDiv.innerHTML = message;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    // Кнопки после игры
    newRoundBtnContainer.innerHTML = `
        <button id="newRoundFromGameBtn" class="action-btn">🔄 Сыграть ещё</button>
        <button id="exitAfterGameBtn" class="exit-btn">🚪 Выйти в меню ставок</button>
    `;
    document.getElementById('newRoundFromGameBtn').addEventListener('click', () => startNewRoundAfterGame());
    document.getElementById('exitAfterGameBtn').addEventListener('click', () => showBettingMode());
    
    // Сохраняем рекорд (1 очко за победу) в таблицу лидеров
    if (result === 'win' && window.currentUser && typeof saveScoreToLeaderboard === 'function') {
        await saveScoreToLeaderboard(1);
    }
}

async function startNewRoundAfterGame() {
    newRoundBtnContainer.innerHTML = '';
    await startGame(); // раздача заново с той же ставкой
}

// ========== Ход дилера ==========
async function dealerTurn() {
    let dealerScore = calculateScore(dealerHand);
    while (dealerScore < 17) {
        dealerHand.push(deck.pop());
        dealerScore = calculateScore(dealerHand);
    }
    updateUI();
    const playerScore = calculateScore(playerHand);
    if (dealerScore > 21) {
        await endRound('win', `Дилер перебрал! Вы выиграли ${currentBet} XP!`, currentBet);
    } else if (dealerScore > playerScore) {
        await endRound('lose', `Дилер набрал ${dealerScore}. Вы проиграли ${currentBet} XP.`, -currentBet);
    } else if (dealerScore < playerScore) {
        await endRound('win', `Вы набрали ${playerScore}. Вы выиграли ${currentBet} XP!`, currentBet);
    } else {
        await endRound('push', `Ничья! Ставка возвращена.`, 0);
    }
}

// ========== Основные игровые действия ==========
async function startGame() {
    if (gameActive) return;
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        gameResultDiv.innerHTML = 'Ставка должна быть не менее 1 XP';
        return;
    }
    if (bet > currentUserXP) {
        gameResultDiv.innerHTML = `Недостаточно XP. Ваш XP: ${currentUserXP}`;
        return;
    }
    currentBet = bet;
    
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    
    updateUI();
    hitBtn.disabled = false;
    standBtn.disabled = false;
    gameResultDiv.innerHTML = 'Игра началась. Ваш ход.';
    
    const playerScore = calculateScore(playerHand);
    if (playerScore === 21) {
        const dealerScore = calculateScore(dealerHand);
        if (dealerScore === 21) {
            await endRound('push', 'У обоих блэкджек! Ничья.', 0);
        } else {
            await endRound('win', `Блэкджек! Вы выиграли ${currentBet} XP!`, currentBet);
        }
    }
}

async function hit() {
    if (!gameActive) return;
    playerHand.push(deck.pop());
    updateUI();
    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        await endRound('lose', `Перебор! Вы проиграли ${currentBet} XP.`, -currentBet);
    } else if (playerScore === 21) {
        await stand();
    }
}

async function stand() {
    if (!gameActive) return;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    await dealerTurn();
}

// ========== Управление ставкой ==========
async function setMaxBet() {
    await refreshUserXP();
    betInput.value = currentUserXP;
}

async function confirmBet() {
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        gameResultDiv.innerHTML = 'Введите корректную ставку (≥1)';
        return;
    }
    if (bet > currentUserXP) {
        gameResultDiv.innerHTML = `Недостаточно XP. Доступно: ${currentUserXP}`;
        return;
    }
    currentBet = bet;
    showGameMode();
    await startGame();
}

// ========== Инициализация ==========
document.addEventListener('DOMContentLoaded', async () => {
    await refreshUserXP();
    showBettingMode();
    
    confirmBetBtn.addEventListener('click', confirmBet);
    setMaxBetBtn.addEventListener('click', setMaxBet);
    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    exitToBetBtn.addEventListener('click', () => showBettingMode());
    
    // Обновляем XP при изменении в другой вкладке
    window.addEventListener('storage', refreshUserXP);
});

// Периодическое обновление XP (на случай, если XP изменился через другие игры)
setInterval(refreshUserXP, 3000);