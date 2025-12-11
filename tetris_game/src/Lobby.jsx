import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ref, onValue, update, set } from "firebase/database";
import { db } from "./firebase";

const API_URL = "http://localhost:8080";

const Lobby = () => {
  const [players, setPlayers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [lastGame, setLastGame] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const [livePlayers, setLivePlayers] = useState([]);

  const fetchData = async () => {
    try {
      const [playersRes, rankingsRes, lastRes] = await Promise.all([
        axios.get(`${API_URL}/api/players`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/rankings`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/games/last`).catch(() => ({ data: null })),
      ]);

      setPlayers(playersRes.data || []);
      setRankings(rankingsRes.data || []);
      setLastGame(lastRes.data);
    } catch (err) {
      console.error("Lobby data fetch error:", err);
    }
  };

  useEffect(() => {
    const playersRef = ref(db, "players");
    const unsub = onValue(playersRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.values(data).map(p => p.username);
      setLivePlayers(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!username) return;

    const gameRef = ref(db, "game/state");
    const unsub = onValue(gameRef, (snap) => {
      const data = snap.val();
      if (data?.status === "playing") {
        navigate(`/game/${username}`);
      }
    });

    return () => unsub();
  }, [username, navigate]);


  useEffect(() => {
    if (!username) return;

    const handleKey = async (e) => {
      if (e.key === "Enter") {
        try {
          await update(ref(db, "game/state"), {
            status: "playing",
            startedBy: username,
            startTime: Date.now(),
          });
        } catch (err) {
          console.error("Failed to update game state", err);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [username]);

  useEffect(() => {
    const u = username;
    if (!u) return;

    const handler = () => {
      navigator.sendBeacon(`${API_URL}/api/players/${u}`, "");
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [username]);

  useEffect(() => {
    if (username) {
      axios
        .post(`${API_URL}/api/players`, { username })
        .catch((err) => console.error("Failed to register player:", err));
    }
  }, [username]);
  
  return (
    <div className="lobby-screen">
      <h1>Game Lobby</h1>
      <div>
        Player: {username}
      </div>
      <div className="lobby-section">
        <h3>Connected Players ({livePlayers.length})</h3>
        <ul>
          {livePlayers.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>

      <div className="instructions">Press ENTER to start the game</div>
    </div>
  );
};

export default Lobby;

