import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import styles from "../../styles/AnswerQuestion/QuestionList.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import LeaderboardDialog from "./GameLeaderBoard.jsx";

function GamesPage() {
    const [games, setGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAge, setSelectedAge] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [allAges, setAllAges] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const navigate = useNavigate();
    const [openLeaderboard, setOpenLeaderboard] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState(null);

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
        let slug = game.title
            .toLowerCase()
            .split(' ')
            .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        navigate(`/hocho/child/games/${slug}`, {state: {game}});
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
        setSelectedGameId(gameId); // Set the selected gameId
        setOpenLeaderboard(true);
    };

    const handleCloseLeaderboard = () => {
        setOpenLeaderboard(false);
        setSelectedGameId(null); // Clear the selected gameId
    };
    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>Game Library</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">Home</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>Games</li>
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
                <h3 style={{color: '#f79433', fontSize: '28px', marginBottom: '20px'}}>Search</h3>

                <input
                    type="text"
                    placeholder="Search games..."
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
                    <label><strong>Age</strong></label>
                    <select
                        value={selectedAge}
                        onChange={e => setSelectedAge(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All age</option>
                        {allAges.map(age => (<option key={age} value={age}>{getAgeLabel(age)}</option>))}
                    </select>

                </div>

                <div style={{marginBottom: '16px'}}>
                    <label><strong>Category</strong></label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                            style={selectStyle}>
                        <option value="">All categories</option>
                        {allCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>

                <button onClick={clearFilters} style={clearBtnStyle}>Clear Filters</button>
            </div>

            {/* Game list */}
            <div style={{flex: 1}}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'
                }}>
                    {games.map(game => (<div key={game.gameId} style={gameCardStyle}>
                            <img
                                src={`/${game.gameUrl}`}
                                alt={game.title}
                                style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}}
                            />
                            <h3>{game.title}</h3>
                            <p><strong>Độ tuổi:</strong> {game.ageGroup}</p>
                            <p><strong>Category:</strong> {game.category}</p>
                            <p style={{minHeight: '60px'}}>{game.description}</p>
                            <div style={btnContainerStyle}>
                                <button
                                    onClick={() => handlePlay(game)} style={playBtnStyle}>▶️ Chơi ngay
                                </button>
                                <button
                                    onClick={handleOpenLeaderboard}
                                    style={leaderBtnStyle}
                                >
                                    🏆 Leaderboard
                                </button>

                            </div>
                        </div>))}
                </div>
            </div>
        </div>
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
