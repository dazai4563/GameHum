// roulette.js – исправленный
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

async function updateUI() {
    const mp = await getCurrentMp();
    const mpSpan = document.getElementById('mpValue');
    if (mpSpan) mpSpan.textContent = mp;
    betInput.max = mp;
    if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
}

async function spinWheel() {
    let bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerHTML = 'Ставка должна быть не менее 1 Mp';
        return;
    }
    const currentMp = await getCurrentMp();
    if (bet > currentMp) {
        resultDiv.innerHTML = `Недостаточно Mp. У вас ${currentMp} Mp`;
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
    await setMp(newMp);
    resultDiv.innerHTML = `<strong>${message}</strong><br>Теперь у вас ${newMp} Mp.`;
    await updateUI(); // принудительно обновляем UI после установки
    spinBtn.style.transform = 'scale(0.98)';
    setTimeout(() => spinBtn.style.transform = '', 150);
}

maxBetBtn.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    betInput.value = mp;
});
spinBtn.addEventListener('click', spinWheel);
updateUI();