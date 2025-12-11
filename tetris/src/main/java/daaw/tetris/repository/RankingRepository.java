package daaw.tetris.repository;

import daaw.tetris.model.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {
    
    List<Ranking> findTop10ByOrderByLevelDescLinesClearedDesc();
}
