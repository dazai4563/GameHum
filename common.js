// common.js
window.currentUser = null;

async function checkAuth() {
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    window.currentUser = error ? null : user;
    
    // Обновляем отображение имени пользователя
    const userSpan = document.getElementById('currentUser');
    if (userSpan) {
        if (window.currentUser) {
            const username = window.currentUser.user_metadata?.username || 
                             window.currentUser.email?.split('@')[0] || 'Игрок';
            userSpan.textContent = `👤 ${username}`;
        } else {
            userSpan.textContent = '👤 Гость';
        }
    }
    return window.currentUser;
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.currentUser = null;
    await checkAuth(); // обновим интерфейс
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});