// auth.js - используется только на странице index.html
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    if (!email || !password) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Заполните email и пароль';
        return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Вход выполнен! Перенаправление...';
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Ошибка: ${error.message}`;
    }
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    if (!email || !password) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Заполните email и пароль';
        return;
    }
    if (password.length < 6) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Пароль должен быть не менее 6 символов';
        return;
    }

    try {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Регистрация успешна! Теперь войдите.';
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Ошибка: ${error.message}`;
    }
});