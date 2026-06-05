// xp.js – управление очками опыта (локально для гостей, в БД для авторизованных)
const XP_STORAGE_KEY = 'guest_xp';

async function getCurrentXP() {
    if (window.currentUser) {
        // Зарегистрированный пользователь – загружаем из Supabase
        const supabase = window.supabaseClient;
        const { data, error } = await supabase
            .from('user_xp')
            .select('xp')
            .eq('user_id', window.currentUser.id)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Ошибка загрузки XP:', error);
            return 0;
        }
        return data?.xp ?? 0;
    } else {
        // Гость – читаем из localStorage
        const xp = localStorage.getItem(XP_STORAGE_KEY);
        return xp ? parseInt(xp, 10) : 0;
    }
}

async function setXP(newXP) {
    if (window.currentUser) {
        const supabase = window.supabaseClient;
        const { error } = await supabase
            .from('user_xp')
            .upsert({ user_id: window.currentUser.id, xp: newXP, updated_at: new Date() });
        if (error) console.error('Ошибка сохранения XP:', error);
    } else {
        localStorage.setItem(XP_STORAGE_KEY, newXP);
    }
    // Обновляем отображение на странице
    const xpSpan = document.getElementById('xpValue');
    if (xpSpan) xpSpan.textContent = newXP;
}

async function addXP(amount) {
    const current = await getCurrentXP();
    await setXP(current + amount);
}

async function subtractXP(amount) {
    const current = await getCurrentXP();
    await setXP(Math.max(0, current - amount)); // не ниже нуля
}

// Функция для отображения XP в интерфейсе (вызывать после загрузки DOM)
async function displayXP() {
    const xpSpan = document.getElementById('xpValue');
    if (xpSpan) {
        const xp = await getCurrentXP();
        xpSpan.textContent = xp;
    }
}

// Подключаем к общему событию загрузки
document.addEventListener('DOMContentLoaded', () => {
    displayXP();
});