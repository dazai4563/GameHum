// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || 'index.html';

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('message');

    const supabase = window.supabaseClient;

    async function handleAuth( type, username, password ) {
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const email = `${safeUsername}@snakegame.com`;

        if (type === 'register') {
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { username } }
            });
            if (error) throw error;
            return 'registered';
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return 'logged_in';
        }
    }

    registerBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (!username || password.length < 6) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Заполните имя и пароль (≥6 символов)';
            return;
        }
        messageDiv.textContent = 'Регистрация...';
        try {
            await handleAuth('register', username, password);
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Регистрация успешна! Теперь войдите.';
        } catch (err) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = err.message.includes('already registered') ? 'Имя уже занято' : err.message;
        }
    });

    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (!username || !password) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Заполните все поля';
            return;
        }
        messageDiv.textContent = 'Вход...';
        try {
            await handleAuth('login', username, password);
            window.location.href = redirectTo;
        } catch (err) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Неверное имя или пароль';
        }
    });
});