// game.js – полный код игры «Змейка»

// ----- Элементы DOM -----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// Добавим отображение лучшего счёта (создадим элемент, если его нет)
let highScoreSpan = document.getElementById('highScore');
if (!highScoreSpan) {
    const infoDiv = document.querySelector('.info');
    highScoreSpan = document.createElement('span');
    highScoreSpan.id = 'highScore';
    highScoreSpan.textContent = '0';
    infoDiv.appendChild(document.createTextNode(' | Рекорд: '));
    infoDiv.appendChild(highScoreSpan);
}

// ----- Параметры игры -----
const gridSize = 20;          // 20x20 клеток
const cellSize = canvas.width / gridSize; // 20px
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

// ----- Вспомогательные функции -----
// Случайная свободная клетка
function getRandomFreeCell() {
    const freeCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!snake.some(segment => segment.x === i && segment.y === j)) {
                freeCells.push({x: i, y: j});
            }
        }
    }
    if (freeCells.length === 0) return null; // победа (всё поле заполнено)
    const rand = Math.floor(Math.random() * freeCells.length);
    return freeCells[rand];
}

// Обновление рекорда
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreSpan.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// ----- Игровая логика -----
function updateGame() {
    if (gameOver || paused) return;

    direction = nextDirection;

    // Новая голова
    let newHead = {...snake[0]};
    switch (direction) {
        case 'RIGHT': newHead.x++; break;
        case 'LEFT':  newHead.x--; break;
        case 'UP':    newHead.y--; break;
        case 'DOWN':  newHead.y++; break;
        default: break;
    }

    // Проверка стен
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        gameOver = true;
        clearInterval(gameInterval);
        alert('Игра окончена! Нажмите "Новая игра"');
        drawGame(); // перерисуем с сообщением Game Over
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
        alert('Игра окончена! Нажмите "Новая игра"');
        drawGame();
    }
}

// ----- Отрисовка -----
function drawGame() {
    // Фон
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка (опционально)
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

    // Еда
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);

    // Змейка
    snake.forEach((segment, idx) => {
        if (idx === 0) {
            ctx.fillStyle = 'yellow'; // голова
        } else {
            ctx.fillStyle = 'lime';
        }
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 1, cellSize - 1);
        // Глазки на голове
        if (idx === 0) {
            ctx.fillStyle = 'black';
            const eyeSize = cellSize / 5;
            const offsetX = direction === 'RIGHT' ? cellSize * 0.7 : (direction === 'LEFT' ? cellSize * 0.3 : cellSize * 0.5);
            const offsetY = direction === 'DOWN' ? cellSize * 0.7 : (direction === 'UP' ? cellSize * 0.3 : cellSize * 0.5);
            ctx.fillRect(segment.x * cellSize + offsetX - eyeSize/2, segment.y * cellSize + offsetY - eyeSize/2, eyeSize, eyeSize);
            ctx.fillRect(segment.x * cellSize + (cellSize - offsetX) - eyeSize/2, segment.y * cellSize + offsetY - eyeSize/2, eyeSize, eyeSize);
        }
    });

    // Сообщения
    if (gameOver) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.fillText('GAME OVER', canvas.width/2 - 80, canvas.height/2);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText('Нажмите "Новая игра"', canvas.width/2 - 90, canvas.height/2 + 40);
    }
    if (paused && !gameOver) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('ПАУЗА', canvas.width/2 - 50, canvas.height/2);
    }
}

// ----- Управление -----
window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const key = e.key;
    // Пробел – пауза
    if (key === ' ' || key === 'Space') {
        e.preventDefault();
        paused = !paused;
        drawGame();
        return;
    }
    // Стрелки (исключаем противоположное направление)
    if (key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
    if (key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
    if (key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
    e.preventDefault();
});

// ----- Перезапуск игры -----
function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    // Сброс состояния
    snake = [{x: 10, y: 10}];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    scoreSpan.textContent = '0';
    gameOver = false;
    paused = false;
    // Генерируем еду не на змейке
    let newFood = getRandomFreeCell();
    if (!newFood) newFood = {x: 5, y: 5};
    food = newFood;
    drawGame();
    // Запускаем интервал
    gameInterval = setInterval(() => {
        updateGame();
        drawGame();
    }, 150);
}

restartBtn.addEventListener('click', () => {
    startGame();
});

// Старт!
startGame();