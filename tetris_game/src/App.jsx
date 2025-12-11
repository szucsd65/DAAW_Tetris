import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TetrisBoard from "./TetrisBoard";
import { COLS, SPEED, SHAPES } from "./constants";

import { ref, onValue, update, set } from "firebase/database";
import { db } from "./firebase";

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
  const [incomingGarbage, setIncomingGarbage] = useState([]);
  const [nextPiece, setNextPiece] = useState(randomPiece());
  const [gameSpeed, setGameSpeed] = useState(SPEED);

  const paused = status === "paused";
  const gameOver = status === "gameOver";

  useEffect(() => {
    const gameRef = ref(db, "game/state");
    const unsub = onValue(gameRef, (snap) => {
      const data = snap.val();
      if (data?.status) {
        setStatus(data.status);
      }
    });
    return () => unsub();
  }, [db]);

  useEffect(() => {
    setGameSpeed(SPEED * Math.pow(0.9, level - 1));
  }, [level]);

  useEffect(() => {
    const attacksRef = ref(db, "game/attacks");
    const unsub = onValue(attacksRef, (snap) => {
      const attacks = snap.val();
      if (!attacks) return;

      Object.values(attacks).forEach((attackData) => {
        if (attackData.from !== username && attackData.garbageLines) {
          setIncomingGarbage(attackData.garbageLines);
        }
      });
    });

    return () => unsub();
  }, [db, username]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.repeat) return;

      try {
        if (e.key.toLowerCase() === "p" && (status === "playing" || status === "paused")) {
          const newStatus = paused ? "playing" : "paused";
          await update(ref(db, "game/state"), { status: newStatus });
        }
      } catch (err) {
        console.error("Error sending game event", err);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [db, status, paused]);

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    setLevel(newLevel);
  }, [lines]);

  const handleGameOver = async () => {
    try {
      await axios.post(`${API_URL}/api/rankings`, {
        playerName: username,
        level,
        linesCleared: lines,
      });

      await update(ref(db, "game/state"), {
        status: "gameOver",
        winner: username,
        finalLines: lines,
      });

      setStatus("gameOver");

      setTimeout(() => {
        navigate("/lobby");
      }, 3000);
    } catch (err) {
      console.error("Error sending game over", err);
    }
  };

  const handleLinesCleared = async (clearedCount) => {
    if (clearedCount === 0) return;

    const garbageLines = generateGarbageLines(clearedCount);
    const attackRef = ref(db, `game/attacks/${username}_${Date.now()}`);

    try {
      await set(attackRef, {
        from: username,
        timestamp: Date.now(),
        clearedLines: clearedCount,
        garbageLines,
      });
    } catch (err) {
      console.error("Error sending garbage attack:", err);
    }
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
            incomingGarbage={incomingGarbage}
            gameSpeed={gameSpeed}
            nextPiece={nextPiece}
            setNextPiece={setNextPiece}
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
