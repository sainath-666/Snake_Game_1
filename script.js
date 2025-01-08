const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let snake;
let food;
let score;
let highScore = localStorage.getItem('highScore') || 0;
let direction;
let game;

document.getElementById('highScore').innerText = highScore;

function initGame() {
  snake = [{ x: 10 * box, y: 10 * box }];
  generateFood();
  score = 0;
  direction = null;
  document.getElementById('score').innerText = score;
  document.getElementById('highScore').innerText = highScore;

  if (game) clearInterval(game);
  game = setInterval(draw, 100);
}

function generateFood() {
  let foodX, foodY;
  let isFoodOnSnake;

  do {
    foodX = Math.floor(Math.random() * (canvas.width / box)) * box;
    foodY = Math.floor(Math.random() * (canvas.height / box)) * box;
    isFoodOnSnake = snake.some(segment => segment.x === foodX && segment.y === foodY);
  } while (isFoodOnSnake);

  food = { x: foodX, y: foodY };
}

document.addEventListener('keydown', setDirection);

function setDirection(event) {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function updateScoreboard() {
  const scoreText = document.getElementById('scoreText');
  const highScoreText = document.getElementById('highScoreText');
  
  scoreText.classList.add('bounce');
  setTimeout(() => scoreText.classList.remove('bounce'), 300);
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreText.classList.add('bounce');
    setTimeout(() => highScoreText.classList.remove('bounce'), 300);
  }
}

function draw() {
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0 ? 'green' : 'lime');
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === 'UP') snakeY -= box;
  if (direction === 'DOWN') snakeY += box;
  if (direction === 'LEFT') snakeX -= box;
  if (direction === 'RIGHT') snakeX += box;

  if (snakeX < 0) snakeX = canvas.width - box;
  if (snakeY < 0) snakeY = canvas.height - box;
  if (snakeX >= canvas.width) snakeX = 0;
  if (snakeY >= canvas.height) snakeY = 0;

  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById('score').innerText = score;
    updateScoreboard();
    generateFood();
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  if (collision(newHead, snake)) {
    clearInterval(game);
    alert('Game Over! Score: ' + score);
  }

  snake.unshift(newHead);
}

document.getElementById('restartBtn').addEventListener('click', initGame);

initGame();
