// blackjack.js – исправленная версия с проверками

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let bettingPhase = true;
let currentBet = 0;
let currentUserXP = 0;

// DOM элементы с проверками
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

// Проверка наличия критических элементов
if (!bettingMenu || !gameArea) {
    console.error('Критические элементы не найдены! Проверьте blackjack.html');
}

function createDeck() {
    const suits = ['♠', '♥', '♣', '♦'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ suit, value });
        }
    }
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
    if (hidden) return '<div class="card">?</div>';
    const isRed = (card.suit === '♥' || card.suit === '♦');
    return `<div class="card ${isRed ? 'red' : ''}">${card.value}${card.suit}</div>`;
}

function updateUI() {
    if (playerCardsDiv) playerCardsDiv.innerHTML = playerHand.map(c => getCardHTML(c)).join('');
    if (playerScoreSpan) playerScoreSpan.textContent = calculateScore(playerHand);
    if (gameActive && !bettingPhase && dealerHand.length > 0) {
        if (dealerCardsDiv) {
            const dealerHTML = getCardHTML(dealerHand[0], true) + dealerHand.slice(1).map(c => getCardHTML(c)).join('');
            dealerCardsDiv.innerHTML = dealerHTML;
        }
        let visibleScore = 0;
        for (let i = 1; i < dealerHand.length; i++) {
            const c = dealerHand[i];
            if (c.value === 'A') visibleScore += 11;
            else if (['K','Q','J'].includes(c.value)) visibleScore += 10;
            else visibleScore += parseInt(c.value);
        }
        if (dealerScoreSpan) dealerScoreSpan.textContent = `? + ${visibleScore}`;
    } else {
        if (dealerCardsDiv) dealerCardsDiv.innerHTML = dealerHand.map(c => getCardHTML(c)).join('');
        if (dealerScoreSpan) dealerScoreSpan.textContent = calculateScore(dealerHand);
    }
}

async function refreshUserXP() {
    if (typeof getCurrentXP === 'function') {
        currentUserXP = await getCurrentXP();
        if (currentXPDisplaySpan) currentXPDisplaySpan.textContent = currentUserXP;
        if (betInput) {
            betInput.max = currentUserXP;
            if (parseInt(betInput.value) > currentUserXP) betInput.value = Math.max(1, currentUserXP);
        }
    }
}

function showBettingMode() {
    bettingPhase = true;
    gameActive = false;
    if (bettingMenu) bettingMenu.style.display = 'block';
    if (gameArea) gameArea.style.display = 'none';
    if (newRoundBtnContainer) newRoundBtnContainer.innerHTML = '';
    playerHand = [];
    dealerHand = [];
    if (updateUI) updateUI();
    if (gameResultDiv) gameResultDiv.innerHTML = '';
}

function showGameMode() {
    if (!bettingPhase) return;
    bettingPhase = false;
    if (bettingMenu) bettingMenu.style.display = 'none';
    if (gameArea) gameArea.style.display = 'block';
    if (newRoundBtnContainer) newRoundBtnContainer.innerHTML = '';
}

async function endRound(result, message, xpChange) {
    gameActive = false;
    if (xpChange !== 0) {
        if (xpChange > 0) await addXP(xpChange);
        else await subtractXP(-xpChange);
        await refreshUserXP();
    }
    updateUI();
    if (gameResultDiv) gameResultDiv.innerHTML = message;
    if (hitBtn) hitBtn.disabled = true;
    if (standBtn) standBtn.disabled = true;
    if (newRoundBtnContainer) {
        newRoundBtnContainer.innerHTML = `
            <button id="newRoundFromGameBtn" class="action-btn">🔄 Сыграть ещё</button>
            <button id="exitAfterGameBtn" class="exit-btn">🚪 Выйти в меню ставок</button>
        `;
        const newRoundBtn = document.getElementById('newRoundFromGameBtn');
        const exitAfterBtn = document.getElementById('exitAfterGameBtn');
        if (newRoundBtn) newRoundBtn.onclick = () => startNewRoundAfterGame();
        if (exitAfterBtn) exitAfterBtn.onclick = () => showBettingMode();
    }
    if (result === 'win' && window.currentUser && typeof saveScoreToLeaderboard === 'function') {
        await saveScoreToLeaderboard(1);
    }
}

async function startNewRoundAfterGame() {
    if (newRoundBtnContainer) newRoundBtnContainer.innerHTML = '';
    await startGame();
}

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

async function startGame() {
    if (gameActive) return;
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        if (gameResultDiv) gameResultDiv.innerHTML = 'Ставка должна быть не менее 1 XP';
        return;
    }
    if (bet > currentUserXP) {
        if (gameResultDiv) gameResultDiv.innerHTML = `Недостаточно XP. Ваш XP: ${currentUserXP}`;
        return;
    }
    currentBet = bet;
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    updateUI();
    if (hitBtn) hitBtn.disabled = false;
    if (standBtn) standBtn.disabled = false;
    if (gameResultDiv) gameResultDiv.innerHTML = 'Игра началась. Ваш ход.';
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
    if (hitBtn) hitBtn.disabled = true;
    if (standBtn) standBtn.disabled = true;
    await dealerTurn();
}

async function setMaxBet() {
    await refreshUserXP();
    if (betInput) betInput.value = currentUserXP;
}

async function confirmBet() {
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        if (gameResultDiv) gameResultDiv.innerHTML = 'Введите корректную ставку (≥1)';
        return;
    }
    if (bet > currentUserXP) {
        if (gameResultDiv) gameResultDiv.innerHTML = `Недостаточно XP. Доступно: ${currentUserXP}`;
        return;
    }
    currentBet = bet;
    showGameMode();
    await startGame();
}

document.addEventListener('DOMContentLoaded', async () => {
    await refreshUserXP();
    showBettingMode();
    if (confirmBetBtn) confirmBetBtn.addEventListener('click', confirmBet);
    if (setMaxBetBtn) setMaxBetBtn.addEventListener('click', setMaxBet);
    if (hitBtn) hitBtn.addEventListener('click', hit);
    if (standBtn) standBtn.addEventListener('click', stand);
    if (exitToBetBtn) exitToBetBtn.addEventListener('click', () => showBettingMode());
    window.addEventListener('storage', refreshUserXP);
    setInterval(refreshUserXP, 3000);
});