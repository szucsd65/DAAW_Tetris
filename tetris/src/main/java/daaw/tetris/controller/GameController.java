package daaw.tetris.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import daaw.tetris.model.PlayerRegistry;
import daaw.tetris.model.Ranking;
import daaw.tetris.repository.RankingRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://192.168.1.57:5173"
})
public class GameController {

    private final RankingRepository rankingRepository;
    private final PlayerRegistry playerRegistry;

    public GameController(RankingRepository rankingRepository, PlayerRegistry playerRegistry) {
        this.rankingRepository = rankingRepository;
        this.playerRegistry = playerRegistry;
    }

    @PostMapping("/players")
    public Map<String, Object> addPlayer(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        playerRegistry.add(username);
        return Map.of("status", "ok", "username", username);
    }

    @GetMapping("/players")
    public List<String> getPlayers() {
        return playerRegistry.list();
    }

    @DeleteMapping("/players/{username}")
    public Map<String, Object> removePlayer(@PathVariable String username) {
        playerRegistry.remove(username);
        return Map.of("status", "removed", "username", username);
    }

    @PostMapping("/rankings")
    public Ranking saveRanking(@RequestBody Ranking ranking) {
        return rankingRepository.save(ranking);
    }

    @GetMapping("/rankings")
    public List<Ranking> getTopRankings() {
        return rankingRepository.findTop10ByOrderByLevelDescLinesClearedDesc();
    }

    private String gameStatus = "lobby";

    @PostMapping("/game/status")
    public Map<String, String> setGameStatus(@RequestBody Map<String, String> body) {
        gameStatus = body.getOrDefault("status", "lobby");
        return Map.of("status", gameStatus);
    }

    @GetMapping("/game/status")
    public Map<String, String> getGameStatus() {
        return Map.of("status", gameStatus);
    }

    @GetMapping("/games/last")
    public List<Map<String, Object>> getLastGameResults() {
        return List.of();
    }
}
