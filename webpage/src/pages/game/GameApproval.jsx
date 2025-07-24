import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/game/GameApproved.module.css';
import {useTranslation} from 'react-i18next';
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import Dialog from '../../components/Dialog.jsx';

const GameApproval = () => {
    const [games, setGames] = useState([]);
    const [expandedGameId, setExpandedGameId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogGame, setDialogGame] = useState(null);
    const {t} = useTranslation();

    const fetchGames = () => {
        axios.get('http://localhost:8080/api/games/storage-select', {
            withCredentials: true
        })
            .then(res => setGames(res.data))
            .catch(err => console.error('Error loading games:', err));
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const handleApprove = (id) => {
        axios.post(`http://localhost:8080/api/games/${id}/approve`, {}, {
            withCredentials: true
        })
            .then(() => {
                setGames(prev => prev.map(game => game.gameId === id ? {...game, status: 'APPROVED'} : game));
            })
            .catch(err => console.error(err));
    };

    const handleReject = (id) => {
        axios.post(`http://localhost:8080/api/games/${id}/reject`, {}, {
            withCredentials: true
        })
            .then(() => {
                setGames(prev => prev.map(game => game.gameId === id ? {...game, status: 'REJECTED'} : game));
            })
            .catch(err => console.error(err));
    };

    const openDialog = (game) => {
        setDialogGame(game);
        setDialogOpen(true);
    };
    const closeDialog = () => {
        setDialogOpen(false);
        setDialogGame(null);
    };

    return (<><Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('game_approval_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('game_approval_title')}</li>
                </ul>
            </div>
        </section>
        <div className={styles.gameApprovalRoot}>

            <div className={styles.container}>
                <h2 className={styles.heading}>{t('game_approval_pending_title')}</h2>
                {games.length === 0 ? (<div className={styles.emptyAlert}>{t('game_approval_empty')}</div>) : (
                    <div className={styles.gameGrid}>
                        {games.map(game => (<div className={styles.gameCard} key={game.gameId}>
                            <img
                                src={`/${game.gameUrl}`}
                                className={styles.gameImage}
                                alt={t('game_poster_alt')}
                                onError={(e) => (e.target.src = "/posters/default-game-thumbnail.jpg")}
                            />
                            <div className={styles.cardBody}>
                                <h5 className={styles.cardTitle}>{game.title}</h5>
                                <p><strong>{t('game_id')}:</strong> {game.gameId}</p>
                                <p><strong>{t('game_status')}:</strong> <span
                                    className={styles[`status${game.status}`]}>{t(`game_status_${game.status.toLowerCase()}`)}</span>
                                </p>
                                <button className={styles.detailBtn} onClick={() => openDialog(game)}>
                                    {t('game_view_details')}
                                </button>
                            </div>
                            <div className={styles.cardFooter}>
                                {game.status === "PENDING" && (<>
                                    <button className={styles.approveBtn}
                                            onClick={() => handleApprove(game.gameId)}>✅ {t('game_approve')}</button>
                                    <button className={styles.rejectBtn}
                                            onClick={() => handleReject(game.gameId)}>❌ {t('game_reject')}</button>
                                </>)}
                                {game.status === "APPROVED" && (<button className={styles.rejectBtnFull}
                                                                        onClick={() => handleReject(game.gameId)}>
                                    ❌ {t('game_reject')}
                                </button>)}
                                {game.status === "REJECTED" && (<button className={styles.approveBtnFull}
                                                                        onClick={() => handleApprove(game.gameId)}>
                                    ✅ {t('game_approve')}
                                </button>)}
                            </div>
                        </div>))}
                    </div>)}
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
        <Footer/>
    </>);
};

export default GameApproval;
