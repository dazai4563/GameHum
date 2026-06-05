// leaderboard.js – универсальная таблица лидеров
// Перед подключением этого скрипта определите window.GAME_NAME (или const GAME_NAME)

async function loadLeaderboard() {
    const supabase = window.supabaseClient;
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    const game = window.GAME_NAME || 'snake'; // по умолчанию змейка

    try {
        const { data, error } = await supabase
            .from('game_scores')
            .select('username, score')
            .eq('game_name', game)
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = 'Нет рекордов. Станьте первым!';
            return;
        }

        let html = '<table><th>Игрок</th><th>Счёт</th></tr>';
        data.forEach(entry => {
            html += `<tr><td>${escapeHtml(entry.username)}</td><td>${entry.score}</td><tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Ошибка загрузки рекордов:', err);
        container.innerHTML = 'Ошибка загрузки';
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
    const game = window.GAME_NAME || 'snake';
    try {
        const { error } = await supabase
            .from('game_scores')
            .insert({
                user_id: window.currentUser.id,
                username: username,
                game_name: game,
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

if (document.getElementById('leaderboardList')) {
    loadLeaderboard();
}