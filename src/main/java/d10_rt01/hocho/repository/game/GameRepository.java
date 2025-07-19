package d10_rt01.hocho.repository.game;


import d10_rt01.hocho.model.Game;
import d10_rt01.hocho.model.enums.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {

    List<Game> findByStatus(ContentStatus status);

    Game findByTitle(String title);

    boolean existsGameByTitle(String title);


}
