const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY = 0;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

const COLORS = [
  '#000000', // Empty
  '#FF0D72', // I
  '#0DC2FF', // O
  '#0DFF72', // T
  '#F538FF', // L
  '#FF8E0D', // J
  '#FFE138', // S
  '#3877FF'  // Z
];

let board = [];
let score = 0;
let level = 1;
let piece = null;

// Initialize the board
function initBoard() {
  for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
      board[row][col] = EMPTY;
    }
  }
}

// Draw a square
function drawSquare(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = '#000';
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the board
function drawBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawSquare(col, row, COLORS[board[row][col]]);
    }
  }
}

// Create a new piece
function createPiece() {
  const type = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[type];
  piece = {
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    shape,
    color: type + 1
  };
}

// Draw the piece
function drawPiece() {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        drawSquare(piece.x + col, piece.y + row, COLORS[piece.color]);
      }
    }
  }
}

// Move the piece down
function drop() {
  piece.y++;
  if (collide()) {
    piece.y--;
    freeze();
    clearLines();
    createPiece();
    if (collide()) {
      alert('Game Over!');
      initBoard();
      score = 0;
      level = 1;
    }
  }
}

// Check for collisions
function collide() {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const x = piece.x + col;
        const y = piece.y + row;
        if (y >= ROWS || x < 0 || x >= COLS || board[y][x]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Freeze the piece in place
function freeze() {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        board[piece.y + row][piece.x + col] = piece.color;
      }
    }
  }
}

// Clear completed lines
function clearLines() {
  let lines = 0;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== EMPTY)) {
      board.splice(row, 1);
      board.unshift(new Array(COLS).fill(EMPTY));
      lines++;
    }
  }
  if (lines > 0) {
    score += lines * 100;
    level = Math.floor(score / 1000) + 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
  }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    piece.x--;
    if (collide()) piece.x++;
  } else if (e.key === 'ArrowRight') {
    piece.x++;
    if (collide()) piece.x--;
  } else if (e.key === 'ArrowDown') {
    drop();
  } else if (e.key === 'ArrowUp') {
    rotate();
  }
});

// Rotate the piece
function rotate() {
  const prevShape = piece.shape;
  piece.shape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i])).reverse();
  if (collide()) {
    piece.shape = prevShape;
  }
}

// Main game loop
function update() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece();
  drop();
  setTimeout(update, 1000 / level);
}

// Start the game
initBoard();
createPiece();
update();