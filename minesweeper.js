// minesweeper.js – классический сапёр 8x8, 10 мин

const boardSize = 8;
const mineCount = 10;
let board = [];
let minePositions = [];
let gameActive = true;
let firstMove = true;
let timer = 0;
let timerInterval = null;
let flagsPlaced = 0;

// DOM элементы
const boardDiv = document.getElementById('board');
const mineCountSpan = document.getElementById('mineCount');
const timerSpan = document.getElementById('timer');
const newGameBtn = document.getElementById('newGameBtn');
const gameStatusDiv = document.getElementById('gameStatus');

// Инициализация поля
function initBoard() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill().map(() => ({
        revealed: false,
        flagged: false,
        mine: false,
        neighborMines: 0
    })));
    minePositions = [];
    firstMove = true;
    if (timerInterval) clearInterval(timerInterval);
    timer = 0;
    timerSpan.textContent = '0';
    gameActive = true;
    flagsPlaced = 0;
    updateMineCountDisplay();
    gameStatusDiv.innerHTML = '';
    renderBoard();
}

// Размещение мин после первого клика
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if ((row === firstRow && col === firstCol)) continue;
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            minePositions.push([row, col]);
            minesPlaced++;
        }
    }
    // Вычисляем соседей
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].mine) continue;
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[nr][nc].mine) cnt++;
                }
            }
            board[r][c].neighborMines = cnt;
        }
    }
}

// Рекурсивное открытие пустых клеток
function revealCell(row, col) {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return;
    const cell = board[row][col];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    if (cell.neighborMines === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                revealCell(row + dr, col + dc);
            }
        }
    }
}

// Проверка победы
function checkWin() {
    let unrevealedSafe = 0;
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const cell = board[r][c];
            if (!cell.revealed && !cell.mine) unrevealedSafe++;
        }
    }
    if (unrevealedSafe === 0) {
        gameActive = false;
        if (timerInterval) clearInterval(timerInterval);
        gameStatusDiv.innerHTML = '<span style="color:green;">🎉 ПОБЕДА! +10 XP 🎉</span>';
        // Начисляем XP и сохраняем рекорд (время)
        if (typeof addXP === 'function') addXP(10);
        if (window.currentUser && typeof saveScoreToLeaderboard === 'function') {
            // Сохраняем время (чем меньше, тем лучше) – но таблица лидеров ожидает число, поэтому сохраняем время как "очки" (меньше – лучше). Для таблицы лучше записывать 100 - время (чем быстрее, тем больше очков). Или просто 1 за победу. Упростим: 1 очко за победу.
            saveScoreToLeaderboard(1);
        }
        if (typeof displayXP === 'function') displayXP();
        renderBoard();
        return true;
    }
    return false;
}

// Обработка поражения
function loseGame() {
    gameActive = false;
    if (timerInterval) clearInterval(timerInterval);
    gameStatusDiv.innerHTML = '<span style="color:red;">💥 ПОРАЖЕНИЕ! -5 XP 💥</span>';
    if (typeof subtractXP === 'function') subtractXP(5);
    if (typeof displayXP === 'function') displayXP();
    // Показать все мины
    for (let [r, c] of minePositions) {
        board[r][c].revealed = true;
    }
    renderBoard();
}

// Обработка клика левой кнопкой (открыть)
function handleLeftClick(row, col) {
    if (!gameActive) return;
    const cell = board[row][col];
    if (cell.flagged) return;
    if (firstMove) {
        firstMove = false;
        placeMines(row, col);
        // Запуск таймера
        timerInterval = setInterval(() => {
            if (gameActive) {
                timer++;
                timerSpan.textContent = timer;
            }
        }, 1000);
    }
    if (cell.mine) {
        loseGame();
    } else {
        revealCell(row, col);
        renderBoard();
        checkWin();
    }
}

// Обработка правой кнопкой (флаг)
function handleRightClick(row, col, e) {
    e.preventDefault();
    if (!gameActive) return;
    const cell = board[row][col];
    if (cell.revealed) return;
    if (!cell.flagged) {
        cell.flagged = true;
        flagsPlaced++;
    } else {
        cell.flagged = false;
        flagsPlaced--;
    }
    updateMineCountDisplay();
    renderBoard();
}

// Обновление счётчика мин
function updateMineCountDisplay() {
    const remaining = mineCount - flagsPlaced;
    mineCountSpan.textContent = remaining >= 0 ? remaining : 0;
}

// Отрисовка поля
function renderBoard() {
    boardDiv.innerHTML = '';
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const cell = board[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            if (cell.revealed) {
                cellDiv.classList.add('revealed');
                if (cell.mine) {
                    cellDiv.classList.add('mine');
                    cellDiv.textContent = '💣';
                } else if (cell.neighborMines > 0) {
                    cellDiv.textContent = cell.neighborMines;
                } else {
                    cellDiv.textContent = '';
                }
            } else if (cell.flagged) {
                cellDiv.classList.add('flagged');
                cellDiv.textContent = '';
            } else {
                cellDiv.textContent = '';
            }
            cellDiv.addEventListener('click', (function(row, col) { return function() { handleLeftClick(row, col); }; })(r, c));
            cellDiv.addEventListener('contextmenu', (function(row, col) { return function(e) { handleRightClick(row, col, e); }; })(r, c));
            boardDiv.appendChild(cellDiv);
        }
    }
}

// Новая игра
function newGame() {
    if (timerInterval) clearInterval(timerInterval);
    initBoard();
}

newGameBtn.addEventListener('click', newGame);
initBoard();