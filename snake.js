// snake.js – упрощённая змейка для проверки
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
let gameInterval = null;

function getRandomFreeCell() {
    const freeCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!snake.some(s => s.x === i && s.y === j)) {
                freeCells.push({x: i, y: j});
            }
        }
    }
    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function updateGame() {
    if (gameOver) return;
    direction = nextDirection;
    const newHead = {...snake[0]};
    switch (direction) {
        case 'RIGHT': newHead.x++; break;
        case 'LEFT': newHead.x--; break;
        case 'UP': newHead.y--; break;
        case 'DOWN': newHead.y++; break;
    }
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        gameOver = true;
        clearInterval(gameInterval);
        alert('Game Over');
        if (window.currentUser && score > 0 && typeof saveScoreToLeaderboard === 'function') {
            saveScoreToLeaderboard(score);
        }
        drawGame();
        return;
    }
    const ate = (newHead.x === food.x && newHead.y === food.y);
    snake.unshift(newHead);
    if (!ate) snake.pop();
    else {
        score++;
        scoreSpan.textContent = score;
        const newFood = getRandomFreeCell();
        if (!newFood) {
            gameOver = true;
            clearInterval(gameInterval);
            alert('You win!');
            if (window.currentUser && typeof saveScoreToLeaderboard === 'function') {
                saveScoreToLeaderboard(score);
            }
            drawGame();
            return;
        }
        food = newFood;
    }
    if (snake.slice(1).some(s => s.x === snake[0].x && s.y === snake[0].y)) {
        gameOver = true;
        clearInterval(gameInterval);
        alert('Game Over');
        if (window.currentUser && score > 0 && typeof saveScoreToLeaderboard === 'function') {
            saveScoreToLeaderboard(score);
        }
        drawGame();
    }
    drawGame();
}

function drawGame() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize-1, cellSize-1);
    snake.forEach((s, idx) => {
        ctx.fillStyle = idx === 0 ? 'yellow' : 'lime';
        ctx.fillRect(s.x * cellSize, s.y * cellSize, cellSize-1, cellSize-1);
    });
    if (gameOver) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('GAME OVER', canvas.width/2-60, canvas.height/2);
    }
}

window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const key = e.key;
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
    const newFood = getRandomFreeCell();
    food = newFood || {x: 5, y: 5};
    drawGame();
    gameInterval = setInterval(() => {
        updateGame();
    }, 150);
}

restartBtn.addEventListener('click', startGame);
startGame();