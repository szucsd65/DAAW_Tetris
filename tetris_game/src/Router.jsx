import { BrowserRouter, Route, Routes } from "react-router-dom";
import UsernameInput from "./UsernameInput";
import Lobby from "./Lobby";
import App from "./App";
import NotFound from "./NotFound";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsernameInput />} />
        
        <Route path="/lobby" element={<Lobby />} />

        <Route path="/game/:username" element={<App />} />
        
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
