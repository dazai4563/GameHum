// leaderboard.js
const GAME_NAME = 'snake'; // для змейки

async function loadLeaderboard() {
    const supabase = window.supabaseClient;
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('game_scores')
            .select('username, score')
            .eq('game_name', GAME_NAME)
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = 'Нет рекордов. Станьте первым!';
            return;
        }

        let html = '<table><th>Игрок</th><th>Счёт</th></tr>';
        data.forEach(entry => {
            html += `<tr><td>${escapeHtml(entry.username)}</td><td>${entry.score}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Ошибка загрузки рекордов:', err);
        container.innerHTML = 'Ошибка загрузки таблицы';
    }
}

window.saveScoreToLeaderboard = async function(score) {
    if (!window.currentUser) {
        console.log('Пользователь не авторизован, рекорд не сохранён');
        return;
    }
    const supabase = window.supabaseClient;
    const username = window.currentUser.user_metadata?.username || 
                     window.currentUser.email?.split('@')[0] || 'Аноним';
    try {
        const { error } = await supabase
            .from('game_scores')
            .insert({
                user_id: window.currentUser.id,
                username: username,
                game_name: GAME_NAME,
                score: score
            });
        if (error) {
            console.error('Ошибка сохранения:', error);
        } else {
            console.log('Рекорд сохранён');
            loadLeaderboard();
        }
    } catch (err) { console.error(err); }
};

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