import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ref, onValue, update, set } from "firebase/database";
import { db } from "./firebase";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";


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
  const gameRef = ref(db, "game/state");


  const unsub = onValue(gameRef, (snap) => {
    const data = snap.val() || {};
    if (!data.status) {
      update(gameRef, { status: "lobby" });
    }
  });


  return () => unsub();
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
      if (livePlayers.length < 2) {
        return;
      }


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
}, [username, livePlayers]);


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
    <h1 className="Text">Game Lobby</h1>
    <div className="Text">Player: {username}</div>
   
    <div className="lobby-section">
      <h3>Connected Players ({livePlayers.length})</h3>
      <ul>
        {livePlayers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>


    {lastGame && (
      <div className="lobby-section">
        <h3>Last Game Results</h3>
        <ul>
          {lastGame.scores?.map((score, i) => (
            <li key={i}>{score.name}: Level {score.level}, {score.lines} lines</li>
          ))}
        </ul>
      </div>
    )}


    {rankings.length > 0 && (
  <div className="lobby-section">
    <h3>Top Rankings</h3>
    <table className="rankings-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Level</th>
          <th>Lines</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((r, i) => (  
          <tr key={r.id || i}>
            <td>#{i + 1}</td>
            <td>{r.playerName}</td>     
            <td>{r.level}</td>
            <td>{r.linesCleared}</td>   
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}



    <div className="Text">Press ENTER to start the game</div>
  </div>
);


};


export default Lobby;