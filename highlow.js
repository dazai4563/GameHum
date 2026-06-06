// highlow.js
const higherBtn = document.getElementById('higherBtn');
const lowerBtn = document.getElementById('lowerBtn');
const equalBtn = document.getElementById('equalBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const resultDiv = document.getElementById('resultMsg');
const currentNumberSpan = document.getElementById('currentNumber');

let currentNumber = 5;

function generateNewNumber() {
    return Math.floor(Math.random() * 10) + 1; // 1..10
}

async function updateUI() {
    const mp = await getCurrentMp();
    document.getElementById('mpValue').innerText = mp;
    betInput.max = mp;
    if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
}

async function play(guess) {
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
    const nextNumber = generateNewNumber();
    let winAmount = 0;
    let message = '';
    if (guess === 'higher' && nextNumber > currentNumber) {
        winAmount = bet;
        message = `⬆️ Было ${currentNumber}, стало ${nextNumber}. Вы выиграли ${winAmount} Mp!`;
    } else if (guess === 'lower' && nextNumber < currentNumber) {
        winAmount = bet;
        message = `⬇️ Было ${currentNumber}, стало ${nextNumber}. Вы выиграли ${winAmount} Mp!`;
    } else if (guess === 'equal' && nextNumber === currentNumber) {
        winAmount = bet * 5;
        message = `🟰 Равно! Было ${currentNumber}, осталось ${nextNumber}. Выигрыш x5: ${winAmount} Mp!`;
    } else {
        winAmount = -bet;
        message = `😢 Не угадали: было ${currentNumber}, стало ${nextNumber}. Проигрыш ${bet} Mp.`;
    }
    const newMp = currentMp + winAmount;
    await setMp(newMp);
    await updateUI();
    currentNumber = nextNumber;
    currentNumberSpan.innerText = currentNumber;
    resultDiv.innerHTML = `<strong>${message}</strong><br>Баланс: ${newMp} Mp`;
}

higherBtn.addEventListener('click', () => play('higher'));
lowerBtn.addEventListener('click', () => play('lower'));
equalBtn.addEventListener('click', () => play('equal'));
maxBetBtn.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    betInput.value = mp;
});
updateUI();
window.addEventListener('mpUpdated', updateUI);