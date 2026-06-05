// auth.js – регистрация и вход по игровому имени (username)

// Получаем глобальный клиент Supabase из config.js
const supabase = window.supabaseClient;

// Дожидаемся загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('message');

    if (!usernameInput || !passwordInput || !loginBtn || !registerBtn) {
        console.error('Один из элементов формы не найден! Проверьте id в index.html');
        return;
    }

    // ---- Регистрация ----
    registerBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Сброс сообщения
        messageDiv.style.color = 'black';
        messageDiv.textContent = '';

        // Валидация
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

        // Генерируем email из username (латиница, цифры, дефис, подчёркивание)
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.local`;

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Регистрация...';

        try {
            // Регистрируем пользователя, передавая username в метаданные
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username   // ← ключ ДОЛЖЕН быть 'username'
                    }
                }
            });

            if (error) throw error;

            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Регистрация успешна! Теперь войдите.';
            // Очищаем поля
            usernameInput.value = '';
            passwordInput.value = '';
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            messageDiv.style.color = 'red';
            // Обработка конфликта имён (если email уже существует)
            if (err.message.includes('already registered')) {
                messageDiv.textContent = 'Это имя уже занято, выберите другое.';
            } else {
                messageDiv.textContent = `Ошибка: ${err.message}`;
            }
        }
    });

    // ---- Вход ----
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        messageDiv.style.color = 'black';
        messageDiv.textContent = '';

        if (!username || !password) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Заполните имя и пароль';
            return;
        }

        // Генерируем email так же, как при регистрации
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.local`;

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Вход...';

        try {
            const { error } = await supabase.auth.signInWithPassword({
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
            console.error('Ошибка входа:', err);
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Неверное имя или пароль';
        }
    });
});