package d10_rt01.hocho.controller.game;



import d10_rt01.hocho.model.Game;
import d10_rt01.hocho.service.game.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    private final GameService gameService;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/storage-select")
    public ResponseEntity<List<Game>> getAllGames(Model model) {
        return ResponseEntity.ok(gameService.findAll());
    }

   @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveGame(@PathVariable Long id) {
        gameService.approveGame(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectGame(@PathVariable Long id) {
        gameService.rejectGame(id);
        return ResponseEntity.ok().build();
    }






}
