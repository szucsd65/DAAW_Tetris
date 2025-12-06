import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TetrisBoard from "./TetrisBoard";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.57:8080";

function App() {
  const { username } = useParams();        // comes from /game/:username
  const [status, setStatus] = useState("lobby");
  const [lines, setLines] = useState(0);

  const paused = status === "paused";
  const gameOver = status === "gameOver";

  // poll Spring Boot for game status
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await axios.get(`${API_URL}/state`);
        if (res.data?.status) {
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error("Error fetching game state", err);
      }
    };

    fetchState();
    const id = setInterval(fetchState, 500);
    return () => clearInterval(id);
  }, []);

  // send ENTER / P to backend
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.repeat) return;
      try {
        if (e.key === "Enter") {
          await axios.post(`${API_URL}/start`, { username });
        } else if (e.key.toLowerCase() === "p") {
          await axios.post(`${API_URL}/toggle-pause`);
        }
      } catch (err) {
        console.error("error sending game event", err);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [username]);

  const handleGameOver = async () => {
    try {
      await axios.post(`${API_URL}/game-over`, { username, lines });
      setStatus("gameOver");
    } catch (err) {
      console.error("Error sending game over", err);
    }
  };

  return (
    <div className="app">
      <div className="layout">
        {/* main board */}
        <div>
          <h1 className="title">React Tetris</h1>
          <p>Player: <strong>{username}</strong></p>
          <TetrisBoard
            paused={paused}
            gameOver={gameOver}
            setGameOver={handleGameOver}
            setLines={setLines}
          />
        </div>

        {/* side panel */}
        <div className="panel">
          {paused && <div className="banner pause">Paused</div>}
          {gameOver && <div className="banner over">Game Over</div>}

          <div className="stat">Lines: {lines}</div>

          <div className="help">
            <p>← → Move</p>
            <p>↑ Rotate</p>
            <p>↓ Drop</p>
            <p>Space Hard drop</p>
            <p>Enter Start</p>
            <p>P Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

