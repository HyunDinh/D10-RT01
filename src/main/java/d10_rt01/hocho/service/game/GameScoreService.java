package d10_rt01.hocho.service.game;

import d10_rt01.hocho.model.GameScore;

import java.util.List;

public interface GameScoreService {

    GameScore findByUserIdAndGameId(Long userId, Long gameId);

    void save(GameScore gameScore);

    List<GameScore> findByGameId(Long gameId);
}
