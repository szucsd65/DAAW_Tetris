package daaw.tetris.model;

public class GameState {
    private String status;

    public GameState() {
        this.status = "lobby";
    }

    public GameState(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
