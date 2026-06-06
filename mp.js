// mp.js – синхронизация валюты Mp с Supabase и локальным хранилищем
const MP_STORAGE_KEY = 'mp_balance_local';
let currentMp = null;
let synced = false;

async function getCurrentMp() {
    if (currentMp !== null) return currentMp;
    // Если пользователь залогинен
    if (window.currentUser) {
        const supabase = window.supabaseClient;
        if (!supabase) return 100;
        const { data, error } = await supabase
            .from('mp_balances')
            .select('balance')
            .eq('user_id', window.currentUser.id)
            .maybeSingle();
        if (error) {
            console.error('Ошибка загрузки Mp из Supabase:', error);
            // fallback на локальное
            const local = localStorage.getItem(MP_STORAGE_KEY);
            currentMp = local ? parseInt(local) : 100;
        } else {
            currentMp = data?.balance ?? 100;
        }
        // Синхронизируем локальное значение (если есть) при первом входе
        const local = localStorage.getItem(MP_STORAGE_KEY);
        if (local && parseInt(local) !== currentMp) {
            await setMp(currentMp); // вызовет upsert и удалит локальное
        }
    } else {
        const local = localStorage.getItem(MP_STORAGE_KEY);
        currentMp = local ? parseInt(local) : 100;
    }
    return currentMp;
}

async function setMp(value) {
    if (value < 0) value = 0;
    currentMp = value;
    // Обновляем отображение
    const mpSpans = document.querySelectorAll('#mpValue');
    mpSpans.forEach(span => span.textContent = value);
    if (window.currentUser) {
        const supabase = window.supabaseClient;
        if (supabase) {
            const { error } = await supabase
                .from('mp_balances')
                .upsert({ user_id: window.currentUser.id, balance: value, updated_at: new Date() });
            if (error) {
                console.error('Ошибка сохранения Mp в Supabase:', error);
                // fallback на localStorage
                localStorage.setItem(MP_STORAGE_KEY, value);
            } else {
                // удаляем локальную копию, так как теперь данные в облаке
                localStorage.removeItem(MP_STORAGE_KEY);
            }
        } else {
            localStorage.setItem(MP_STORAGE_KEY, value);
        }
    } else {
        localStorage.setItem(MP_STORAGE_KEY, value);
    }
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
    const mp = await getCurrentMp();
    const mpSpans = document.querySelectorAll('#mpValue');
    mpSpans.forEach(span => span.textContent = mp);
}

// Экспорт в глобальную область
window.getCurrentMp = getCurrentMp;
window.setMp = setMp;
window.addMp = addMp;
window.subtractMp = subtractMp;
window.displayMp = displayMp;

document.addEventListener('DOMContentLoaded', () => {
    displayMp();
});