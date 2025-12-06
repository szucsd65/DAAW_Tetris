import { BrowserRouter, Route, Routes } from "react-router-dom";
import UsernameInput from "./UsernameInput";
import Lobby from "./Lobby";
import App from "./App";
import NotFound from "./NotFound";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Initial username screen */}
        <Route path="/" element={<UsernameInput />} />
        
        {/* Lobby with players, rankings, waiting screen */}
        <Route path="/lobby" element={<Lobby />} />
        
        {/* Multiplayer game - uses storeId as game/room ID */}
        <Route path="/game/:username" element={<App />} />
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
