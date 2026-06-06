// leaderboard.js – универсальная таблица лидеров (имя игры берётся из window.GAME_NAME)
const GAME_NAME = window.GAME_NAME || 'snake';

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
            const name = entry.username || 'Аноним';
            html += `<tr><td>${escapeHtml(name)}</td><td>${entry.score}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Ошибка загрузки рекордов:', err);
        container.innerHTML = 'Ошибка загрузки';
    }
}

window.saveScoreToLeaderboard = async function(score) {
    if (!window.currentUser) return;
    const supabase = window.supabaseClient;
    let username = window.currentUser.user_metadata?.username;
    if (!username) {
        username = window.currentUser.email ? window.currentUser.email.split('@')[0] : 'Аноним';
    }
    try {
        const { error } = await supabase
            .from('game_scores')
            .insert({
                user_id: window.currentUser.id,
                username: username,
                game_name: GAME_NAME,
                score: score
            });
        if (error) console.error('Ошибка сохранения:', error);
        else loadLeaderboard();
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

if (document.getElementById('leaderboardList')) {
    loadLeaderboard();
}