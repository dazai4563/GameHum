// roulette.js – игра "Колесо удачи" (локальное XP)
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const resultDiv = document.getElementById('resultMsg');
const xpSpan = document.getElementById('xpValueRoulette');

const sectors = [
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '🎁 +50%', multiplier: 1.5 },
    { name: '🎁 +100%', multiplier: 2.0 },
    { name: '🎁 +150%', multiplier: 2.5 },
    { name: '🔁 Возврат', multiplier: 1.0 },
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '🎁 +200%', multiplier: 3.0 }
];

let currentXP = 0;

async function loadXP() {
    if (typeof getCurrentXP === 'function') {
        currentXP = await getCurrentXP();
    } else {
        let xp = localStorage.getItem('guest_xp');
        currentXP = xp ? parseInt(xp) : 0;
    }
    xpSpan.innerText = currentXP;
    betInput.max = currentXP;
    if (parseInt(betInput.value) > currentXP) betInput.value = Math.max(1, currentXP);
}

async function saveXP(value) {
    if (typeof setXP === 'function') {
        await setXP(value);
    } else {
        localStorage.setItem('guest_xp', value);
    }
    currentXP = value;
    xpSpan.innerText = value;
    betInput.max = value;
    if (parseInt(betInput.value) > value) betInput.value = Math.max(1, value);
}

function spinWheel() {
    let bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerHTML = 'Ставка должна быть не менее 1 XP';
        return;
    }
    if (bet > currentXP) {
        resultDiv.innerHTML = `Недостаточно XP. Ваш XP: ${currentXP}`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const sector = sectors[randomIndex];
    let winAmount = 0;
    let message = '';
    if (sector.multiplier === 0) {
        winAmount = -bet;
        message = `${sector.name}... Вы проиграли ${bet} XP!`;
    } else if (sector.multiplier === 1.0) {
        winAmount = 0;
        message = `${sector.name}! Ставка возвращена.`;
    } else {
        winAmount = Math.floor(bet * (sector.multiplier - 1));
        message = `${sector.name}! Вы выиграли ${winAmount} XP!`;
    }
    const newXP = currentXP + winAmount;
    saveXP(newXP);
    resultDiv.innerHTML = `<strong>${message}</strong><br>Ваш новый XP: ${newXP}`;
    // анимация кнопки
    spinBtn.style.transform = 'scale(0.98)';
    setTimeout(() => spinBtn.style.transform = '', 150);
}

maxBetBtn.addEventListener('click', () => {
    betInput.value = currentXP;
});
spinBtn.addEventListener('click', spinWheel);

loadXP();