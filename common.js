// common.js – используется на всех страницах, где нужны данные о пользователе

// Текущий пользователь (глобальная переменная)
window.currentUser = null;

// Проверка сессии при загрузке страницы
async function checkAuth() {
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    if (error || !user) {
        window.currentUser = null;
    } else {
        window.currentUser = user;
    }
    // Если на странице есть элемент для отображения статуса, обновляем его
    const userSpan = document.getElementById('currentUser');
    if (userSpan) {
        if (window.currentUser) {
            const username = window.currentUser.user_metadata?.username || window.currentUser.email.split('@')[0];
            userSpan.textContent = `👤 ${username}`;
        } else {
            userSpan.textContent = '👤 Гость';
        }
    }
}

// Выход из системы
async function logout() {
    await window.supabaseClient.auth.signOut();
    window.currentUser = null;
    window.location.reload(); // или перенаправить на главную
}

// Добавляем обработчик для кнопки выхода, если она есть
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    checkAuth();
});