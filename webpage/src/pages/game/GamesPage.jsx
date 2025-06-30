import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from '../../styles/game/GamePage.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

function GamesPage() {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();
    const [totalPages, setTotalPages] = useState(1);
    const gamesPerPage = 1;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        axios.get('/api/games/approved')  // ✅ Đổi đúng endpoint backend trả về danh sách game được duyệt
            .then(res => setGames(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get(`/api/games/approved?page=${currentPage - 1}&size=${gamesPerPage}`, {
                    withCredentials: true,
                });
                setGames(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
            } catch (err) {
                console.error('Error fetching games:', err);
            }
        };
        fetchGames();
    }, [currentPage]);

    const handlePlay = (game) => {
        let slug = game.title;
        // Chuyển "Clumsy Bird" → "clumsyBird"
        slug = slug
            .toLowerCase()
            .split(' ')
            .map((word, index) =>
                index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join('');

        navigate(`/hocho/child/games/${slug}`, {state: {game}});
    };


    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className={styles.pagination}>
                <button
                    className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    Previous
                </button>
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => handlePageChange(page)}
                        aria-label={`Page ${page}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        );
    };

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Video Games</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Video Games</li>
                    </ul>
                </div>
            </section>

            <div className={styles.gamesContainer}>
                <h2 className={styles.gamesTitle}>🎮 Danh sách trò chơi cho học sinh</h2>
                <div className={styles.gamesGrid}>
                    {games.map(game => (
                        <div key={game.gameId} className={styles.gameCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src={`/${game.gameUrl}`}
                                    alt={game.title}
                                    className={styles.gameImage}
                                />
                                <h3 className={styles.gameTitle}>{game.title}</h3>
                            </div>
                            <p className={styles.gameAgeGroup}><strong>Độ tuổi:</strong> {game.ageGroup}</p>
                            <p className={styles.gameDescription}>{game.description}</p>
                            <button
                                onClick={() => handlePlay(game)}
                                className={styles.playButton}
                            >
                                ▶️ Chơi ngay
                            </button>
                        </div>
                    ))}
                </div>
                {totalPages > 1 && renderPagination()}
            </div>
            <Footer/>
        </>
    );
}

export default GamesPage;
