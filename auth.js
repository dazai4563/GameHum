// auth.js – анонимная аутентификация и привязка email/пароля
document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient;

    // Обновление интерфейса (имя пользователя, XP)
    async function updateUI() {
        const { data: { user } } = await supabase.auth.getUser();
        window.currentUser = user;
        const userSpan = document.getElementById('currentUser');
        if (userSpan) {
            if (user) {
                const username = user.user_metadata?.username || 
                                 (user.email ? user.email.split('@')[0] : 'Аноним');
                userSpan.textContent = `👤 ${username}`;
            } else {
                userSpan.textContent = '👤 Гость (аноним)';
            }
        }
        if (typeof displayXP === 'function') displayXP();
    }

    // Создание анонимной сессии, если нет активной
    async function ensureAnonymousSession() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const { error } = await supabase.auth.signInAnonymously();
            if (error) {
                console.error('Ошибка анонимного входа:', error);
            } else {
                // Устанавливаем случайное имя для анонима, если ещё нет
                const { data: { user: newUser } } = await supabase.auth.getUser();
                if (newUser && !newUser.user_metadata?.username) {
                    const randomName = 'Guest_' + Math.floor(Math.random() * 10000);
                    await supabase.auth.updateUser({ data: { username: randomName } });
                }
                await updateUI();
            }
        }
    }

    // Привязка анонимного аккаунта к email/паролю
    async function linkAccount(email, password, username) {
        const { error: updateError } = await supabase.auth.updateUser({
            email: email,
            password: password,
            data: { username: username }
        });
        if (updateError) throw updateError;
        // Создаём/обновляем профиль в таблице users (для leaderboard)
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({ id: window.currentUser.id, username: username });
        if (upsertError) console.warn('Не удалось обновить профиль:', upsertError);
        await updateUI();
    }

    // Обработчики кнопок (если есть на странице)
    const linkBtn = document.getElementById('linkAccountBtn');
    if (linkBtn) {
        linkBtn.addEventListener('click', async () => {
            const email = document.getElementById('linkEmail').value;
            const password = document.getElementById('linkPassword').value;
            const username = document.getElementById('linkUsername').value;
            const messageDiv = document.getElementById('linkMessage');
            try {
                await linkAccount(email, password, username);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Аккаунт привязан! Теперь вы можете войти на другом устройстве.';
                setTimeout(() => {
                    document.getElementById('linkModal').style.display = 'none';
                }, 2000);
            } catch (err) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = err.message;
            }
        });
    }

    await ensureAnonymousSession();
    await updateUI();
});