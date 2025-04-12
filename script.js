const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas responsive
function resizeCanvas() {
  const maxWidth = Math.min(600, window.innerWidth * 0.9);
  const scale = maxWidth / 600;
  
  canvas.style.width = `${maxWidth}px`;
  canvas.style.height = `${maxWidth}px`;
}

// Call resize on load and window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
const box = 20;
let snake;
let food;
let score;
let highScore = localStorage.getItem('highScore') || 0;
let direction;
let game;
let gameSpeed = 100; // milliseconds
let isPaused = false;
let gameOver = false;

// Set initial high score display
document.getElementById('highScore').innerText = highScore;

// Initialize the game
function initGame() {
  snake = [{ x: 10 * box, y: 10 * box }];
  generateFood();
  score = 0;
  direction = null;
  gameOver = false;
  gameSpeed = 100;
  document.getElementById('score').innerText = score;
  document.getElementById('highScore').innerText = highScore;

  if (game) clearInterval(game);
  game = setInterval(draw, gameSpeed);
}

// Generate food at random position
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

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
  // Prevent scrolling with arrow keys
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
    event.preventDefault();
  }
  
  // Game controls
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (event.key === ' ') togglePause(); // Space to pause/resume
  
  // Start game on first key press
  if (direction === null && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    setDirection(event.key.replace('Arrow', '').toUpperCase());
  }
}

// Mobile controls
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

upBtn.addEventListener('click', () => setDirection('UP'));
downBtn.addEventListener('click', () => setDirection('DOWN'));
leftBtn.addEventListener('click', () => setDirection('LEFT'));
rightBtn.addEventListener('click', () => setDirection('RIGHT'));

// Set direction with validation
function setDirection(newDirection) {
  if (newDirection === 'UP' && direction !== 'DOWN') direction = 'UP';
  else if (newDirection === 'DOWN' && direction !== 'UP') direction = 'DOWN';
  else if (newDirection === 'LEFT' && direction !== 'RIGHT') direction = 'LEFT';
  else if (newDirection === 'RIGHT' && direction !== 'LEFT') direction = 'RIGHT';
}

// Toggle pause state
function togglePause() {
  if (!gameOver) {
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(game);
      drawPauseScreen();
    } else {
      game = setInterval(draw, gameSpeed);
    }
  }
}

// Draw pause screen
function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = '30px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.font = '20px Poppins';
  ctx.fillText('Press SPACE to continue', canvas.width / 2, canvas.height / 2 + 40);
}

// Draw game over screen
function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = '30px Poppins';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
  
  ctx.font = '25px Poppins';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
  
  if (score === highScore && score > 0) {
    ctx.fillStyle = '#FFD700';
    ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 + 40);
  }
  
  ctx.fillStyle = 'white';
  ctx.font = '20px Poppins';
  ctx.fillText('Click RESTART to play again', canvas.width / 2, canvas.height / 2 + 80);
}

// Check for collision
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

// Update scoreboard with animation
function updateScoreboard() {
  const scoreText = document.getElementById('scoreText');
  const highScoreText = document.getElementById('highScoreText');
  
  scoreText.classList.add('bounce');
  setTimeout(() => scoreText.classList.remove('bounce'), 300);
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    document.getElementById('highScore').innerText = highScore;
    highScoreText.classList.add('bounce');
    setTimeout(() => highScoreText.classList.remove('bounce'), 300);
  }
  
  // Increase game speed every 5 points
  if (score % 5 === 0 && score > 0) {
    gameSpeed = Math.max(50, gameSpeed - 5);
    clearInterval(game);
    game = setInterval(draw, gameSpeed);
  }
}

