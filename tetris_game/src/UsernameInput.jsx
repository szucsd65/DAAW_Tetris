import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.57:8080";

const UsernameInput = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    localStorage.setItem("username", username);

    try {
      const res = await axios.post(`${API_URL}/api/players/${username}`);
      console.log("Registered player:", username, "status:", res.status);
    } catch (err) {
      console.error("Failed to register player", err);
    }

    navigate("/lobby");
  };

  return (
    <div style={{ color: "white", padding: "20px", textAlign: "center" }}>
      <h1>Tetris Multiplayer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
          autoFocus
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button
          type="submit"
          style={{ padding: "10px 20px", marginLeft: "10px", fontSize: "16px" }}
        >
          Join Lobby
        </button>
      </form>
    </div>
  );
};

export default UsernameInput;
