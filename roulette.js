// roulette.js – рулетка на лунные очки
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const resultDiv = document.getElementById('resultMsg');

const sectors = [
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '🎁 +100%', multiplier: 2.0 },
    { name: '🎁 +150%', multiplier: 2.5 },
    { name: '🔁 Возврат', multiplier: 1.0 },
    { name: '❌ Проигрыш', multiplier: 0 },
    { name: '🎁 +200%', multiplier: 3.0 }
];

let currentMoons = 0;

async function loadMoons() {
    if (typeof getCurrentMoons === 'function') {
        currentMoons = await getCurrentMoons();
    } else {
        let m = localStorage.getItem('moon_points');
        currentMoons = m ? parseInt(m) : 100;
    }
    document.getElementById('moonValue').innerText = currentMoons;
    betInput.max = currentMoons;
    if (parseInt(betInput.value) > currentMoons) betInput.value = Math.max(1, currentMoons);
}

async function saveMoons(value) {
    if (typeof setMoons === 'function') {
        await setMoons(value);
    } else {
        localStorage.setItem('moon_points', value);
    }
    currentMoons = value;
    document.getElementById('moonValue').innerText = value;
    betInput.max = value;
    if (parseInt(betInput.value) > value) betInput.value = Math.max(1, value);
}

function spinWheel() {
    let bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerHTML = 'Ставка должна быть не менее 1 луны';
        return;
    }
    if (bet > currentMoons) {
        resultDiv.innerHTML = `Недостаточно лун. Ваши луны: ${currentMoons}`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const sector = sectors[randomIndex];
    let winAmount = 0;
    let message = '';
    if (sector.multiplier === 0) {
        winAmount = -bet;
        message = `${sector.name}... Вы проиграли ${bet} лун!`;
    } else if (sector.multiplier === 1.0) {
        winAmount = 0;
        message = `${sector.name}! Ставка возвращена.`;
    } else {
        winAmount = Math.floor(bet * (sector.multiplier - 1));
        message = `${sector.name}! Вы выиграли ${winAmount} лун!`;
    }
    const newMoons = currentMoons + winAmount;
    saveMoons(newMoons);
    resultDiv.innerHTML = `<strong>${message}</strong><br>Теперь у вас ${newMoons} лун.`;
    spinBtn.style.transform = 'scale(0.98)';
    setTimeout(() => spinBtn.style.transform = '', 150);
}

maxBetBtn.addEventListener('click', () => {
    betInput.value = currentMoons;
});
spinBtn.addEventListener('click', spinWheel);
loadMoons();