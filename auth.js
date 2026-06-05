// auth.js – страница входа и регистрации (login.html)

document.addEventListener('DOMContentLoaded', () => {
    // Получаем параметр redirect из URL (например, ?redirect=snake.html)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || 'index.html';

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('message');

    if (!usernameInput || !passwordInput || !loginBtn || !registerBtn) {
        console.error('Ошибка: не найдены поля формы. Проверьте id в login.html');
        return;
    }

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase клиент не инициализирован. Проверьте config.js');
        return;
    }

    // === Вспомогательная функция: перенос гостевого XP в профиль ===
    async function transferGuestXP(userId) {
        const guestXP = localStorage.getItem('guest_xp');
        if (guestXP !== null && !isNaN(parseInt(guestXP))) {
            const xpValue = parseInt(guestXP);
            try {
                const { error } = await supabase
                    .from('user_xp')
                    .upsert({ user_id: userId, xp: xpValue }, { onConflict: 'user_id' });
                if (error) {
                    console.warn('Не удалось перенести XP:', error);
                } else {
                    console.log(`XP перенесены: ${xpValue}`);
                    localStorage.removeItem('guest_xp');
                }
            } catch (err) {
                console.error('Ошибка при переносе XP:', err);
            }
        }
    }

    // === Регистрация ===
    registerBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        messageDiv.style.color = 'black';
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

        // Генерируем безопасный email из имени
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.com`;

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Регистрация...';

        try {
            const { data, error } = await supabase.auth.signUp({
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

    // === Вход ===
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

        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.com`;

        messageDiv.style.color = 'blue';
        messageDiv.textContent = 'Вход...';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Переносим гостевой XP в профиль, если есть
            if (data.user) {
                await transferGuestXP(data.user.id);
            }

            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Вход выполнен! Перенаправление...';
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
        } catch (err) {
            console.error(err);
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Неверное имя или пароль';
        }
    });
});