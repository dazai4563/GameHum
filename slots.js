// slots.js – исправленная версия (однократное списание)
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('betAmount');
const maxBetBtn = document.getElementById('maxBetBtn');
const resultDiv = document.getElementById('resultMsg');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');

const symbols = [
    { emoji: '🍒', name: 'вишня', multiplier: 2, weight: 25 },
    { emoji: '🍋', name: 'лимон', multiplier: 3, weight: 20 },
    { emoji: '🍊', name: 'апельсин', multiplier: 4, weight: 15 },
    { emoji: '🍇', name: 'слива', multiplier: 5, weight: 12 },
    { emoji: '🔔', name: 'колокольчик', multiplier: 7, weight: 10 },
    { emoji: '7️⃣', name: 'семёрка', multiplier: 10, weight: 8 },
    { emoji: '❤️', name: 'черви', multiplier: 2, weight: 15 },
    { emoji: '💯', name: '100', multiplier: 30, weight: 4 }
];

let currentMp = 0;

async function loadMp() {
    if (typeof getCurrentMp === 'function') {
        currentMp = await getCurrentMp();
    } else {
        let mp = localStorage.getItem('mp_points');
        currentMp = mp ? parseInt(mp) : 100;
    }
    document.getElementById('mpValue').innerText = currentMp;
    betInput.max = currentMp;
    if (parseInt(betInput.value) > currentMp) betInput.value = Math.max(1, currentMp);
}

async function saveMp(value) {
    if (typeof setMp === 'function') {
        await setMp(value);
    } else {
        localStorage.setItem('mp_points', value);
    }
    currentMp = value;
    document.getElementById('mpValue').innerText = value;
    betInput.max = value;
    if (parseInt(betInput.value) > value) betInput.value = Math.max(1, value);
}

function getRandomSymbol() {
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let accum = 0;
    for (let s of symbols) {
        accum += s.weight;
        if (rand < accum) return { ...s };
    }
    return symbols[0];
}

function calculateWin(sym1, sym2, sym3, bet) {
    if (sym1.emoji === '💯' && sym2.emoji === '💯' && sym3.emoji === '💯') {
        const win = bet * 30;
        setTimeout(() => alert(`🎉 ДЖЕКПОТ! 🎉\nВыпали три 💯! Вы выиграли ${win} Mp!`), 100);
        return { win, message: `💯💯💯 ДЖЕКПОТ! x10! Выигрыш: ${win} Mp 💯💯💯` };
    }
    if (sym1.emoji === sym2.emoji && sym2.emoji === sym3.emoji) {
        const win = bet * sym1.multiplier;
        return { win, message: `🎉 Три ${sym1.name}! Выигрыш: ${win} Mp` };
    }
    const hearts = [sym1, sym2, sym3].filter(s => s.emoji === '❤️').length;
    if (hearts >= 2) {
        const win = bet * 2;
        return { win, message: `❤️❤️ Два черви! Выигрыш: ${win} Mp` };
    }
    return { win: 0, message: '😢 Ничего не выпало. Попробуйте ещё!' };
}

function spinReelWithAnimation(bet) {
    let spins = 0;
    const maxSpins = 10;
    const interval = setInterval(() => {
        const r1 = getRandomSymbol();
        const r2 = getRandomSymbol();
        const r3 = getRandomSymbol();
        reel1.textContent = r1.emoji;
        reel2.textContent = r2.emoji;
        reel3.textContent = r3.emoji;
        spins++;
        if (spins >= maxSpins) {
            clearInterval(interval);
            const final1 = getRandomSymbol();
            const final2 = getRandomSymbol();
            const final3 = getRandomSymbol();
            reel1.textContent = final1.emoji;
            reel2.textContent = final2.emoji;
            reel3.textContent = final3.emoji;
            const result = calculateWin(final1, final2, final3, bet);
            let newMp;
            if (result.win > 0) {
                newMp = currentMp + result.win;
                saveMp(newMp);
                resultDiv.innerHTML = `<span style="color:#aaffaa;">${result.message}<br>Новый баланс: ${newMp} Mp</span>`;
            } else {
                newMp = currentMp - bet;
                saveMp(newMp);
                resultDiv.innerHTML = `<span style="color:#ffaaaa;">${result.message}<br>Вы проиграли ${bet} Mp. Баланс: ${newMp} Mp</span>`;
            }
            spinBtn.disabled = false;
        }
    }, 80);
}

async function spin() {
    if (spinBtn.disabled) return;
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet < 1) {
        resultDiv.innerHTML = 'Ставка должна быть не менее 1 Mp';
        return;
    }
    if (bet > currentMp) {
        resultDiv.innerHTML = `Недостаточно Mp. У вас ${currentMp} Mp`;
        return;
    }
    spinBtn.disabled = true;
    spinReelWithAnimation(bet);
}

maxBetBtn.addEventListener('click', () => {
    betInput.value = currentMp;
});
spinBtn.addEventListener('click', spin);
loadMp();