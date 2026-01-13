import { useState, useEffect } from "react";
import { ROWS, COLS, SPEED, SHAPES, COLORS } from "./constants";


function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { type, rotation: 0, x: Math.floor(COLS / 2) - 2, y: 0 };
}

function rotate(piece, dir = 1) {
  const total = SHAPES[piece.type].length;
  return { ...piece, rotation: (piece.rotation + dir + total) % total };
}


function getMatrix(piece) {
  return SHAPES[piece.type][piece.rotation];
}

const applyGarbage = (baseBoard, garbageLines) => {
  if (!garbageLines || garbageLines.length === 0) return baseBoard;

  const amount = Math.min(garbageLines.length, ROWS);
  const newBoard = [];


  for (let i = 0; i < ROWS - amount; i++) {
    newBoard[i] = baseBoard[i + amount];
  }
  
  for (let i = 0; i < amount; i++) {
    newBoard[ROWS - amount + i] = garbageLines[i];
  }

  return newBoard;
};

const TetrisBoard = ({
  paused,
  gameOver,
  setGameOver,
  setLines,
  onLinesCleared,
  username,          
  incomingGarbage,
  onGarbageApplied,  
  gameSpeed,
  nextPiece,
  setNextPiece,
  gameStatus

}) => {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const [piece, setPiece] = useState(nextPiece);

  const collide = (b, p, offX = 0, offY = 0) => {
    const m = getMatrix(p);
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;

        const nx = p.x + x + offX;
        const ny = p.y + y + offY;

        if (ny < 0) continue;

        if (nx < 0 || nx >= COLS || ny >= ROWS) return true; 

        if (b[ny][nx]) return true;
      }
    }
    return false;
  };


  const merge = (b, p) => {
    const m = getMatrix(p);
    const newBoard = b.map((r) => r.slice());

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x]) {
          const ny = p.y + y;
          const nx = p.x + x;
          if (ny >= 0) newBoard[ny][nx] = p.type;
        }
      }
    }
    return newBoard;
  };


  const clearLines = (b) => {
  const rowsKept = [];
  let cleared = 0;

  for (let row of b) {
    const isFull = row.every(cell => cell !== null);
    if (!isFull) {
      rowsKept.push(row);
    } else {
      cleared++;
    }
  }

  const newRows = Array.from({ length: cleared }, () =>
    Array(COLS).fill(null)
  );

  return { newBoard: [...newRows, ...rowsKept], cleared };
};

  const spawn = () => {
  const newPiece = nextPiece;
  setNextPiece(randomPiece());
  if (collide(board, newPiece)) {
    setGameOver(true);
    return;
  }
  setPiece(newPiece);
};

  useEffect(() => {
  spawn(); 
}, []);

  const stepDown = () => {
  if (gameOver || paused || gameStatus !== "playing" || !piece) return;

  if (!collide(board, piece, 0, 1)) {
    setPiece(prev => ({ ...prev, y: prev.y + 1 }));
    return;
  }

  let landedBoard = merge(board, piece);
  
  let { newBoard, cleared } = clearLines(landedBoard);
  
  if (incomingGarbage?.length > 0) {
  newBoard = applyGarbage(newBoard, incomingGarbage);
  onGarbageApplied();
}


  if (newBoard[0].some(cell => cell !== null)) {
    setGameOver(true);
    return;
  }

  if (cleared > 0) {
    setLines(l => l + cleared);
    onLinesCleared?.(cleared);
  }
  
  setBoard(newBoard);
  
  spawn();
};

 useEffect(() => {
  if (gameOver || paused || gameStatus !== "playing" || !piece) return;
  
  const interval = setInterval(stepDown, gameSpeed);
  return () => {
    clearInterval(interval);
  };
}, [gameOver, paused, gameStatus, piece, gameSpeed]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
      if (keys.includes(e.key) || keys.includes(e.code)) e.preventDefault();

      if (e.key === "ArrowLeft" && !collide(board, piece, -1, 0))
        setPiece((p) => ({ ...p, x: p.x - 1 }));

      if (e.key === "ArrowRight" && !collide(board, piece, 1, 0))
        setPiece((p) => ({ ...p, x: p.x + 1 }));

      if (e.key === "ArrowDown") stepDown();

      if (e.key === "ArrowUp") {
        const rotated = rotate(piece);
        if (!collide(board, rotated, 0, 0)) setPiece(rotated);
      }

      if (e.code === "Space") {
        e.preventDefault();
        let dy = 0;
        while (!collide(board, piece, 0, dy + 1)) dy++;

        let landed = { ...piece, y: piece.y + dy };
        let merged = merge(board, landed);
        let { newBoard, cleared } = clearLines(merged);

        if (incomingGarbage?.length) {
        newBoard = applyGarbage(newBoard, incomingGarbage);
        onGarbageApplied?.();
      }

        if (newBoard[0].some(c => c)) {
        setGameOver(true);
        return;
      }

        setBoard(newBoard);
        if (cleared > 0) { setLines((l) => l + cleared);
          if (onLinesCleared) {
            onLinesCleared(cleared);
          }
        }
        spawn();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, piece, paused, gameOver, incomingGarbage, onGarbageApplied, setLines, onLinesCleared]);


  const getRenderBoard = (board, piece) => {

    const temp = board.map((row) => [...row]);
    if (!piece) return temp;
    const m = getMatrix(piece);

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;

        const ny = piece.y + y;
        const nx = piece.x + x;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          temp[ny][nx] = piece.type;
        }
      }
    }
    return temp;
  };

  return (
    <div className="board">
      {getRenderBoard(board, piece).map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="cell"
            style={{
              backgroundColor: cell ? COLORS[cell] : "transparent",
            }}
          />
        ))
      )}
    </div>
  );
};

export default TetrisBoard;