// Draw everything on canvas
function draw() {
  // Clear canvas with gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#a8dadc');
  gradient.addColorStop(1, '#90c8d6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid lines for better visibility
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 0.5;
  
  for (let i = 0; i < canvas.width; i += box) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  
  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    // Create gradient for snake body
    let snakeGradient;
    if (i === 0) {
      // Head with different color
      snakeGradient = ctx.createRadialGradient(
        snake[i].x + box/2, snake[i].y + box/2, 0,
        snake[i].x + box/2, snake[i].y + box/2, box
      );
      snakeGradient.addColorStop(0, '#2e7d32');
      snakeGradient.addColorStop(1, '#1b5e20');
    } else {
      // Body segments
      snakeGradient = ctx.createRadialGradient(
        snake[i].x + box/2, snake[i].y + box/2, 0,
        snake[i].x + box/2, snake[i].y + box/2, box
      );
      snakeGradient.addColorStop(0, '#4caf50');
      snakeGradient.addColorStop(1, '#388e3c');
    }
    
    ctx.fillStyle = snakeGradient;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    
    // Add border to snake segments
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    
    // Add eyes to snake head
    if (i === 0) {
      ctx.fillStyle = 'white';
      
      // Position eyes based on direction
      let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
      
      switch(direction) {
        case 'UP':
          leftEyeX = snake[i].x + box/4;
          leftEyeY = snake[i].y + box/4;
          rightEyeX = snake[i].x + 3*box/4;
          rightEyeY = snake[i].y + box/4;
          break;
        case 'DOWN':
          leftEyeX = snake[i].x + box/4;
          leftEyeY = snake[i].y + 3*box/4;
          rightEyeX = snake[i].x + 3*box/4;
          rightEyeY = snake[i].y + 3*box/4;
          break;
        case 'LEFT':
          leftEyeX = snake[i].x + box/4;
          leftEyeY = snake[i].y + box/4;
          rightEyeX = snake[i].x + box/4;
          rightEyeY = snake[i].y + 3*box/4;
          break;
        case 'RIGHT':
          leftEyeX = snake[i].x + 3*box/4;
          leftEyeY = snake[i].y + box/4;
          rightEyeX = snake[i].x + 3*box/4;
          rightEyeY = snake[i].y + 3*box/4;
          break;
        default:
          leftEyeX = snake[i].x + box/4;
          leftEyeY = snake[i].y + box/4;
          rightEyeX = snake[i].x + 3*box/4;
          rightEyeY = snake[i].y + box/4;
      }
      
      // Draw eyes
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, box/8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, box/8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pupils
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, box/16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, box/16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw food with glow effect
  ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  
  // Create gradient for food
  const foodGradient = ctx.createRadialGradient(
    food.x + box/2, food.y + box/2, box/10,
    food.x + box/2, food.y + box/2, box/2
  );
  foodGradient.addColorStop(0, '#ff5252');
  foodGradient.addColorStop(1, '#d32f2f');
  
  ctx.fillStyle = foodGradient;
  ctx.beginPath();
  ctx.arc(food.x + box/2, food.y + box/2, box/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowBlur = 0;
  
  // Game logic
  if (!isPaused && !gameOver) {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Move snake based on direction
    if (direction === 'UP') snakeY -= box;
    if (direction === 'DOWN') snakeY += box;
    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'RIGHT') snakeX += box;

    // Wrap around edges
    if (snakeX < 0) snakeX = canvas.width - box;
    if (snakeY < 0) snakeY = canvas.height - box;
    if (snakeX >= canvas.width) snakeX = 0;
    if (snakeY >= canvas.height) snakeY = 0;

    // Check if food eaten
    if (snakeX === food.x && snakeY === food.y) {
      score++;
      document.getElementById('score').innerText = score;
      updateScoreboard();
      generateFood();
    } else {
      snake.pop();
    }

    // Create new head
    const newHead = { x: snakeX, y: snakeY };

    // Check collision with self
    if (collision(newHead, snake)) {
      gameOver = true;
      clearInterval(game);
      drawGameOverScreen();
    }

    // Add new head to snake
    if (!gameOver) {
      snake.unshift(newHead);
    }
  } else if (gameOver) {
    drawGameOverScreen();
  }
}

// Event listeners
document.getElementById('restartBtn').addEventListener('click', initGame);

// Touch events for mobile swipe controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  e.preventDefault();
});

canvas.addEventListener('touchmove', function(e) {
  e.preventDefault(); // Prevent scrolling when touching the canvas
});

canvas.addEventListener('touchend', function(e) {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Determine swipe direction based on which axis had the greater movement
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 0) {
      setDirection('RIGHT');
    } else {
      setDirection('LEFT');
    }
  } else {
    // Vertical swipe
    if (diffY > 0) {
      setDirection('DOWN');
    } else {
      setDirection('UP');
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
  e.preventDefault();
});

// Start the game
initGame();

