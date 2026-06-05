// leaderboard.js (с JOIN)
const GAME_NAME = 'snake';

async function loadLeaderboard() {
    const supabase = window.supabaseClient;
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    try {
        // Делаем JOIN: game_scores -> users (по user_id)
        const { data, error } = await supabase
            .from('game_scores')
            .select(`
                score,
                users!inner ( username )
            `)
            .eq('game_name', GAME_NAME)
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = 'Нет рекордов';
            return;
        }

        let html = '<table><th>Игрок</th><th>Счёт</th></table>';
        data.forEach(entry => {
            const username = entry.users?.username || 'Аноним';
            html += `<tr><td>${escapeHtml(username)}</td><td>${entry.score}</td></tr>`;
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
    try {
        const { error } = await supabase
            .from('game_scores')
            .insert({
                user_id: window.currentUser.id,
                game_name: GAME_NAME,
                score: score
            });
        if (error) console.error('Ошибка сохранения:', error);
        else loadLeaderboard();
    } catch (err) { console.error(err); }
};

function escapeHtml(str) { /* как выше */ }

if (document.getElementById('leaderboardList')) loadLeaderboard();