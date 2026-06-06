// blackjack.js – игра Блэкджек на XP

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameActive = false;
let currentBet = 0;
let currentUserXP = 0;

// DOM элементы
const betInput = document.getElementById('betAmount');
const setMaxBetBtn = document.getElementById('setMaxBetBtn');
const dealBtn = document.getElementById('dealBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const newRoundBtn = document.getElementById('newRoundBtn');
const gameResultDiv = document.getElementById('gameResult');
const dealerCardsDiv = document.getElementById('dealerCards');
const playerCardsDiv = document.getElementById('playerCards');
const dealerScoreSpan = document.getElementById('dealerScore');
const playerScoreSpan = document.getElementById('playerScore');
const currentXPDisplaySpan = document.getElementById('currentXPDisplay');

// === Инициализация колоды ===
function createDeck() {
    const suits = ['♠', '♥', '♣', '♦'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ suit, value });
        }
    }
    // Перемешиваем
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

// Подсчёт очков руки
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

// Отображение карты
function getCardHTML(card, hidden = false) {
    if (hidden) {
        return '<div class="card">?</div>';
    }
    const isRed = (card.suit === '♥' || card.suit === '♦');
    return `<div class="card ${isRed ? 'red' : ''}">${card.value}${card.suit}</div>`;
}

// Обновить интерфейс
function updateUI() {
    // Карты игрока
    playerCardsDiv.innerHTML = playerHand.map(c => getCardHTML(c)).join('');
    playerScoreSpan.textContent = calculateScore(playerHand);
    
    // Карты дилера (если игра активна, показываем первую скрытой)
    if (gameActive) {
        // Первая карта дилера скрыта
        if (dealerHand.length > 0) {
            const dealerHTML = getCardHTML(dealerHand[0], true) + dealerHand.slice(1).map(c => getCardHTML(c)).join('');
            dealerCardsDiv.innerHTML = dealerHTML;
            // Показываем очки только открытой карты (первая скрыта)
            const visibleScore = dealerHand.slice(1).reduce((sum, c) => sum + (c.value === 'A' ? 11 : (['K','Q','J'].includes(c.value) ? 10 : parseInt(c.value))), 0);
            dealerScoreSpan.textContent = `? + ${visibleScore}`;
        }
    } else {
        dealerCardsDiv.innerHTML = dealerHand.map(c => getCardHTML(c)).join('');
        dealerScoreSpan.textContent = calculateScore(dealerHand);
    }
}

// Обновить отображение XP пользователя
async function refreshUserXP() {
    if (typeof getCurrentXP === 'function') {
        currentUserXP = await getCurrentXP();
        currentXPDisplaySpan.textContent = currentUserXP;
        betInput.max = currentUserXP;
        if (betInput.value > currentUserXP) betInput.value = Math.max(1, currentUserXP);
    }
}

// Закончить раунд с результатом
async function endRound(result, message, xpChange) {
    gameActive = false;
    // Обновляем XP
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
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    newRoundBtn.disabled = false;
    // Сохраняем рекорд (победа – 1 очко в таблицу лидеров)
    if (result === 'win' && window.currentUser && typeof saveScoreToLeaderboard === 'function') {
        await saveScoreToLeaderboard(1);
    }
}

// Ход дилера
async function dealerTurn() {
    let dealerScore = calculateScore(dealerHand);
    while (dealerScore < 17) {
        dealerHand.push(deck.pop());
        dealerScore = calculateScore(dealerHand);
    }
    updateUI();
    const playerScore = calculateScore(playerHand);
    if (dealerScore > 21) {
        // Дилер перебрал – выигрыш игрока
        await endRound('win', `Дилер перебрал! Вы выиграли ${currentBet} XP!`, currentBet);
    } else if (dealerScore > playerScore) {
        await endRound('lose', `Дилер набрал ${dealerScore}. Вы проиграли ${currentBet} XP.`, -currentBet);
    } else if (dealerScore < playerScore) {
        await endRound('win', `Вы набрали ${playerScore}. Вы выиграли ${currentBet} XP!`, currentBet);
    } else {
        await endRound('push', `Ничья! Ставка возвращена.`, 0);
    }
}

// Начать игру (раздача)
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
    
    // Списываем ставку сразу? Нет, мы спишем в случае проигрыша. Но для целостности можно заблокировать сумму на время игры.
    // Лучше проверим ещё раз перед ходом дилера.
    
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameActive = true;
    
    updateUI();
    dealBtn.disabled = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    newRoundBtn.disabled = true;
    gameResultDiv.innerHTML = 'Игра началась. Ваш ход.';
    
    const playerScore = calculateScore(playerHand);
    if (playerScore === 21) {
        // Блэкджек у игрока (автоматическая победа, если у дилера не тоже 21)
        const dealerScore = calculateScore(dealerHand);
        if (dealerScore === 21) {
            await endRound('push', 'У обоих блэкджек! Ничья.', 0);
        } else {
            // Блэкджек – выигрыш 1.5? Упростим: удвоенная ставка (как обычный выигрыш)
            await endRound('win', `Блэкджек! Вы выиграли ${currentBet} XP!`, currentBet);
        }
    }
}

// Взять карту
async function hit() {
    if (!gameActive) return;
    playerHand.push(deck.pop());
    updateUI();
    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        // Перебор
        await endRound('lose', `Перебор! Вы проиграли ${currentBet} XP.`, -currentBet);
    } else if (playerScore === 21) {
        // Автоматическая остановка
        await stand();
    }
}

// Остановиться
async function stand() {
    if (!gameActive) return;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    await dealerTurn();
}

// Новый раунд (сброс без новой ставки)
function newRound() {
    gameActive = false;
    playerHand = [];
    dealerHand = [];
    updateUI();
    gameResultDiv.innerHTML = '';
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    newRoundBtn.disabled = true;
    // Очистка карт
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';
    dealerScoreSpan.textContent = '0';
    playerScoreSpan.textContent = '0';
}

// Установить максимальную ставку
async function setMaxBet() {
    await refreshUserXP();
    betInput.value = currentUserXP;
}

// Обновлять XP при изменении пользователя (выход/вход)
async function onAuthChange() {
    await refreshUserXP();
    if (!window.currentUser) {
        // Если вышел – сброс игры
        newRound();
    }
}

// Подписка на изменение авторизации (можно использовать простой setTimeout, но лучше через событие)
// Просто перевызовем refreshUserXP при загрузке страницы и после каждого действия, изменяющего XP.

document.addEventListener('DOMContentLoaded', async () => {
    await refreshUserXP();
    // Обработчики
    dealBtn.addEventListener('click', startGame);
    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    newRoundBtn.addEventListener('click', newRound);
    setMaxBetBtn.addEventListener('click', setMaxBet);
    // При изменении XP извне (например, после выхода) обновляем
    window.addEventListener('storage', refreshUserXP);
});

// Также обновляем XP каждые несколько секунд (на случай, если XP изменится в другой вкладке)
setInterval(refreshUserXP, 3000);