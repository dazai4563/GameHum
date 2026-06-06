// mp.js – единый источник данных с автообновлением UI
const MP_STORAGE_KEY = 'mp_points';
let currentMpCache = null;

async function loadFromStorage() {
    const mp = localStorage.getItem(MP_STORAGE_KEY);
    currentMpCache = mp ? parseInt(mp) : 100;
    return currentMpCache;
}

async function getCurrentMp() {
    if (currentMpCache === null) {
        await loadFromStorage();
    }
    return currentMpCache;
}

async function setMp(value) {
    currentMpCache = value;
    localStorage.setItem(MP_STORAGE_KEY, value);
    // Обновляем все элементы с id="mpValue" на странице
    const elements = document.querySelectorAll('#mpValue');
    elements.forEach(el => {
        el.textContent = value;
    });
    // Также обновляем элементы с классом .mp-value (если есть)
    document.querySelectorAll('.mp-value').forEach(el => el.textContent = value);
    // Диспатчим событие для дополнительной синхронизации
    window.dispatchEvent(new CustomEvent('mpUpdated', { detail: value }));
}

async function addMp(amount) {
    const cur = await getCurrentMp();
    await setMp(cur + amount);
}

async function subtractMp(amount) {
    const cur = await getCurrentMp();
    await setMp(Math.max(0, cur - amount));
}

async function displayMp() {
    const val = await getCurrentMp();
    document.querySelectorAll('#mpValue').forEach(el => el.textContent = val);
}

window.getCurrentMp = getCurrentMp;
window.setMp = setMp;
window.addMp = addMp;
window.subtractMp = subtractMp;
window.displayMp = displayMp;

// Автоматически обновляем UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => displayMp());