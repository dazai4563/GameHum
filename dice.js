// dice.js – игра Кости на Mp
const dice1El = document.getElementById('dice1');
const dice2El = document.getElementById('dice2');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const rollBtn = document.getElementById('rollBtn');
const resultDiv = document.getElementById('resultMsg');

let currentBetNumber = null; // выбранное число для ставки (2-12)
const multipliers = {
    2: 6, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2,
    8: 3, 9: 4, 10: 5, 11: 6, 12: 6
};

// Подсветка выбранной кнопки
document.querySelectorAll('.bet-option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.bet-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBetNumber = parseInt(btn.dataset.bet);
    });
});

async function refreshUI() {
    const mp = await getCurrentMp();
    document.getElementById('mpValue').innerText = mp;
    betInput.max = mp;
    if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
}

function diceFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

async function rollDice() {
    if (currentBetNumber === null) {
        resultDiv.innerText = 'Сначала выберите число для ставки!';
        return;
    }
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
    // Анимация броска
    rollBtn.disabled = true;
    let rolls = 0;
    const interval = setInterval(() => {
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        dice1El.innerText = diceFace(r1);
        dice2El.innerText = diceFace(r2);
        rolls++;
        if (rolls >= 10) {
            clearInterval(interval);
            const final1 = Math.floor(Math.random() * 6) + 1;
            const final2 = Math.floor(Math.random() * 6) + 1;
            dice1El.innerText = diceFace(final1);
            dice2El.innerText = diceFace(final2);
            const sum = final1 + final2;
            const multiplier = multipliers[currentBetNumber];
            let winAmount = 0;
            let msg = '';
            if (sum === currentBetNumber) {
                winAmount = bet * multiplier;
                msg = `Выпало ${sum}! Вы выиграли ${winAmount} Mp!`;
            } else {
                winAmount = -bet;
                msg = `Выпало ${sum}. Ставка не сыграла. Проигрыш ${bet} Mp.`;
            }
            const newMp = currentMp + winAmount;
            await setMp(newMp);
            await refreshUI();
            resultDiv.innerHTML = `<strong>${msg}</strong><br>Баланс: ${newMp} Mp`;
            rollBtn.disabled = false;
        }
    }, 80);
}

maxBetBtn.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    betInput.value = mp;
});
rollBtn.addEventListener('click', rollDice);
refreshUI();
window.addEventListener('mpUpdated', refreshUI);