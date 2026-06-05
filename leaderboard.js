// leaderboard.js
async function loadLeaderboard() {
    const supabase = window.supabaseClient;   // <-- используем глобальный клиент
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    try {
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

if (document.getElementById('leaderboardList')) {
    loadLeaderboard();
}