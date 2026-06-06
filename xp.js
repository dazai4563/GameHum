// xp.js – управление опытом (гость / авторизованный)
const XP_STORAGE_KEY = 'guest_xp';

async function getCurrentXP() {
    if (window.currentUser) {
        const supabase = window.supabaseClient;
        // Используем maybeSingle() вместо single() – не выдаёт ошибку 406 при отсутствии записи
        const { data, error } = await supabase
            .from('user_xp')
            .select('xp')
            .eq('user_id', window.currentUser.id)
            .maybeSingle();
        if (error) {
            console.error('Ошибка загрузки XP:', error);
            return 0;
        }
        return data?.xp ?? 0;
    } else {
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
    await setXP(Math.max(0, current - amount));
}

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