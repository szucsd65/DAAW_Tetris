import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TetrisBoard from "./TetrisBoard";
import { COLS, SPEED, SHAPES } from "./constants";

import { ref, onValue, update, set, remove } from "firebase/database";
import { db } from "./firebase";
import NextPiece from "./NextPiece";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { type, rotation: 0, x: 3, y: 0 };
}

function App() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("lobby");
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [pendingGarbage, setPendingGarbage] = useState([]);
  const [nextPiece, setNextPiece] = useState(randomPiece());
  const [gameSpeed, setGameSpeed] = useState(SPEED);
  const [sentAttacks, setSentAttacks] = useState(new Set());

  const paused = status === "paused";
  const gameOver = status === "gameOver";

  useEffect(() => {
  const gameRef = ref(db, "game/state");
  const unsub = onValue(gameRef, (snap) => {
    const data = snap.val();
    setStatus(data?.status || "lobby");
    if (data?.status === "gameOver") {
      setTimeout(() => navigate("/lobby"), 3000);
    }
  });
  return unsub;
}, []);
  


  useEffect(() => {
    setGameSpeed(SPEED * Math.pow(0.9, level - 1));
  }, [level]);

useEffect(() => {
  const attacksRef = ref(db, "game/attacks");
  const unsub = onValue(attacksRef, (snap) => {
    const attacks = snap.val() || {};
    Object.entries(attacks).forEach(([key, attackData]) => {
      const isOwnRecent = sentAttacks.has(key);
      if (isOwnRecent || attackData?.from === username) {
        return;
      }
      if (attackData?.garbageLines) {
        setPendingGarbage(prev => [...prev, ...attackData.garbageLines]);
        remove(ref(db, `game/attacks/${key}`));
      }
    });
  });
  return unsub;
}, [username, sentAttacks]);


  useEffect(() => {
  const cleanup = setTimeout(() => setSentAttacks(new Set()), 5000); 
  return () => clearTimeout(cleanup);
}, []);

  useEffect(() => {
  const handleKeyDown = async (e) => {
    if (e.repeat) return;
    if (e.key.toLowerCase() === "p" && (status === "playing" || status === "paused")) {
      const newStatus = paused ? "playing" : "paused";
      await update(ref(db, "game/state"), { status: newStatus });
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [status, paused]); 

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    setLevel(newLevel);
  }, [lines]);

  const handleGameOver = async () => {
  try {
    await update(ref(db, "game/state"), {
      status: "gameOver",
      endedBy: username,
      endTime: Date.now()
    });
    
    axios.post(`${API_URL}/api/rankings`, {
      playerName: username,
      level,
      linesCleared: lines
    }).catch(err => {
      console.warn("Scores not saved (backend offline):", err.message);
    });
    
  } catch (err) {
    console.error("Firebase game over failed:", err);
  }
};

  const handleLinesCleared = async (clearedCount) => {
  const garbageLines = generateGarbageLines(1);
  const timestamp = Date.now();
  const attackId = `${username}_${timestamp}`;
  setSentAttacks(prev => new Set([...prev, attackId]));
  
  await set(ref(db, `game/attacks/${attackId}`), {
    from: username,
    garbageLines,
    timestamp
  });
};



  const generateGarbageLines = (count) => {
    const linesArr = [];
    for (let i = 0; i < count; i++) {
      const gap1 = Math.floor(Math.random() * COLS);
      let gap2 = Math.floor(Math.random() * COLS);
      while (gap2 === gap1) gap2 = Math.floor(Math.random() * COLS);

      const line = Array(COLS).fill("garbage");
      line[gap1] = null;
      line[gap2] = null;
      linesArr.push(line);
    }
    return linesArr;
  };

const handleGarbageApplied = () => {
  setPendingGarbage([]);
};


  return (
    <div className="app">
      <div className="layout">
        <div>
          <h1 className="title">React Tetris</h1>
          <div style={{ color: "white", marginBottom: "10px" }}>
            <p>
              Player: <strong>{username}</strong>
            </p>
            <p>
              Status: <strong>{status}</strong>
            </p>
            <p>
              Level: <strong>{level}</strong>
            </p>
          </div>

          <TetrisBoard
            paused={paused}
            gameOver={gameOver}
            setGameOver={handleGameOver}
            setLines={setLines}
            onLinesCleared={handleLinesCleared}
            username={username}
            incomingGarbage={pendingGarbage}
            onGarbageApplied={handleGarbageApplied}
            gameSpeed={gameSpeed}
            nextPiece={nextPiece}
            setNextPiece={setNextPiece}
            gameStatus={status}
          />
        </div>

        <div className="panel">
          {paused && (
            <div
              style={{
                color: "#ff9900",
              }}
            >
              Paused
            </div>
          )}

          {gameOver && (
            <div
              style={{
                color: "#ff0000",
              }}
            >
              Game Over
            </div>
          )}

          {status === "playing" && (
            <div style={{color: "#00aa00"}}>
              Playing
            </div>
          )}

          <div>
            <div>Lines: {lines}</div>
          </div>

          <NextPiece piece={nextPiece} />

          <div className="help">
            <p>← → Move</p>
            <p>↑ Rotate</p>
            <p>↓ Drop</p>
            <p>Space Hard drop</p>
            <p>P Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
