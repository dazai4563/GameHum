// roulette.js – исправленная версия (через глобальные mp функции)
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const resultDiv = document.getElementById('resultMsg');

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

let currentMp = 0;

async function loadMp() {
    currentMp = await getCurrentMp();
    document.getElementById('mpValue').innerText = currentMp;
    betInput.max = currentMp;
    if (parseInt(betInput.value) > currentMp) betInput.value = Math.max(1, currentMp);
}

async function saveMp(value) {
    await setMp(value);
    currentMp = value;
    document.getElementById('mpValue').innerText = value;
    betInput.max = value;
    if (parseInt(betInput.value) > value) betInput.value = Math.max(1, value);
}

function spinWheel() {
    let bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerHTML = 'Ставка должна быть не менее 1 Mp';
        return;
    }
    if (bet > currentMp) {
        resultDiv.innerHTML = `Недостаточно Mp. Ваши Mp: ${currentMp}`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const sector = sectors[randomIndex];
    let winAmount = 0;
    let message = '';
    if (sector.multiplier === 0) {
        winAmount = -bet;
        message = `${sector.name}... Вы проиграли ${bet} Mp!`;
    } else if (sector.multiplier === 1.0) {
        winAmount = 0;
        message = `${sector.name}! Ставка возвращена.`;
    } else {
        winAmount = Math.floor(bet * (sector.multiplier - 1));
        message = `${sector.name}! Вы выиграли ${winAmount} Mp!`;
    }
    const newMp = currentMp + winAmount;
    saveMp(newMp);
    resultDiv.innerHTML = `<strong>${message}</strong><br>Теперь у вас ${newMp} Mp.`;
    spinBtn.style.transform = 'scale(0.98)';
    setTimeout(() => spinBtn.style.transform = '', 150);
}

maxBetBtn.addEventListener('click', () => {
    betInput.value = currentMp;
});
spinBtn.addEventListener('click', spinWheel);
loadMp();