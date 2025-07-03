package d10_rt01.hocho.service.game;



import d10_rt01.hocho.model.Game;

import java.util.List;

public interface GameService {

    void save(Game game);

    void approveGame(Long gameId);

    void rejectGame(Long gameId);

    List<Game> findAll();

    List<Game> findApprovedGames();

    Game findById(Long gameId);

    Game findByTitle(String title);
}
