package daaw.tetris.controller;

import daaw.tetris.model.Ranking;
import daaw.tetris.repository.RankingRepository;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")

public class RankingController {

    @Autowired
    private RankingRepository rankingRepository;

    @PostMapping("/ranking")
    public ResponseEntity<Ranking> saveRanking(@Valid @RequestBody Ranking ranking) {
        Ranking saved = rankingRepository.save(ranking);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Ranking>> getRankings() {
        List<Ranking> topRankings = rankingRepository.findTop10ByOrderByLevelDescLinesClearedDesc();
        return ResponseEntity.ok(topRankings);
    }
}
