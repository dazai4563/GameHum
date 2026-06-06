let playerScore = 0;
let computerScore = 0;
let gameActive = true;
const playerScoreSpan = document.getElementById('playerScore');
const computerScoreSpan = document.getElementById('computerScore');
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('resetGameBtn');
const choiceBtns = document.querySelectorAll('.choice');

function updateScoresUI() {
    if (playerScoreSpan) playerScoreSpan.textContent = playerScore;
    if (computerScoreSpan) computerScoreSpan.textContent = computerScore;
}

function getComputerChoice() {
    const choices = ['rock', 'scissors', 'paper'];
    return choices[Math.floor(Math.random() * 3)];
}

function getWinner(player, computer) {
    if (player === computer) return 'draw';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'scissors' && computer === 'paper') ||
        (player === 'paper' && computer === 'rock')
    ) return 'player';
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

function endGame(winner) {
    gameActive = false;
    choiceBtns.forEach(btn => btn.disabled = true);
    if (winner === 'player') {
        if (resultDiv) resultDiv.innerHTML = '<span style="color:green;">🎉 Вы выиграли матч! +10 XP 🎉</span>';
        if (typeof addXP === 'function') addXP(10);
        if (window.currentUser && typeof saveScoreToLeaderboard === 'function') saveScoreToLeaderboard(3);
        else if (resultDiv) resultDiv.innerHTML += '<br><span style="color:orange;">Войдите, чтобы сохранить результат в таблицу лидеров</span>';
    } else {
        if (resultDiv) resultDiv.innerHTML = '<span style="color:red;">😢 Компьютер выиграл матч. -5 XP</span>';
        if (typeof subtractXP === 'function') subtractXP(5);
    }
    if (typeof displayXP === 'function') displayXP();
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameActive = true;
    updateScoresUI();
    if (resultDiv) resultDiv.innerHTML = '';
    choiceBtns.forEach(btn => btn.disabled = false);
}

function handlePlayerChoice(playerChoice) {
    if (!gameActive) {
        if (resultDiv) resultDiv.innerHTML = 'Игра окончена. Нажмите "Новая игра"';
        return;
    }
    const computerChoice = getComputerChoice();
    const winner = getWinner(playerChoice, computerChoice);
    let message = `Вы выбрали ${getChoiceEmoji(playerChoice)}. Компьютер выбрал ${getChoiceEmoji(computerChoice)}. `;
    if (winner === 'draw') message += 'Ничья!';
    else if (winner === 'player') { playerScore++; message += 'Вы выиграли этот раунд!'; }
    else { computerScore++; message += 'Компьютер выиграл этот раунд.'; }
    updateScoresUI();
    if (resultDiv) resultDiv.innerHTML = message;
    if (playerScore >= 3) endGame('player');
    else if (computerScore >= 3) endGame('computer');
}

document.getElementById('rock')?.addEventListener('click', () => handlePlayerChoice('rock'));
document.getElementById('scissors')?.addEventListener('click', () => handlePlayerChoice('scissors'));
document.getElementById('paper')?.addEventListener('click', () => handlePlayerChoice('paper'));
resetBtn?.addEventListener('click', resetGame);
resetGame();