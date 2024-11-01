import { Controller } from "@hotwired/stimulus";

// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Tetromino shapes and colors
const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

const COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#FFA500",
];

// Connects to data-controller="tetris"
export default class extends Controller {
  static targets = ["canvas", "score"];
  static values = {
    ctx: Object,
    score: Number,
    currentPiece: Object,
    board: Array,
  };

  canvasTargetConnected() {
    this.ctxValue = this.canvasTarget.getContext("2d");
    console.log(this.canvasTarget);
    console.log(this.ctxValue);

    this.boardValue = Array(ROWS)
      .fill()
      .map(() => Array(COLS).fill(0));

    this.currentPieceValue = null;
    this.scoreValue = 0;

    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.moveLeft();
          break;
        case "ArrowRight":
          this.moveRight();
          break;
        case "ArrowDown":
          this.moveDown();
          break;
        case "ArrowUp":
          this.rotate();
          break;
      }
    });

    this.currentPieceValue = this.createPiece();
    this.gameLoop();
  }

  createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    return {
      shape: SHAPES[shapeIndex],
      color: COLORS[colorIndex],
      row: 0,
      col: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
    };
  }

  drawboard() {
    this.ctxValue.clearRect(
      0,
      0,
      this.canvasTarget.width,
      this.canvasTarget.height,
    );
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (this.boardValue[row][col]) {
          this.ctxValue.fillStyle = this.boardValue[row][col];
          this.ctxValue.fillRect(
            col * BLOCK_SIZE,
            row * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
          );
          this.ctxValue.strokeRect(
            col * BLOCK_SIZE,
            row * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
          );
        }
      }
    }
  }

  drawPiece() {
    this.ctxValue.fillStyle = this.currentPieceValue.color;
    for (let row = 0; row < this.currentPieceValue.shape.length; row++) {
      for (let col = 0; col < this.currentPieceValue.shape[row].length; col++) {
        if (this.currentPieceValue.shape[row][col]) {
          this.ctxValue.fillRect(
            (this.currentPieceValue.col + col) * BLOCK_SIZE,
            (this.currentPieceValue.row + row) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
          );
          this.ctxValue.strokeRect(
            (this.currentPieceValue.col + col) * BLOCK_SIZE,
            (this.currentPieceValue.row + row) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
          );
        }
      }
    }
  }

  moveDown() {
    this.currentPieceValue.row++;
    if (this.isCollision()) {
      this.currentPieceValue.row--;
      mergePiece();
      this.currentPieceValue = this.createPiece();
      if (this.isCollision()) {
        // Game over
        alert("Game Over! Your score: " + this.scoreValue);
        resetGame();
      }
    }
  }

  moveLeft() {
    this.currentPieceValue.col--;
    if (this.isCollision()) {
      this.currentPieceValue.col++;
    }
  }

  moveRight() {
    this.currentPieceValue.col++;
    if (this.isCollision()) {
      this.currentPieceValue.col--;
    }
  }

  rotate() {
    const rotated = this.currentPieceValue.shape[0].map((_, index) =>
      this.currentPieceValue.shape.map((row) => row[index]).reverse(),
    );
    const previousShape = this.currentPieceValue.shape;
    this.currentPieceValue.shape = rotated;
    if (this.isCollision()) {
      this.currentPieceValue.shape = previousShape;
    }
  }

  isCollision() {
    for (let row = 0; row < this.currentPieceValue.shape.length; row++) {
      for (let col = 0; col < this.currentPieceValue.shape[row].length; col++) {
        if (
          this.currentPieceValue.shape[row][col] &&
          (this.currentPieceValue.row + row >= ROWS ||
            this.currentPieceValue.col + col < 0 ||
            this.currentPieceValue.col + col >= COLS ||
            this.boardValue[this.currentPieceValue.row + row][
              this.currentPieceValue.col + col
            ])
        ) {
          return true;
        }
      }
    }
    return false;
  }

  mergePiece() {
    for (let row = 0; row < this.currentPieceValue.shape.length; row++) {
      for (let col = 0; col < this.currentPieceValue.shape[row].length; col++) {
        if (this.currentPieceValue.shape[row][col]) {
          this.boardValue[this.currentPieceValue.row + row][
            this.currentPieceValue.col + col
          ] = this.currentPieceValue.color;
        }
      }
    }
    clearLines();
  }

  clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (this.boardValue[row].every((cell) => cell !== 0)) {
        this.boardValue.splice(row, 1);
        this.boardValue.unshift(Array(COLS).fill(0));
        linesCleared++;
      }
    }
    if (linesCleared > 0) {
      this.scoreValue += linesCleared * 100;
      this.scoreTarget.textContent = this.scoreValue;
    }
  }

  resetGame() {
    this.boardValue = Array(ROWS)
      .fill()
      .map(() => Array(COLS).fill(0));
    this.scoreValue = 0;
    this.scoreTarget.textContent = this.scoreValue;
    this.currentPieceValue = createPiece();
  }

  gameLoop() {
    this.moveDown();
    this.drawboard();
    this.drawPiece();
    requestAnimationFrame(this.gameLoop);
  }
}
