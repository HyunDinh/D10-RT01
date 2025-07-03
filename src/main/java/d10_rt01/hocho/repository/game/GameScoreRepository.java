package d10_rt01.hocho.repository.game;

import d10_rt01.hocho.model.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    @Query("Select gs from GameScore gs WHERE gs.child.id= :userId AND gs.game.gameId = :gameId")
    GameScore findByUserIdAndGameId(Long userId, Long gameId);

    GameScore save(GameScore gameScore);

    @Query("SELECT gs FROM GameScore gs WHERE gs.game.gameId = :gameId ORDER BY gs.highestScore DESC")
    List<GameScore> findByGameId(@Param("gameId") Long gameId);



}
