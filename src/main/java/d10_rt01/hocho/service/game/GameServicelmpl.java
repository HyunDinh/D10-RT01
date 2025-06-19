package d10_rt01.hocho.service.game;


import d10_rt01.hocho.model.Game;
import d10_rt01.hocho.model.enums.ContentStatus;
import d10_rt01.hocho.repository.game.GameRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameServicelmpl implements GameService {

    private GameRepository gameRepository;

    @Autowired
    public GameServicelmpl(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Override
    public void save(Game game) {
        gameRepository.save(game);
    }

    @Override
    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    @Override
    public Game findById(Long gameId) {
        return gameRepository.findById(gameId).get();
    }

    @Transactional
    public void rejectGame(Long gameId) { // moi them boi LTDat
        Game game = gameRepository.findById(gameId).orElseThrow(()-> new RuntimeException("Game Not Found"));
        game.setStatus(ContentStatus.REJECTED);
        gameRepository.save(game);
    }

    @Transactional
    public void approveGame(Long gameId) { // moi them boi LTDat
        Game game = gameRepository.findById(gameId).orElseThrow(()-> new RuntimeException("Game Not Found"));
        game.setStatus(ContentStatus.APPROVED);
        gameRepository.save(game);
    }


}
