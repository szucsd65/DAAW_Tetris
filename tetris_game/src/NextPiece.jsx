import { SHAPES, COLORS } from "./constants";

const PREVIEW_ROWS = 4;
const PREVIEW_COLS = 4;

function NextPiece({ piece }) {
  if (!piece) return null;

  const matrix = SHAPES[piece.type][piece.rotation];

  const preview = Array.from({ length: PREVIEW_ROWS }, () =>
    Array(PREVIEW_COLS).fill(null)
  );

  const offsetY = Math.floor((PREVIEW_ROWS - matrix.length) / 2);
  const offsetX = Math.floor((PREVIEW_COLS - matrix[0].length) / 2);

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) {
        const ny = offsetY + y;
        const nx = offsetX + x;
        if (ny >= 0 && ny < PREVIEW_ROWS && nx >= 0 && nx < PREVIEW_COLS) {
          preview[ny][nx] = piece.type;
        }
      }
    }
  }

  return (
    <div>
      <div style={{ color: "white", marginBottom: 4 }}>Next</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${PREVIEW_COLS}, 20px)`,
          gridTemplateRows: `repeat(${PREVIEW_ROWS}, 20px)`,
          gap: 1,
          background: "#111",
          padding: 4,
        }}
      >
        {preview.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: cell ? COLORS[cell] : "transparent",
                border: "1px solid #222",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NextPiece;
