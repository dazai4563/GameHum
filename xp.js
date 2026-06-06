// xp.js – полностью локальная версия (без Supabase)
const XP_STORAGE_KEY = 'guest_xp';

async function getCurrentXP() {
    const xp = localStorage.getItem(XP_STORAGE_KEY);
    return xp ? parseInt(xp, 10) : 0;
}

async function setXP(newXP) {
    localStorage.setItem(XP_STORAGE_KEY, newXP);
    // Обновляем отображение на всех страницах, где есть элемент xpValue
    const xpSpans = document.querySelectorAll('#xpValue');
    xpSpans.forEach(span => span.textContent = newXP);
}

async function addXP(amount) {
    const current = await getCurrentXP();
    await setXP(current + amount);
}

async function subtractXP(amount) {
    const current = await getCurrentXP();
    await setXP(Math.max(0, current - amount));
}

async function displayXP() {
    const xp = await getCurrentXP();
    const xpSpans = document.querySelectorAll('#xpValue');
    xpSpans.forEach(span => span.textContent = xp);
}

// Делаем функции глобальными, чтобы они были доступны из игр
window.getCurrentXP = getCurrentXP;
window.setXP = setXP;
window.addXP = addXP;
window.subtractXP = subtractXP;
window.displayXP = displayXP;

// Автоматически обновляем XP при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    displayXP();
});