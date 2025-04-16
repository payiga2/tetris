const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const statusElement = document.getElementById('status');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

let score = 0;
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let gameLoop = null;

const PIECES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

const COLORS = [
    '#00f0f0', // cyan
    '#f0f000', // yellow
    '#a000f0', // purple
    '#f0a000', // orange
    '#0000f0', // blue
    '#00f000', // green
    '#f00000'  // red
];

const STATUS_LEVELS = [
    { score: 0, text: "Noob [Baby]" },
    { score: 50, text: "Beginner [School]" },
    { score: 100, text: "Intermediate [Controller]" },
    { score: 200, text: "Skilled [Cool]" },
    { score: 300, text: "Advanced [Strong]" },
    { score: 500, text: "Expert [Rocket]" },
    { score: 800, text: "Master [Trophy]" },
    { score: 1000, text: "Tetris God [Star]" }
];

function createPiece() {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    return {
        shape: PIECES[pieceIndex],
        color: COLORS[pieceIndex],
        x: Math.floor(BOARD_WIDTH/2) - Math.floor(PIECES[pieceIndex][0].length/2),
        y: 0
    };
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(let y = 0; y < BOARD_HEIGHT; y++) {
        for(let x = 0; x < BOARD_WIDTH; x++) {
            if(board[y][x]) {
                ctx.fillStyle = COLORS[board[y][x] - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                ctx.fillRect(
                    (currentPiece.x + x) * BLOCK_SIZE,
                    (currentPiece.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE-1,
                    BLOCK_SIZE-1
                );
            }
        });
    });
}

function collision() {
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if(!value) return false;
            const newX = currentPiece.x + x;
            const newY = currentPiece.y + y;
            return newX < 0 || newX >= BOARD_WIDTH || 
                   newY >= BOARD_HEIGHT ||
                   (newY >= 0 && board[newY][newX]);
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                board[currentPiece.y + y][currentPiece.x + x] = COLORS.indexOf(currentPiece.color) + 1;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    
    for(let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if(board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if(linesCleared) {
        const lineBonus = [0, 100, 300, 500, 800][linesCleared] || 1000;
        score += lineBonus;
        scoreElement.textContent = `Score: ${score}`;
        updateStatus();
    }
}

function updateStatus() {
    let currentStatus = STATUS_LEVELS[0];
    for(const status of STATUS_LEVELS) {
        if(score >= status.score) {
            currentStatus = status;
        }
    }
    statusElement.textContent = `Status: ${currentStatus.text}`;
    statusElement.style.animation = "pop 0.3s";
    setTimeout(() => statusElement.style.animation = "", 300);
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if(collision()) {
        currentPiece.shape = previousShape;
    }
}

function moveDown() {
    currentPiece.y++;
    if(collision()) {
        currentPiece.y--;
        mergePiece();
        clearLines();
        currentPiece = createPiece();
        if(collision()) {
            gameOver();
        }
    }
}

function moveLeft() {
    currentPiece.x--;
    if(collision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if(collision()) {
        currentPiece.x--;
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameOverElement.style.display = 'block';
}

document.addEventListener('keydown', event => {
    if(!currentPiece) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
    
    drawBoard();
    drawPiece();
});

function startGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'none';
    statusElement.textContent = "Status: Noob [Baby]";
    currentPiece = createPiece();
    gameLoop = setInterval(() => {
        moveDown();
        drawBoard();
        drawPiece();
    }, 1000);
}

startGame();