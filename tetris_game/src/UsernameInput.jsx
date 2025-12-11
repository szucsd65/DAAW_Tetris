import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ref, onDisconnect, set, serverTimestamp } from "firebase/database";
import { db } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const UsernameInput = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    localStorage.setItem("username", trimmed);

    navigate("/lobby");

    axios
      .post(`${API_URL}/api/players`, { username: trimmed })
      .catch((err) => console.error("Failed to register player:", err));

    try {
      const playerRef = ref(db, `players/${trimmed}`);
      await set(playerRef, {
        username: trimmed,
        state: "online",
        joinedAt: serverTimestamp(),
      });
      onDisconnect(playerRef).remove();
    } catch (err) {
      console.error("Firebase error", err);
    }
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
