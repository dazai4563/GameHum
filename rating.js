// rating.js – загрузка таблицы рекордов для выбранной игры
const gameSelect = document.getElementById('gameSelect');
const refreshBtn = document.getElementById('refreshBtn');
const gameTitle = document.getElementById('gameTitle');
const leaderboardDiv = document.getElementById('leaderboardList');

const gameNames = {
    snake: '🐍 Змейка',
    rps: '✊ Камень, ножницы, бумага',
    blackjack: '🃏 Блэкджек',
    minesweeper: '💣 Сапёр'
};

async function loadLeaderboard(gameName) {
    leaderboardDiv.innerHTML = 'Загрузка...';
    try {
        const { data, error } = await window.supabaseClient
            .from('game_scores')
            .select('username, score')
            .eq('game_name', gameName)
            .order('score', { ascending: false })
            .limit(10);
        if (error) throw error;

        if (!data || data.length === 0) {
            leaderboardDiv.innerHTML = 'Нет рекордов. Станьте первым!';
            return;
        }

        let html = '<table><thead><tr><th>Игрок</th><th>Счёт</th></tr></thead><tbody>';
        data.forEach(entry => {
            const name = entry.username || 'Аноним';
            html += `<tr><td>${escapeHtml(name)}</td><td>${entry.score}</td></tr>`;
        });
        html += '</tbody></table>';
        leaderboardDiv.innerHTML = html;
    } catch (err) {
        console.error(err);
        leaderboardDiv.innerHTML = 'Ошибка загрузки рекордов';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function updateGame() {
    const game = gameSelect.value;
    gameTitle.textContent = gameNames[game] || game;
    loadLeaderboard(game);
}

refreshBtn.addEventListener('click', updateGame);
gameSelect.addEventListener('change', updateGame);

document.addEventListener('DOMContentLoaded', () => {
    updateGame();
});