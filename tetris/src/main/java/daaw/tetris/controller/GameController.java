package daaw.tetris.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import daaw.tetris.model.GameState;
import daaw.tetris.model.PlayerRegistry;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://192.168.1.57:5173"
}) 
public class GameController {

    private final GameState state = new GameState("lobby");

    private final PlayerRegistry playerRegistry;

    public GameController(PlayerRegistry playerRegistry) {
        this.playerRegistry = playerRegistry;
    }

    @GetMapping("/state")
    public GameState getState() {
        return state;
    }

    @PostMapping("/start")
    public GameState start() {
        state.setStatus("playing");
        return state;
    }

    @PostMapping("/toggle-pause")
    public GameState togglePause() {
        if ("playing".equals(state.getStatus())) {
            state.setStatus("paused");
        } else if ("paused".equals(state.getStatus())) {
            state.setStatus("playing");
        }
        return state;
    }

    @PostMapping("/game-over")
    public GameState gameOver() {
        state.setStatus("gameOver");
        return state;
    }

    @PostMapping("/api/players/{username}")
    public void connectPlayer(@PathVariable String username) {
        playerRegistry.add(username);
    }

    @DeleteMapping("/api/players/{username}")
    public void disconnectPlayer(@PathVariable String username) {
        playerRegistry.remove(username);
    }

    @GetMapping("/api/players")
    public List<Map<String, String>> getPlayers() {
        return playerRegistry.list().stream()
                .map(name -> Map.of("username", name))
                .toList();
    }

    @GetMapping("/api/rankings")
    public List<Map<String, Object>> getRankings() {
        return List.of(); // Empty for now, or fetch from database later
}

    @GetMapping("/api/games/last")
    public List<Map<String, Object>> getLastGameResults() {
        return List.of(); // Empty for now
}

}
