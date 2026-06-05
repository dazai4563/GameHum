// leaderboard.js
const GAME_NAME = 'snake';  // для змейки

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
            container.innerHTML = 'Нет рекордов';
            return;
        }
        let html = '<table><th>Игрок</th><th>Счёт</th></table>';
        data.forEach(row => {
            html += `<tr><td>${escapeHtml(row.username)}</td><td>${row.score}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = 'Ошибка загрузки';
    }
}

window.saveScoreToLeaderboard = async function(score) {
    if (!window.currentUser) return;
    const supabase = window.supabaseClient;
    const username = window.currentUser.user_metadata?.username || 'Аноним';
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

function escapeHtml(str) { /* ... */ }
if (document.getElementById('leaderboardList')) loadLeaderboard();