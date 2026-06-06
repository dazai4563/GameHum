// roulette.js – рабочая версия
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

async function refreshUI() {
    const mp = await getCurrentMp();
    const mpSpan = document.getElementById('mpValue');
    if (mpSpan) mpSpan.innerText = mp;
    if (betInput) {
        betInput.max = mp;
        if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
    }
}

async function spin() {
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerText = 'Ставка должна быть ≥1';
        return;
    }
    const currentMp = await getCurrentMp();
    if (bet > currentMp) {
        resultDiv.innerText = `Не хватает Mp (${currentMp})`;
        return;
    }
    const idx = Math.floor(Math.random() * sectors.length);
    const s = sectors[idx];
    let winAmount = 0;
    let msg = '';
    if (s.multiplier === 0) {
        winAmount = -bet;
        msg = `${s.name}... Проигрыш ${bet} Mp!`;
    } else if (s.multiplier === 1.0) {
        winAmount = 0;
        msg = `${s.name}! Ставка возвращена.`;
    } else {
        winAmount = Math.floor(bet * (s.multiplier - 1));
        msg = `${s.name}! Выигрыш ${winAmount} Mp!`;
    }
    const newMp = currentMp + winAmount;
    await setMp(newMp);
    await refreshUI();
    resultDiv.innerHTML = `<strong>${msg}</strong><br>Баланс: ${newMp} Mp`;
    spinBtn.style.transform = 'scale(0.98)';
    setTimeout(() => spinBtn.style.transform = '', 150);
}

maxBetBtn?.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    if (betInput) betInput.value = mp;
});
spinBtn?.addEventListener('click', spin);
refreshUI();
window.addEventListener('mpUpdated', refreshUI);