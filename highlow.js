// highlow.js – игра Выше/Ниже
const currentNumberSpan = document.getElementById('currentNumber');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const higherBtn = document.getElementById('higherBtn');
const lowerBtn = document.getElementById('lowerBtn');
const equalBtn = document.getElementById('equalBtn');
const resultDiv = document.getElementById('resultMsg');

let currentNumber = 5; // стартовое число (1-10)

function getRandomNumber() {
    return Math.floor(Math.random() * 10) + 1;
}

async function refreshUI() {
    const mp = await getCurrentMp();
    document.getElementById('mpValue').innerText = mp;
    betInput.max = mp;
    if (parseInt(betInput.value) > mp) betInput.value = Math.max(1, mp);
}

async function play(choice) {
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
    const newNumber = getRandomNumber();
    let winAmount = 0;
    let msg = '';
    let won = false;
    if (choice === 'higher') {
        if (newNumber > currentNumber) {
            winAmount = bet;
            won = true;
            msg = `🎉 ${newNumber} > ${currentNumber}! Вы выиграли ${winAmount} Mp!`;
        } else {
            winAmount = -bet;
            msg = `😢 ${newNumber} не больше ${currentNumber}. Проигрыш ${bet} Mp.`;
        }
    } else if (choice === 'lower') {
        if (newNumber < currentNumber) {
            winAmount = bet;
            won = true;
            msg = `🎉 ${newNumber} < ${currentNumber}! Вы выиграли ${winAmount} Mp!`;
        } else {
            winAmount = -bet;
            msg = `😢 ${newNumber} не меньше ${currentNumber}. Проигрыш ${bet} Mp.`;
        }
    } else if (choice === 'equal') {
        if (newNumber === currentNumber) {
            winAmount = bet * 5;
            won = true;
            msg = `🎉🎉🎉 ${newNumber} = ${currentNumber}! Джекпот! Вы выиграли ${winAmount} Mp!`;
        } else {
            winAmount = -bet;
            msg = `😢 ${newNumber} ≠ ${currentNumber}. Проигрыш ${bet} Mp.`;
        }
    }
    const newMp = currentMp + winAmount;
    await setMp(newMp);
    await refreshUI();
    resultDiv.innerHTML = `<strong>${msg}</strong><br>Баланс: ${newMp} Mp`;
    currentNumber = newNumber;
    currentNumberSpan.innerText = currentNumber;
}

higherBtn.addEventListener('click', () => play('higher'));
lowerBtn.addEventListener('click', () => play('lower'));
equalBtn.addEventListener('click', () => play('equal'));
maxBetBtn.addEventListener('click', async () => {
    const mp = await getCurrentMp();
    betInput.value = mp;
});
refreshUI();
window.addEventListener('mpUpdated', refreshUI);