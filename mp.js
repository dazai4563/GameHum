// mp.js – с автообновлением UI
const MP_STORAGE_KEY = 'mp_points';
let currentMpCache = null;

async function loadFromStorage() {
    const mp = localStorage.getItem(MP_STORAGE_KEY);
    currentMpCache = mp ? parseInt(mp) : 100;
    return currentMpCache;
}

async function getCurrentMp() {
    if (currentMpCache === null) await loadFromStorage();
    return currentMpCache;
}

async function setMp(value) {
    currentMpCache = value;
    localStorage.setItem(MP_STORAGE_KEY, value);
    // Обновляем все элементы на странице
    document.querySelectorAll('#mpValue').forEach(el => el.textContent = value);
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

document.addEventListener('DOMContentLoaded', () => displayMp());