package d10_rt01.hocho.service.game;

import d10_rt01.hocho.model.GameScore;
import d10_rt01.hocho.repository.game.GameScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameScoreServicelmpl implements GameScoreService {

    private final GameScoreRepository gameScoreRepository;

    @Autowired
    public GameScoreServicelmpl(GameScoreRepository gameScoreRepository) {
        this.gameScoreRepository = gameScoreRepository;
    }

    @Override
    public GameScore findByUserIdAndGameId(Long userId, Long gameId) {
        return gameScoreRepository.findByUserIdAndGameId(userId, gameId);
    }

    @Override
    public void save(GameScore gameScore) {
        gameScoreRepository.save(gameScore);
    }

    @Override
    public List<GameScore> findByGameId(Long gameId) {
        return gameScoreRepository.findByGameId(gameId);
    }


}
