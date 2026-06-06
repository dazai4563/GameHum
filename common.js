// common.js – управление анонимной сессией
window.currentUser = null;

async function initAnonymousSession() {
    const supabase = window.supabaseClient;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error('Ошибка анонимного входа:', error);
            return null;
        }
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser && !newUser.user_metadata?.username) {
            const randomName = 'Guest_' + Math.floor(Math.random() * 10000);
            await supabase.auth.updateUser({ data: { username: randomName } });
        }
        return newUser;
    }
    return user;
}

async function checkAuth() {
    try {
        const supabase = window.supabaseClient;
        let { data: { user }, error } = await supabase.auth.getUser();
        if (error && error.message.includes('Auth session missing')) {
            user = await initAnonymousSession();
        } else if (error) {
            console.error('Ошибка checkAuth:', error);
        }
        window.currentUser = user || null;
        return window.currentUser;
    } catch (err) {
        console.error('Исключение в checkAuth:', err);
        window.currentUser = null;
        return null;
    }
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    await initAnonymousSession(); // создаём новую анонимную сессию
    await checkAuth();
    if (typeof displayXP === 'function') displayXP();
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    // Обновляем имя пользователя в интерфейсе
    const userSpan = document.getElementById('currentUser');
    if (userSpan && window.currentUser) {
        const username = window.currentUser.user_metadata?.username ||
                         (window.currentUser.email ? window.currentUser.email.split('@')[0] : 'Аноним');
        userSpan.textContent = `👤 ${username}`;
    }
});