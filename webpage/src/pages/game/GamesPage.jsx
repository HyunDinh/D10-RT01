import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import styles from "../../styles/AnswerQuestion/QuestionList.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import LeaderboardDialog from "./GameLeaderBoard.jsx";
import Dialog from '../../components/Dialog.jsx';
import {useTranslation} from 'react-i18next';

function GamesPage() {
    const {t} = useTranslation();
    const [games, setGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAge, setSelectedAge] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [allAges, setAllAges] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const navigate = useNavigate();
    const [openLeaderboard, setOpenLeaderboard] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogGame, setDialogGame] = useState(null);

    useEffect(() => {
        axios.get('/api/games/filters/options')
            .then(res => {
                setAllAges(res.data.ageGroups);
                setAllCategories(res.data.categories);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetchFilteredGames();
    }, [searchTerm, selectedAge, selectedCategory]);

    const fetchFilteredGames = () => {
        const params = {};
        if (searchTerm) params.searchTerm = searchTerm;
        if (selectedAge) params.age = selectedAge;
        if (selectedCategory) params.category = selectedCategory;

        axios.get('/api/games/filter', {params})
            .then(res => setGames(res.data))
            .catch(err => console.error(err));
    };

    const handlePlay = (game) => {
        if (game.title === "Dino Run" || game.title === "Clumsy Bird") {
            let slug = game.title
                .toLowerCase()
                .split(' ')
                .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
            navigate(`/hocho/child/games/${slug}`, {state: {game}});
        } else {
            alert("Game đang trong quá trình phát triển.");
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAge('');
        setSelectedCategory('');
    };

    const ageGroupLabels = {
        AGE_4_6: "4–6 years old", AGE_7_9: "7–9 years old", AGE_10_12: "10–12 years old", AGE_13_15: "13–15 years old"
    };

    function getAgeLabel(value) {
        return ageGroupLabels[value] || value; // fallback nếu không khớp
    }

    const handleOpenLeaderboard = (gameId) => {
        const game = games.find(g => g.gameId === gameId);
        if (game && (game.title === "Dino Run" || game.title === "Clumsy Bird")) {
            setSelectedGameId(gameId);
            setOpenLeaderboard(true);
        } else {
            alert("Trò chơi này đang trong quá trình phát triển.");
        }
    };

    const handleCloseLeaderboard = () => {
        setOpenLeaderboard(false);
        setTimeout(() => setSelectedGameId(null), 300);  // Clear the selected gameId
    };

    const openDialog = (game) => {
        setDialogGame(game);
        setDialogOpen(true);
    };
    const closeDialog = () => {
        setDialogOpen(false);
        setDialogGame(null);
    };

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('game_library')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('games')}</li>
                </ul>
            </div>
        </section>

        <div style={{display: 'flex', padding: '40px'}}>
            {/* Filter box */}
            <div style={{
                width: '280px',
                marginRight: '30px',
                padding: '20px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{color: '#f79433', fontSize: '28px', marginBottom: '20px'}}>{t('search')}</h3>

                <input
                    type="text"
                    placeholder={t('search_games')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        marginBottom: '20px'
                    }}
                />

                <div style={{marginBottom: '16px'}}>
                    <label><strong>{t('age')}</strong></label>
                    <select
                        value={selectedAge}
                        onChange={e => setSelectedAge(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">{t('all_age')}</option>
                        {allAges.map(age => (<option key={age} value={age}>{getAgeLabel(age)}</option>))}
                    </select>

                </div>

                <div style={{marginBottom: '16px'}}>
                    <label><strong>{t('category')}</strong></label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                            style={selectStyle}>
                        <option value="">{t('all_categories')}</option>
                        {allCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>

                <button onClick={clearFilters} style={clearBtnStyle}>{t('clear_filters')}</button>
            </div>

            {/* Game list */}
            <div style={{flex: 1}}>
                <div
                    style={{
                        display: 'grid', gridTemplateColumns: games.length === 1 ? 'minmax(300px, calc(100% / 3))' // Single card takes 1/3 width
                            : 'repeat(3, minmax(300px, 1fr))', // 3 cards per row by default
                        gap: '20px',
                    }}
                >
                    {games.map((game) => (<div key={game.gameId} style={gameCardStyle}>
                            <img
                                src={`/${game.gameUrl}`}
                                alt={t('game_poster_alt')}
                                style={{
                                    width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px',
                                }}
                            />
                            <h3>{game.title}</h3>
                            <p>
                                <strong>{t('age_group')}:</strong> {game.ageGroup}
                            </p>
                            <p>
                                <strong>{t('category')}:</strong> {game.category}
                            </p>
                            <p style={{minHeight: '60px'}}>{game.description}</p>
                            <div style={btnContainerStyle}>
                                <button
                                    onClick={() => handlePlay(game)}
                                    style={playBtnStyle}
                                >
                                    {t('play_now')} ▶️
                                </button>
                                <button
                                    onClick={() => openDialog(game)}
                                    style={leaderBtnStyle}
                                >
                                    {t('game_view_details')}
                                </button>
                                <button
                                    onClick={() => handleOpenLeaderboard(game.gameId)}
                                    style={leaderBtnStyle}
                                >
                                    🏆 {t('leaderboard')}
                                </button>
                            </div>
                        </div>))}
                </div>
            </div>

        </div>
        {dialogOpen && dialogGame && (
            <Dialog onClose={closeDialog}>
                <h3>{dialogGame.title}</h3>
                <p><strong>{t('game_id')}:</strong> {dialogGame.gameId}</p>
                <p><strong>{t('game_status')}:</strong> {t(`game_status_${dialogGame.status.toLowerCase()}`)}</p>
                <p><strong>{t('game_category')}:</strong> {dialogGame.category || 'N/A'}</p>
                <p><strong>{t('game_age_group')}:</strong> {dialogGame.ageGroup || 'N/A'}</p>
                <p><strong>{t('game_description')}:</strong> {dialogGame.description || t('game_no_description')}</p>
                <p><strong>{t('game_created_at')}:</strong> {new Date(dialogGame.createdAt).toLocaleString()}</p>
                <p><strong>{t('game_updated_at')}:</strong> {new Date(dialogGame.updatedAt).toLocaleString()}</p>
            </Dialog>
        )}
        <LeaderboardDialog
            open={openLeaderboard}
            onClose={handleCloseLeaderboard}
            gameId={selectedGameId}
        />
        <Footer/>
    </>);
}

const selectStyle = {
    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px'
};

const clearBtnStyle = {
    backgroundColor: '#dc3545',
    color: '#fff',
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const gameCardStyle = {
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    background: '#fafafa'
};

const btnContainerStyle = {
    display: 'flex', justifyContent: 'space-between', marginTop: '12px'
};

const playBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1,
    marginRight: '10px'
};

const leaderBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1
};

export default GamesPage;
