// common.js – управление анонимной сессией
window.currentUser = null;

async function initAnonymousSession() {
    const supabase = window.supabaseClient;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error('Ошибка анонимного входа:', error);
            return null;
        }
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser && !newUser.user_metadata?.username) {
            const randomName = 'Guest_' + Math.floor(Math.random() * 10000);
            await supabase.auth.updateUser({ data: { username: randomName } });
        }
        return newUser;
    }
    return user;
}

async function checkAuth() {
    try {
        const supabase = window.supabaseClient;
        let { data: { user }, error } = await supabase.auth.getUser();
        if (error && error.message.includes('Auth session missing')) {
            user = await initAnonymousSession();
        } else if (error) {
            console.error('Ошибка checkAuth:', error);
        }
        window.currentUser = user || null;
        return window.currentUser;
    } catch (err) {
        console.error('Исключение в checkAuth:', err);
        window.currentUser = null;
        return null;
    }
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    await initAnonymousSession(); // создаём новую анонимную сессию
    await checkAuth();
    if (typeof displayXP === 'function') displayXP();
    window.location.reload();
}

// common.js – добавить в конец файла

// Смена имени пользователя (для анонимных и залогиненных)
async function changeUsername(newName) {
    if (!window.currentUser) {
        throw new Error('Пользователь не авторизован');
    }
    if (!newName || newName.trim() === '') {
        throw new Error('Имя не может быть пустым');
    }
    const supabase = window.supabaseClient;
    // 1. Обновляем метаданные в auth.users
    const { error: updateError } = await supabase.auth.updateUser({
        data: { username: newName.trim() }
    });
    if (updateError) throw updateError;

    // 2. Обновляем (или создаём) запись в таблице users (если она существует)
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({ id: window.currentUser.id, username: newName.trim() });
    if (upsertError) console.warn('Не удалось обновить таблицу users:', upsertError);

    // 3. Обновляем глобальную переменную и интерфейс
    window.currentUser.user_metadata.username = newName.trim();
    const userSpan = document.getElementById('currentUser');
    if (userSpan) userSpan.textContent = `👤 ${newName.trim()}`;
    
    // 4. Опционально: обновить уже сохранённые рекорды в game_scores? 
    //    Это сложно и не обязательно, будущие рекорды будут с новым именем.
    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    // Обновляем имя пользователя в интерфейсе
    const userSpan = document.getElementById('currentUser');
    if (userSpan && window.currentUser) {
        const username = window.currentUser.user_metadata?.username ||
                         (window.currentUser.email ? window.currentUser.email.split('@')[0] : 'Аноним');
        userSpan.textContent = `👤 ${username}`;
    }
});