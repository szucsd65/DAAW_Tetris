package daaw.tetris.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rankings")
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String playerName;

    @Column(nullable = false)
    private int level;

    @Column(nullable = false)
    private int linesCleared;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public Ranking() {
        this.timestamp = LocalDateTime.now();
    }

    public Ranking(String playerName, int level, int linesCleared) {
        this.playerName = playerName;
        this.level = level;
        this.linesCleared = linesCleared;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getLinesCleared() {
        return linesCleared;
    }

    public void setLinesCleared(int linesCleared) {
        this.linesCleared = linesCleared;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
