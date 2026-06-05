// leaderboard.js - работа с таблицей лидеров через Supabase
// Не ломает игру, даже если подключение не удалось

document.addEventListener('DOMContentLoaded', async () => {
    let supabase = null;
    let initialized = false;

    function initSupabase() {
        if (initialized) return supabase;
        if (typeof window.supabase === 'undefined') {
            console.warn('Библиотека Supabase не загружена');
            return null;
        }
        if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_PUBLISHABLE_KEY === 'undefined') {
            console.error('Не заданы SUPABASE_URL или SUPABASE_PUBLISHABLE_KEY в config.js');
            return null;
        }
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        initialized = true;
        return supabase;
    }

    const leaderboardDiv = document.getElementById('leaderboardList');
    if (!leaderboardDiv) {
        console.error('Элемент leaderboardList не найден в HTML');
        return;
    }

    async function loadLeaderboard() {
        const client = initSupabase();
        if (!client) {
            leaderboardDiv.innerHTML = 'Таблица лидеров недоступна';
            return;
        }

        try {
            const { data, error } = await client
                .from('snake_scores')
                .select('username, score')
                .order('score', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Ошибка загрузки рекордов:', error);
                leaderboardDiv.innerHTML = 'Ошибка загрузки';
                return;
            }

            if (!data || data.length === 0) {
                leaderboardDiv.innerHTML = 'Пока нет рекордов. Станьте первым!';
                return;
            }

            let html = '<table><th>Игрок</th><th>Счёт</th><tr>';
            data.forEach(entry => {
                html += `<tr><td>${escapeHtml(entry.username || 'Аноним')}</td><td>${entry.score}</td></tr>`;
            });
            html += '</table>';
            leaderboardDiv.innerHTML = html;
        } catch (err) {
            console.error('Исключение при загрузке:', err);
            leaderboardDiv.innerHTML = 'Ошибка соединения';
        }
    }

    window.saveScoreToLeaderboard = async function(finalScore) {
        const client = initSupabase();
        if (!client) return;

        let playerName = localStorage.getItem('snakePlayerName');
        if (!playerName) {
            playerName = prompt(`Игра окончена! Ваш счёт: ${finalScore}\nВведите ваше имя для таблицы лидеров:`, 'Аноним');
            if (!playerName) playerName = 'Аноним';
            localStorage.setItem('snakePlayerName', playerName);
        }

        try {
            const { error } = await client
                .from('snake_scores')
                .insert([{ username: playerName, score: finalScore }]);

            if (error) {
                console.error('Ошибка сохранения рекорда:', error);
            } else {
                console.log('Рекорд сохранён в Supabase!');
                await loadLeaderboard();
            }
        } catch (err) {
            console.error('Исключение при сохранении:', err);
        }
    };

    await loadLeaderboard();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}