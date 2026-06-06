// common.js – общие функции (теперь не требуют регистрации)
window.currentUser = null;

async function checkAuth() {
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    if (error) console.error('Ошибка checkAuth:', error);
    window.currentUser = user || null;
    return window.currentUser;
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    // После выхода создаём новую анонимную сессию
    await window.supabaseClient.auth.signInAnonymously();
    await checkAuth();
    if (typeof displayXP === 'function') displayXP();
    window.location.reload(); // или обновить интерфейс
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});