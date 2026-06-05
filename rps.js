// rps.js – логика игры "Камень, ножницы, бумага"
let playerScore = 0;
let computerScore = 0;
let gameActive = true; // игра активна, пока никто не набрал 3 очка

const playerScoreSpan = document.getElementById('playerScore');
const computerScoreSpan = document.getElementById('computerScore');
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('resetGameBtn');
const choiceBtns = document.querySelectorAll('.choice');

function updateScoresUI() {
    playerScoreSpan.textContent = playerScore;
    computerScoreSpan.textContent = computerScore;
}

function getComputerChoice() {
    const choices = ['rock', 'scissors', 'paper'];
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex];
}

function getWinner(player, computer) {
    if (player === computer) return 'draw';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'scissors' && computer === 'paper') ||
        (player === 'paper' && computer === 'rock')
    ) {
        return 'player';
    }
    return 'computer';
}

function getChoiceEmoji(choice) {
    switch(choice) {
        case 'rock': return '✊';
        case 'scissors': return '✌️';
        case 'paper': return '✋';
        default: return '';
    }
}

// rps.js – дополнения
async function endGame(winner) {
    gameActive = false;
    choiceBtns.forEach(btn => btn.disabled = true);
    if (winner === 'player') {
        resultDiv.innerHTML = '<span style="color:green;">🎉 Вы выиграли матч! +10 XP 🎉</span>';
        await addXP(10);   // из xp.js
        // (опционально) сохраняем рекорд (3 очка) в таблицу лидеров, если нужно
        if (window.currentUser && typeof saveScoreToLeaderboard === 'function') {
            saveScoreToLeaderboard(3);
        } else {
            resultDiv.innerHTML += '<br><span style="color:orange;">Войдите, чтобы сохранить результат в таблицу лидеров</span>';
        }
    } else {
        resultDiv.innerHTML = '<span style="color:red;">😢 Компьютер выиграл матч. -5 XP</span>';
        await subtractXP(5);
    }
    await displayXP(); // обновить отображение
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameActive = true;
    updateScoresUI();
    resultDiv.innerHTML = '';
    choiceBtns.forEach(btn => btn.disabled = false);
}

function handlePlayerChoice(playerChoice) {
    if (!gameActive) {
        resultDiv.innerHTML = 'Игра окончена. Нажмите "Новая игра"';
        return;
    }

    const computerChoice = getComputerChoice();
    const winner = getWinner(playerChoice, computerChoice);

    let message = `Вы выбрали ${getChoiceEmoji(playerChoice)}. Компьютер выбрал ${getChoiceEmoji(computerChoice)}. `;

    if (winner === 'draw') {
        message += 'Ничья!';
    } else if (winner === 'player') {
        playerScore++;
        message += 'Вы выиграли этот раунд!';
    } else {
        computerScore++;
        message += 'Компьютер выиграл этот раунд.';
    }

    updateScoresUI();
    resultDiv.innerHTML = message;

    // Проверка окончания матча
    if (playerScore >= 3) {
        endGame('player');
    } else if (computerScore >= 3) {
        endGame('computer');
    }
}

// Назначаем обработчики кнопкам
document.getElementById('rock').addEventListener('click', () => handlePlayerChoice('rock'));
document.getElementById('scissors').addEventListener('click', () => handlePlayerChoice('scissors'));
document.getElementById('paper').addEventListener('click', () => handlePlayerChoice('paper'));
resetBtn.addEventListener('click', resetGame);

// Инициализация счёта и активности
resetGame();