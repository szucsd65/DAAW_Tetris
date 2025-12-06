import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080";  

const Lobby = () => {
  const [players, setPlayers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [lastGame, setLastGame] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, rankingsRes, lastRes] = await Promise.all([
        axios.get(`${API_URL}/api/players`),
        axios.get(`${API_URL}/api/rankings`),
        axios.get(`${API_URL}/api/games/last`)
      ]);
       console.log("players from backend:", playersRes.data);
      setPlayers(playersRes.data);
      setRankings(rankingsRes.data);
      setLastGame(lastRes.data);
    } catch (err) {
      console.error('Lobby data fetch error:', err);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') {
        navigate(`/game/${username}`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, username]);

  useEffect(() => {
  const u = username;
  const handler = () => {
    navigator.sendBeacon(`${API_URL}/api/players/${u}`, '');
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [username]);
 

  return (
    <div className="lobby-screen">
      <h1>Game Lobby</h1>
      <div className="instructions">Press ENTER to start the game</div>
      
      <div className="lobby-section">
        <h3>Connected Players ({players.length})</h3>
        <ul>
          {players.map((player, i) => (
            <li key={i}>{player.username}</li>
          ))}
        </ul>
      </div>

      {lastGame && (
        <div className="lobby-section">
          <h3>Last Game Results</h3>
          <table>
            <thead>
              <tr><th>Player</th><th>Score</th></tr>
            </thead>
            <tbody>
              {lastGame.map((result, i) => (
                <tr key={i}>
                  <td>{result.player}</td>
                  <td>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="lobby-section">
        <h3>Historical Ranking</h3>
        <table>
          <thead>
            <tr><th>Rank</th><th>Player</th><th>Score</th></tr>
          </thead>
          <tbody>
            {rankings.slice(0, 10).map((rank, i) => (
              <tr key={i}>
                <td>{i+1}</td>
                <td>{rank.player}</td>
                <td>{rank.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lobby;
