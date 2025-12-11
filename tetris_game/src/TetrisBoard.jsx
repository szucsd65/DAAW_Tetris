import { useState, useEffect } from "react";
import { ROWS, COLS, SPEED, SHAPES, COLORS } from "./constants";

function rotate(piece, dir = 1) {
  const total = SHAPES[piece.type].length;
  return { ...piece, rotation: (piece.rotation + dir + total) % total };
}


function getMatrix(piece) {
  return SHAPES[piece.type][piece.rotation];
}

const TetrisBoard = ({
  paused,
  gameOver,
  setGameOver,
  setLines,
  onLinesCleared,
  username,          // currently unused but OK
  incomingGarbage,   // you can handle this later
  gameSpeed,
  nextPiece,
  setNextPiece,

}) => {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const [piece, setPiece] = useState(nextPiece);

  useEffect(() => {
    if (!piece && nextPiece) {
      setPiece(nextPiece);
    }
  }, [nextPiece]);

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
    const rowsKept = b.filter((r) => r.some((c) => !c));
    const cleared = ROWS - rowsKept.length;
	
    const newRows = Array.from({ length: cleared }, () =>
      Array(COLS).fill(null)
    );

    return { newBoard: [...newRows, ...rowsKept], cleared };
  };


  const spawn = () => {
    const newPiece = nextPiece;
    // schedule the following one
    setNextPiece(() => {
      const keys = Object.keys(SHAPES);
      const type = keys[Math.floor(Math.random() * keys.length)];
      return { type, rotation: 0, x: 3, y: 0 };
    });

    if (collide(board, newPiece, 0, 0)) {
      setGameOver(true);
    } else {
      setPiece(newPiece);
    }
  };

  const stepDown = () => {
    if (gameOver || paused) return;

    if (!collide(board, piece, 0, 1)) {
      setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      const merged = merge(board, piece);
      const { newBoard, cleared } = clearLines(merged);
      setBoard(newBoard);
      if (cleared > 0) { setLines((l) => l + cleared);
        if (onLinesCleared) {
          onLinesCleared(cleared);
        }
      }
      spawn();
    }
  };


  useEffect(() => {
    if (gameOver || paused || !piece) return;
    const interval = setInterval(stepDown, gameSpeed);
    return () => clearInterval(interval);
  }, [gameOver, paused, gameSpeed, piece, board]);


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
        let dy = 0;
        while (!collide(board, piece, 0, dy + 1)) dy++;

        const landed = { ...piece, y: piece.y + dy };
        const merged = merge(board, landed);
        const { newBoard, cleared } = clearLines(merged);

        setBoard(newBoard);
        if (cleared > 0) { setLines((l) => l + cleared);
          if (onLinesCleared) {
            onLinesCleared(cleared);
          }
        }
        spawn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, piece, paused, gameOver]);


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
