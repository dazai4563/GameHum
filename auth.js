// auth.js
document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const supabase = window.supabaseClient;

    if (!username || !password) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Заполните имя и пароль';
        return;
    }
    if (password.length < 6) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Пароль должен быть не менее 6 символов';
        return;
    }
    // Генерируем email из username (латиница + цифры, безопасно)
    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const email = `${safeUsername}@snakegame.local`;

    try {
        // Регистрируем пользователя в Supabase с сгенерированным email
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // После успешной регистрации сохраняем username в отдельной таблице или в метаданных
        const { error: updateError } = await supabase.auth.updateUser({
            data: { username: username }
        });
        if (updateError) console.warn('Не удалось сохранить username:', updateError);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Регистрация успешна! Теперь войдите.';
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Ошибка: ${error.message}`;
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const supabase = window.supabaseClient;

    if (!username || !password) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Заполните имя и пароль';
        return;
    }
    // Для входа преобразуем username в email
    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const email = `${safeUsername}@snakegame.local`;

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Вход выполнен! Перенаправление...';
        setTimeout(() => { window.location.href = 'game.html'; }, 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Ошибка: ${error.message}`;
    }
});