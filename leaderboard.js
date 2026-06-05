// leaderboard.js - загружает топ-10 рекордов из таблицы game_scores
async function loadLeaderboard() {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    try {
        // Делаем запрос с JOIN на auth.users, чтобы получить email
        const { data, error } = await supabase
            .from('game_scores')
            .select(`
                score,
                users:user_id (email)
            `)
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Ошибка загрузки рекордов:', error);
            container.innerHTML = 'Не удалось загрузить рекорды';
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = 'Пока нет рекордов. Будьте первым!';
            return;
        }

        let html = '<table><th>Игрок</th><th>Счёт</th></tr>';
        data.forEach(entry => {
            // В данных users может быть массив, берем первый элемент
            const email = entry.users && entry.users.email ? entry.users.email : 'Аноним';
            html += `<tr><td>${escapeHtml(email)}</td><td>${entry.score}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Исключение при загрузке:', err);
        container.innerHTML = 'Ошибка соединения';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Загружаем таблицу при старте
if (document.getElementById('leaderboardList')) {
    loadLeaderboard();
}