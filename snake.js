const game = document.querySelector("#snakegame");
const canvas = document.querySelector("#snakegame-canvas");
const context = canvas.getContext("2d");

const columns = 15;
const rows = 15;

const spaceSize = game.clientHeight / rows;

const borderSize = 2;

const space = [];

let scheduler = null;

let isValid = false;

let isPlaying = false;

let isDead = false;

let score = 0;
let highscore = 0;

let snake = null;

initSnakeGame();

/**
 * @returns void
 */
function initSnakeGame() {
  if (game.clientHeight != game.clientWidth) {
    isValid = false;
    return;
  }

  for (let x = 0; x < columns; x++) {
    space[x] = [];

    for (let y = 0; y < rows; y++) {
      space[x][y] = 0;
    }
  }

  scheduler = setInterval(updateSnake, 150);

  isValid = true;

  isPlaying = false;

  isDead = false;

  score = 0;

  snake = {
    headX: 7,
    headY: 7,
    direction: 0,
    prevDirection: 0,
    length: 1,
  };

  document.querySelector("#snakegame-dead").textContent = "";

  canvas.height = rows * spaceSize;
  canvas.width = rows * spaceSize;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, columns * spaceSize, rows * spaceSize);

  window.onkeydown = function (event) {
    if (event.code == "ArrowUp" || event.code == "KeyW") {
      setDirection(1);
      return;
    }

    if (event.code == "ArrowRight" || event.code == "KeyD") {
      setDirection(2);
      return;
    }

    if (event.code == "ArrowDown" || event.code == "KeyS") {
      setDirection(3);
      return;
    }

    if (event.code == "ArrowLeft" || event.code == "KeyA") {
      setDirection(4);
      return;
    }

    if (event.code == "Enter" && isDead) {
      initSnakeGame();
      return;
    }
  };

  drawSnakeGame(snake.headX, snake.headY, "#0000ff");
}

/**
 * @param {number} direction
 * @returns void
 */
function setDirection(direction) {
  if (isPlaying && direction == getOppositeDirection(snake.prevDirection)) {
    return;
  }

  if (isDead) {
    return;
  }

  if (!isPlaying) {
    isPlaying = true;
    generateFood();
  }

  snake.direction = direction;
}

/**
 * @returns void
 */
function updateSnake() {
  if (!isPlaying) {
    return;
  }

  snake.prevDirection = snake.direction;

  space[snake.headX][snake.headY] = snake.length;

  moveSnake();

  if (snake.headX < 0 || snake.headX > columns - 1 || snake.headY < 0 || snake.headY > rows - 1 || space[snake.headX][snake.headY] > 1) {
    deathSnake();
    return;
  }

  let temp = false;

  if (space[snake.headX][snake.headY] == -1) {
    snake.length++;
    generateFood();

    temp = true;
  }

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      if (!temp && space[x][y] > 0) {
        space[x][y]--;
      }

      if (space[x][y] > 0) {
        drawSnakeGame(x, y, "#000000");
      } else if (space[x][y] == 0) {
        drawSnakeGame(x, y, "#ffffff");
      } else if (space[x][y] == -1) {
        drawSnakeGame(x, y, "#ff0000");
      }
    }
  }

  drawSnakeGame(snake.headX, snake.headY, "#0000ff");

  score = snake.length;
  if (score > highscore) {
    highscore = score;
  }

  document.querySelector("#highscore").textContent = highscore;
  document.querySelector("#score").textContent = score;
}

/**
 * @returns void
 */
function moveSnake() {
  if (snake.prevDirection == 1) {
    snake.headY--;
  } else if (snake.prevDirection == 2) {
    snake.headX++;
  } else if (snake.prevDirection == 3) {
    snake.headY++;
  } else if (snake.prevDirection == 4) {
    snake.headX--;
  } else {
    return;
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @returns void
 */
function drawSnakeGame(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * spaceSize, y * spaceSize, spaceSize, spaceSize);
  context.fillStyle = "#ffffff";
  context.fillRect(x * spaceSize + borderSize, y * spaceSize + borderSize, spaceSize - borderSize * 2, spaceSize - borderSize * 2);
}

/**
 * @returns void
 */
function generateFood() {
  let x = Math.floor(Math.random() * columns);
  let y = Math.floor(Math.random() * rows);
  while (space[x][y] != 0) {
    x = Math.floor(Math.random() * columns);
    y = Math.floor(Math.random() * rows);
  }
  space[x][y] = -1;
  drawSnakeGame(x, y, "#ff0000");
}

/**
 * @returns void
 */
function deathSnake() {
  isPlaying = false;
  isDead = true;
  clearInterval(scheduler);
  document.querySelector("#snakegame-dead").textContent = "Press Enter to restart";
}

/**
 * @param {number} direction
 * @returns number
 */
function getOppositeDirection(direction) {
  if (direction == 1) {
    return 3;
  }

  if (direction == 2) {
    return 4;
  }

  if (direction == 3) {
    return 1;
  }

  if (direction == 4) {
    return 2;
  }

  return 0;
}
