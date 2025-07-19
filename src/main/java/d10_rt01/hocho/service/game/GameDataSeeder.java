
package d10_rt01.hocho.service.game;

import d10_rt01.hocho.model.Game;
import d10_rt01.hocho.model.enums.AgeGroup;
import d10_rt01.hocho.model.enums.ContentStatus;
import d10_rt01.hocho.repository.game.GameRepository;
import d10_rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class GameDataSeeder implements CommandLineRunner {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        List<Game> gamesToSeed = new ArrayList<>();

        // Lấy user tạo game (nên kiểm tra danh sách user)
        var users = userService.getAllUsers();
        if (users.isEmpty()) {
            System.out.println("No user found to set as createdBy for games!");
            return;
        }
        var createdBy = users.get(1); // hoặc get(1) nếu chắc chắn có

        // Game 1
        Game dinoRun = new Game();
        dinoRun.setTitle("Dino Run");
        dinoRun.setDescription("A running dinosaur on desert.");
        dinoRun.setAgeGroup(AgeGroup.valueOf("AGE_13_15"));
        dinoRun.setCategory("Action");
        dinoRun.setGameUrl("posters/dino_run.jpg");
        dinoRun.setStatus(ContentStatus.valueOf("PENDING"));
        dinoRun.setCreatedBy(createdBy);
        dinoRun.setCreatedAt(LocalDateTime.now());
        dinoRun.setUpdatedAt(LocalDateTime.now());
        gamesToSeed.add(dinoRun);

        // Game 2
        Game clumsyBird = new Game();
        clumsyBird.setTitle("Clumsy Bird");
        clumsyBird.setDescription("A bird fly with your help.");
        clumsyBird.setAgeGroup(AgeGroup.valueOf("AGE_13_15"));
        clumsyBird.setCategory("Arcade");
        clumsyBird.setGameUrl("posters/clumsy_bird.jpg");
        clumsyBird.setStatus(ContentStatus.valueOf("PENDING"));
        clumsyBird.setCreatedBy(createdBy);
        clumsyBird.setCreatedAt(LocalDateTime.now());
        clumsyBird.setUpdatedAt(LocalDateTime.now());
        gamesToSeed.add(clumsyBird);

        // Game 3
        Game mathQuiz = new Game();
        mathQuiz.setTitle("Math Quiz");
        mathQuiz.setDescription("Solve math problems and improve your skills.");
        mathQuiz.setAgeGroup(AgeGroup.valueOf("AGE_10_12"));
        mathQuiz.setCategory("Education");
        mathQuiz.setGameUrl("posters/math_quiz.jpg");
        mathQuiz.setStatus(ContentStatus.valueOf("PENDING"));
        mathQuiz.setCreatedBy(createdBy);
        mathQuiz.setCreatedAt(LocalDateTime.now());
        mathQuiz.setUpdatedAt(LocalDateTime.now());
        gamesToSeed.add(mathQuiz);

        // Game 4
        Game memoryFlip = new Game();
        memoryFlip.setTitle("Memory Flip");
        memoryFlip.setDescription("Flip cards and test your memory.");
        memoryFlip.setAgeGroup(AgeGroup.valueOf("AGE_7_9"));
        memoryFlip.setCategory("Puzzle");
        memoryFlip.setGameUrl("posters/memory_flip.jpg");
        memoryFlip.setStatus(ContentStatus.valueOf("PENDING"));
        memoryFlip.setCreatedBy(createdBy);
        memoryFlip.setCreatedAt(LocalDateTime.now());
        memoryFlip.setUpdatedAt(LocalDateTime.now());
        gamesToSeed.add(memoryFlip);

        // Game 5
        Game wordBuilder = new Game();
        wordBuilder.setTitle("Word Builder");
        wordBuilder.setDescription("Create words from random letters.");
        wordBuilder.setAgeGroup(AgeGroup.valueOf("AGE_10_12"));
        wordBuilder.setCategory("Word");
        wordBuilder.setGameUrl("posters/word_builder.jpg");
        wordBuilder.setStatus(ContentStatus.valueOf("PENDING"));
        wordBuilder.setCreatedBy(createdBy);
        wordBuilder.setCreatedAt(LocalDateTime.now());
        wordBuilder.setUpdatedAt(LocalDateTime.now());
        gamesToSeed.add(wordBuilder);

        int added = 0;
        for (Game game : gamesToSeed) {
            if (!gameRepository.existsGameByTitle(game.getTitle())) {
                gameRepository.save(game);
                added++;
            }
        }

        if (added > 0) {
            System.out.println("Seeded " + added + " new games.");
        } else {
            System.out.println("All games already exist, skipping seeding.");
        }
    }
}