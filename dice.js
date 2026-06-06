// dice.js
const rollBtn = document.getElementById('rollBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const sumInput = document.getElementById('sumBet');
const resultDiv = document.getElementById('resultMsg');
const die1El = document.getElementById('die1');
const die2El = document.getElementById('die2');

const multipliers = { 2:6, 3:6, 4:5, 5:4, 6:3, 7:2, 8:3, 9:3, 10:4, 11:5, 12:6 };

function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value-1];
}

async function updateUI() {
    const mp = await getCurrentMp();
    document.getElementById('mpValue').innerText = mp;
    betInput.max = mp;
    if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
}

async function rollDice() {
    const bet = parseInt(betInput.value);
    const chosenSum = parseInt(sumInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerText = 'Ставка должна быть ≥1';
        return;
    }
    const currentMp = await getCurrentMp();
    if (bet > currentMp) {
        resultDiv.innerText = `Не хватает Mp (${currentMp})`;
        return;
    }
    if (isNaN(chosenSum) || chosenSum < 2 || chosenSum > 12) {
        resultDiv.innerText = 'Выберите сумму от 2 до 12';
        return;
    }
    // Анимация прокрутки
    let rolls = 0;
    const interval = setInterval(() => {
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        die1El.innerText = getDieFace(r1);
        die2El.innerText = getDieFace(r2);
        rolls++;
        if (rolls >= 10) {
            clearInterval(interval);
            const final1 = Math.floor(Math.random() * 6) + 1;
            const final2 = Math.floor(Math.random() * 6) + 1;
            die1El.innerText = getDieFace(final1);
            die2El.innerText = getDieFace(final2);
            const total = final1 + final2;
            let winAmount = 0;
            let message = '';
            if (total === chosenSum) {
                const multiplier = multipliers[total];
                winAmount = bet * multiplier;
                message = `🎉 Выпало ${total}! Множитель x${multiplier}. Выигрыш: ${winAmount} Mp!`;
            } else {
                winAmount = -bet;
                message = `😢 Выпало ${total}, а не ${chosenSum}. Вы проиграли ${bet} Mp.`;
            }
            const newMp = currentMp + winAmount;
            await setMp(newMp);
            await updateUI();
            resultDiv.innerHTML = `<strong>${message}</strong><br>Баланс: ${newMp} Mp`;
            rollBtn.disabled = false;
        }
    }, 80);
    rollBtn.disabled = true;
}

maxBetBtn.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    betInput.value = mp;
});
rollBtn.addEventListener('click', rollDice);
updateUI();
window.addEventListener('mpUpdated', updateUI);