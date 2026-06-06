// moon.js – отдельная валюта для секретного меню
const MOON_STORAGE_KEY = 'moon_points';

async function getCurrentMoons() {
    const moons = localStorage.getItem(MOON_STORAGE_KEY);
    return moons ? parseInt(moons, 10) : 100; // начальный бонус 100 лун
}

async function setMoons(value) {
    localStorage.setItem(MOON_STORAGE_KEY, value);
    const moonSpans = document.querySelectorAll('#moonValue');
    moonSpans.forEach(span => span.textContent = value);
}

async function addMoons(amount) {
    const current = await getCurrentMoons();
    await setMoons(current + amount);
}

async function subtractMoons(amount) {
    const current = await getCurrentMoons();
    await setMoons(Math.max(0, current - amount));
}

async function displayMoons() {
    const moons = await getCurrentMoons();
    const moonSpans = document.querySelectorAll('#moonValue');
    moonSpans.forEach(span => span.textContent = moons);
}

window.getCurrentMoons = getCurrentMoons;
window.setMoons = setMoons;
window.addMoons = addMoons;
window.subtractMoons = subtractMoons;
window.displayMoons = displayMoons;

document.addEventListener('DOMContentLoaded', () => {
    displayMoons();
});