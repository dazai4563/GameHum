// game.js - полная игра + авторизация + сохранение рекордов
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');
const logoutBtn = document.getElementById('logoutBtn');

const gridSize = 20;
const cellSize = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = {x: 15, y: 10};
let score = 0;
let gameOver = false;
let paused = false;
let gameInterval = null;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreSpan.textContent = highScore;

// ========== РАБОТА С SUPABASE И АВТОРИЗАЦИЯ ==========
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;

// Проверяем, авторизован ли пользователь
(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        // Нет пользователя - перенаправляем на страницу входа
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    console.log('Игрок:', currentUser.email);
})();

// Функция сохранения рекорда в Supabase
async function saveScoreToSupabase(scoreToSave) {
    if (!currentUser) return;
    try {
        const { error } = await supabase
            .from('game_scores')
            .insert({ user_id: currentUser.id, score: scoreToSave });
        if (error) {
            console.error('Ошибка сохранения рекорда:', error);
        } else {
            console.log('Рекорд сохранён в Supabase');
            // Обновляем таблицу лидеров, если функция существует
            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            }
        }
    } catch (err) {
        console.error('Исключение при сохранении:', err);
    }
}

// ========== ИГРОВАЯ ЛОГИКА ==========
function getRandomFreeCell() {
    const freeCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!snake.some(segment => segment.x === i && segment.y === j)) {
                freeCells.push({x: i, y: j});
            }
        }
    }
    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreSpan.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function updateGame() {
    if (gameOver || paused) return;

    direction = nextDirection;
    const newHead = {...snake[0]};

    switch (direction) {
        case 'RIGHT': newHead.x++; break;
        case 'LEFT': newHead.x--; break;
        case 'UP': newHead.y--; break;
        case 'DOWN': newHead.y++; break;
    }

    // Столкновение со стеной
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        gameOver = true;
        clearInterval(gameInterval);
        saveScoreToSupabase(score);   // СОХРАНЕНИЕ РЕКОРДА
        alert('Игра окончена!');
        drawGame();
        return;
    }

    const ateFood = (newHead.x === food.x && newHead.y === food.y);
    snake.unshift(newHead);
    if (!ateFood) {
        snake.pop();
    } else {
        score++;
        scoreSpan.textContent = score;
        updateHighScore();
        const newFood = getRandomFreeCell();
        if (!newFood) {
            gameOver = true;
            clearInterval(gameInterval);
            saveScoreToSupabase(score);   // СОХРАНЕНИЕ РЕКОРДА (победа)
            alert('Поздравляем! Вы заполнили всё поле! Победа!');
            drawGame();
            return;
        }
        food = newFood;
    }

    // Самопересечение
    const head = snake[0];
    if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        clearInterval(gameInterval);
        saveScoreToSupabase(score);   // СОХРАНЕНИЕ РЕКОРДА
        alert('Игра окончена!');
        drawGame();
    }
}

function drawGame() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#444';
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);
    snake.forEach((segment, idx) => {
        ctx.fillStyle = idx === 0 ? 'yellow' : 'lime';
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 1, cellSize - 1);
    });
    if (gameOver) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('GAME OVER', canvas.width / 2 - 80, canvas.height / 2);
    }
    if (paused && !gameOver) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('ПАУЗА', canvas.width / 2 - 50, canvas.height / 2);
    }
}

window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const key = e.key;
    if (key === ' ' || key === 'Space') {
        e.preventDefault();
        paused = !paused;
        drawGame();
        return;
    }
    if (key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
    if (key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
    if (key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
    e.preventDefault();
});

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    snake = [{x: 10, y: 10}];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    scoreSpan.textContent = '0';
    gameOver = false;
    paused = false;
    const newFood = getRandomFreeCell();
    food = newFood || {x: 5, y: 5};
    drawGame();
    gameInterval = setInterval(() => {
        updateGame();
        drawGame();
    }, 150);
}

restartBtn.addEventListener('click', startGame);

// Кнопка выхода
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

startGame();