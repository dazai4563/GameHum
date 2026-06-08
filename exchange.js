// exchange.js
const amountInput = document.getElementById('amount');
const mpToXpBtn = document.getElementById('mpToXpBtn');
const xpToMpBtn = document.getElementById('xpToMpBtn');
const messageDiv = document.getElementById('message');

async function updateBalances() {
    const mp = await getCurrentMp();
    const xp = await getCurrentXP();
    document.getElementById('mpValue').innerText = mp;
    document.getElementById('xpValue').innerText = xp;
}

async function exchangeMpToXp() {
    let amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount < 1) {
        messageDiv.innerText = 'Введите положительное число';
        return;
    }
    const mp = await getCurrentMp();
    const neededMp = amount * 10; // 10 Mp за 1 XP
    if (mp < neededMp) {
        messageDiv.innerText = `Не хватает Mp. Нужно ${neededMp} Mp, у вас ${mp}`;
        return;
    }
    // Снимаем Mp, добавляем XP
    await subtractMp(neededMp);
    await addXP(amount);
    await updateBalances();
    messageDiv.innerText = `Обменянo ${neededMp} Mp → ${amount} XP`;
}

async function exchangeXpToMp() {
    let amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount < 1) {
        messageDiv.innerText = 'Введите положительное число';
        return;
    }
    const xp = await getCurrentXP();
    if (xp < amount) {
        messageDiv.innerText = `Не хватает XP. Нужно ${amount} XP, у вас ${xp}`;
        return;
    }
    // Снимаем XP, добавляем Mp
    await subtractXP(amount);
    await addMp(amount * 10);
    await updateBalances();
    messageDiv.innerText = `Обменянo ${amount} XP → ${amount * 10} Mp`;
}

mpToXpBtn.addEventListener('click', exchangeMpToXp);
xpToMpBtn.addEventListener('click', exchangeXpToMp);
updateBalances();
// Подписываемся на изменения валют (если меняются в других вкладках)
window.addEventListener('mpUpdated', updateBalances);
window.addEventListener('xpUpdated', updateBalances);