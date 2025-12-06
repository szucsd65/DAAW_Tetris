package daaw.tetris.model;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;


@Component
public class PlayerRegistry {
    private final Set<String> connectedPlayers = ConcurrentHashMap.newKeySet();

    public void add(String username) {
        if (username != null && !username.isBlank()) {
            connectedPlayers.add(username);
        }
    }

    public void remove(String username) {
        connectedPlayers.remove(username);
    }

    public List<String> list() {
        return connectedPlayers.stream().sorted().collect(Collectors.toList());
    }
}






    

