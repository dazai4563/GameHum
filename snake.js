// snake.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');

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

function getRandomFreeCell() { /* ... как раньше ... */ }
function updateHighScore() { if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); highScoreSpan.textContent = highScore; } }

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
    // Стены
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        endGame();
        return;
    }
    const ateFood = (newHead.x === food.x && newHead.y === food.y);
    snake.unshift(newHead);
    if (!ateFood) snake.pop();
    else {
        score++;
        scoreSpan.textContent = score;
        updateHighScore();
        const newFood = getRandomFreeCell();
        if (!newFood) { endGame(true); return; }
        food = newFood;
    }
    if (snake.slice(1).some(s => s.x === snake[0].x && s.y === snake[0].y)) { endGame(); return; }
}

function endGame(isVictory = false) {
    gameOver = true;
    if (gameInterval) clearInterval(gameInterval);
    // Сохраняем рекорд в глобальную таблицу, если пользователь залогинен
    if (window.currentUser && score > 0) {
        saveScoreToLeaderboard(score);   // функция из leaderboard.js
    }
    alert(isVictory ? 'Победа! Вы заполнили поле!' : 'Игра окончена!');
    drawGame();
}

function drawGame() { /* ... рисование ... */ }
window.addEventListener('keydown', (e) => { /* ... управление, пауза ... */ });
function startGame() { /* ... сброс и запуск интервала ... */ }
restartBtn.addEventListener('click', startGame);
startGame();