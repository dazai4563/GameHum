// blackjack.js – упрощённая версия, работает без постоянного соединения с Supabase
let deck = [], playerHand = [], dealerHand = [];
let gameActive = false, bettingPhase = true;
let currentBet = 0, currentUserXP = 0;

// DOM элементы
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

// Функции колоды (без изменений)
function createDeck() {
    const suits = ['♠','♥','♣','♦'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    let deck = [];
    for (let s of suits) for (let v of values) deck.push({suit:s, value:v});
    for (let i=deck.length-1; i>0; i--) {
        let j = Math.floor(Math.random()*(i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
function cardValue(card) {
    if (card.value === 'A') return 11;
    if (['K','Q','J'].includes(card.value)) return 10;
    return parseInt(card.value);
}
function calculateScore(hand) {
    let score = 0, aces = 0;
    for (let card of hand) {
        if (card.value === 'A') aces++;
        score += cardValue(card);
    }
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
}
function getCardHTML(card, hidden=false) {
    if (hidden) return '<div class="card">?</div>';
    let isRed = (card.suit === '♥' || card.suit === '♦');
    return `<div class="card ${isRed ? 'red' : ''}">${card.value}${card.suit}</div>`;
}
function updateUI() {
    if (playerCardsDiv) playerCardsDiv.innerHTML = playerHand.map(c=>getCardHTML(c)).join('');
    if (playerScoreSpan) playerScoreSpan.textContent = calculateScore(playerHand);
    if (gameActive && !bettingPhase && dealerHand.length) {
        let visible = dealerHand.slice(1).map(c=>getCardHTML(c)).join('');
        if (dealerCardsDiv) dealerCardsDiv.innerHTML = getCardHTML(dealerHand[0], true) + visible;
        let visibleScore = dealerHand.slice(1).reduce((s,c)=>s+cardValue(c),0);
        if (dealerScoreSpan) dealerScoreSpan.textContent = `? + ${visibleScore}`;
    } else {
        if (dealerCardsDiv) dealerCardsDiv.innerHTML = dealerHand.map(c=>getCardHTML(c)).join('');
        if (dealerScoreSpan) dealerScoreSpan.textContent = calculateScore(dealerHand);
    }
}
async function refreshUserXP() {
    // локальная версия XP – без Supabase
    let xp = localStorage.getItem('guest_xp');
    currentUserXP = xp ? parseInt(xp) : 0;
    if (currentXPDisplaySpan) currentXPDisplaySpan.textContent = currentUserXP;
    if (betInput) betInput.max = currentUserXP;
    if (betInput && parseInt(betInput.value) > currentUserXP) betInput.value = Math.max(1, currentUserXP);
}
function showBettingMode() {
    bettingPhase = true; gameActive = false;
    if (bettingMenu) bettingMenu.style.display = 'block';
    if (gameArea) gameArea.style.display = 'none';
    if (newRoundBtnContainer) newRoundBtnContainer.innerHTML = '';
    playerHand = []; dealerHand = [];
    updateUI();
    if (gameResultDiv) gameResultDiv.innerHTML = '';
}
function showGameMode() {
    bettingPhase = false;
    if (bettingMenu) bettingMenu.style.display = 'none';
    if (gameArea) gameArea.style.display = 'block';
    if (newRoundBtnContainer) newRoundBtnContainer.innerHTML = '';
}
async function endRound(result, message, xpChange) {
    gameActive = false;
    if (xpChange !== 0) {
        let newXP = currentUserXP + xpChange;
        if (newXP < 0) newXP = 0;
        localStorage.setItem('guest_xp', newXP);
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
        document.getElementById('newRoundFromGameBtn')?.addEventListener('click', () => startNewRoundAfterGame());
        document.getElementById('exitAfterGameBtn')?.addEventListener('click', () => showBettingMode());
    }
    // Сохраняем рекорд только если есть saveScoreToLeaderboard и пользователь залогинен
    if (result === 'win' && window.currentUser && typeof saveScoreToLeaderboard === 'function') {
        saveScoreToLeaderboard(1);
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
    let playerScore = calculateScore(playerHand);
    if (dealerScore > 21) await endRound('win', `Дилер перебрал! Вы выиграли ${currentBet} XP!`, currentBet);
    else if (dealerScore > playerScore) await endRound('lose', `Дилер набрал ${dealerScore}. Вы проиграли ${currentBet} XP.`, -currentBet);
    else if (dealerScore < playerScore) await endRound('win', `Вы набрали ${playerScore}. Вы выиграли ${currentBet} XP!`, currentBet);
    else await endRound('push', 'Ничья! Ставка возвращена.', 0);
}
async function startGame() {
    if (gameActive) return;
    let bet = parseInt(betInput?.value || 0);
    if (isNaN(bet) || bet < 1) { if(gameResultDiv) gameResultDiv.innerHTML = 'Ставка ≥1'; return; }
    if (bet > currentUserXP) { if(gameResultDiv) gameResultDiv.innerHTML = `Не хватает XP: ${currentUserXP}`; return; }
    currentBet = bet;
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    updateUI();
    if (hitBtn) hitBtn.disabled = false;
    if (standBtn) standBtn.disabled = false;
    if (gameResultDiv) gameResultDiv.innerHTML = 'Ваш ход';
    let playerScore = calculateScore(playerHand);
    if (playerScore === 21) {
        let dealerScore = calculateScore(dealerHand);
        if (dealerScore === 21) await endRound('push', 'У обоих блэкджек! Ничья.', 0);
        else await endRound('win', `Блэкджек! +${currentBet} XP`, currentBet);
    }
}
async function hit() {
    if (!gameActive) return;
    playerHand.push(deck.pop());
    updateUI();
    let score = calculateScore(playerHand);
    if (score > 21) await endRound('lose', `Перебор! -${currentBet} XP`, -currentBet);
    else if (score === 21) await stand();
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
    let bet = parseInt(betInput?.value || 0);
    if (isNaN(bet) || bet < 1) { if(gameResultDiv) gameResultDiv.innerHTML = 'Введите ставку ≥1'; return; }
    if (bet > currentUserXP) { if(gameResultDiv) gameResultDiv.innerHTML = `Недостаточно XP. Доступно: ${currentUserXP}`; return; }
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
});
setInterval(refreshUserXP, 3000);