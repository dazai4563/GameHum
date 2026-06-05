// auth.js – использует домен snakegame.com
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('message');

    if (!usernameInput || !passwordInput || !loginBtn || !registerBtn) {
        console.error('Элементы формы не найдены');
        return;
    }

    // Регистрация
    registerBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        messageDiv.textContent = '';
        if (!username) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Введите игровое имя';
            return;
        }
        if (password.length < 6) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Пароль должен быть не менее 6 символов';
            return;
        }

        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.com`; // ← изменено с .local на .com

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Регистрация...';

        try {
            const { error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { username: username }
                }
            });

            if (error) throw error;

            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Регистрация успешна! Теперь войдите.';
            usernameInput.value = '';
            passwordInput.value = '';
        } catch (err) {
            console.error(err);
            messageDiv.style.color = 'red';
            if (err.message.includes('already registered')) {
                messageDiv.textContent = 'Это имя уже занято, выберите другое.';
            } else {
                messageDiv.textContent = `Ошибка: ${err.message}`;
            }
        }
    });

    // Вход
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Заполните имя и пароль';
            return;
        }

        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.com`; // ← тоже изменено

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Вход...';

        try {
            const { error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Вход выполнен! Перенаправление...';
            setTimeout(() => {
                window.location.href = 'game.html';
            }, 1000);
        } catch (err) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Неверное имя или пароль';
        }
    });
});