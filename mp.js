const MP_STORAGE_KEY = 'mp_points';

async function getCurrentMp() {
    const mp = localStorage.getItem(MP_STORAGE_KEY);
    return mp ? parseInt(mp, 10) : 100;
}
async function setMp(value) { localStorage.setItem(MP_STORAGE_KEY, value); /* обновить UI */ }
window.getCurrentMp = getCurrentMp;
window.setMp = setMp;
// ...