package d10_rt01.hocho.controller.game;



import d10_rt01.hocho.model.Game;
import d10_rt01.hocho.model.GameScore;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.AgeGroup;
import d10_rt01.hocho.service.game.GameScoreService;
import d10_rt01.hocho.service.game.GameService;
import d10_rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    private final GameService gameService;
    private final GameScoreService gameScoreService;
    private final UserService userService;

    @Autowired
    public GameController(GameService gameService, UserService userService, GameScoreService gameScoreService) {
        this.gameService = gameService;
        this.userService = userService;
        this.gameScoreService = gameScoreService;
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

    @GetMapping("/approved")
    public ResponseEntity<List<Game>> getApprovedGames(Model model) {
        return ResponseEntity.ok(gameService.findApprovedGames());
    }

    @GetMapping("/userInfo")
    public ResponseEntity<?> getUserGames(@RequestParam String titleGame) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userService.findByUsername(username);
            Game game = gameService.findByTitle(titleGame);
            if(user != null) {
                return ResponseEntity.ok(Map.of("userId",user.getId() ,"gameId",game.getGameId()));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not found. Please try again.");
    }

    @GetMapping("/highScore")
    public ResponseEntity<?> getHighScore(@RequestParam Long userId, @RequestParam Long gameId) {
        GameScore gameScore = gameScoreService.findByUserIdAndGameId(userId, gameId);

        if(gameScore != null) { return ResponseEntity.ok(Map.of("highScore", gameScore.getHighestScore()));}
        else{
            return ResponseEntity.ok(Map.of("highScore", 0));
        }
    }

    @PostMapping("/saveScore")
    public ResponseEntity<?> saveScore(@RequestParam Long userId,
                                       @RequestParam Long gameId,
                                       @RequestParam int score) {
        try{
            GameScore gameScore = gameScoreService.findByUserIdAndGameId(userId, gameId);
            if(gameScore == null) {
                GameScore newScore = new GameScore();
                User child = userService.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
                newScore.setChild(child);
                newScore.setGame(gameService.findById(gameId));
                newScore.setHighestScore(score);
                newScore.setScoreDate(LocalDate.now());
                gameScoreService.save(newScore);
            }
            else if(score > gameScore.getHighestScore()) {
                gameScore.setHighestScore(score);
                gameScore.setScoreDate(LocalDate.now());
                gameScoreService.save(gameScore);
            }
            return ResponseEntity.ok("Score saved successfully");
        }
        catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving score: " + e.getMessage());
        }

    }

    @GetMapping("/currentUser")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userService.findByUsername(username);
            if(user != null) {
                return ResponseEntity.ok(user);
            }
            else{
                return ResponseEntity.ok("User not found");
            }
        }
        else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not found. Please try again.");
        }
    }

    @GetMapping("/leaderBoard")
    public ResponseEntity<?> getLeaderBoard(@RequestParam Long gameId) {
        List<GameScore> listScore = gameScoreService.findByGameId(gameId);

        if (listScore == null || listScore.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user has played this game yet.");
        }

        return ResponseEntity.ok(listScore);
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getFilter(@RequestParam(required = false) String age,
                                       @RequestParam(required = false) String searchTerm,
                                       @RequestParam(required = false) String category){
        List<Game> gameApproved = gameService.findApprovedGames();

        List<Game> gameFiltered = new ArrayList<>();

        for(Game game : gameApproved) {
            boolean matchAge = true;
            boolean matchCategory = true;
            boolean matchSearchTerm = true;

            if(searchTerm != null && !searchTerm.isBlank()){
                matchSearchTerm = game.getTitle().toLowerCase().contains(searchTerm.toLowerCase());
            }

            if(category != null && !category.isBlank()){
                matchCategory = category.equals(game.getCategory());
            }

            if(age!= null && !age.isBlank()){
                matchAge =  age.equals(game.getAgeGroup().toString());
            }

            if(matchSearchTerm && matchAge && matchCategory){
                gameFiltered.add(game);
            }
        }
        return ResponseEntity.ok(gameFiltered);

    }

    @GetMapping("/filters/options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        Map<String, List<String>> response = new HashMap<>();

        // ✅ Lấy list từ enum AgeGroup
        List<String> ageGroups = Arrays.stream(AgeGroup.values())
                .map(Enum::name)  // Hoặc .map(Enum::toString)
                .collect(Collectors.toList());

        // ✅ Lấy distinct category từ danh sách game đã duyệt
        List<String> categories = gameService.findApprovedGames().stream()
                .map(Game::getCategory)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        response.put("ageGroups", ageGroups);
        response.put("categories", categories);

        return ResponseEntity.ok(response);
    }










}
