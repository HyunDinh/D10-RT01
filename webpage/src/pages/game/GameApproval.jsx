import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const GameApproval = () => {
    const [games, setGames] = useState([]);
    const [expandedGameId, setExpandedGameId] = useState(null);
    const { t } = useTranslation();

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
                setGames(prev =>
                    prev.map(game =>
                        game.gameId === id ? { ...game, status: 'APPROVED' } : game
                    )
                );
            })
            .catch(err => console.error(err));
    };

    const handleReject = (id) => {
        axios.post(`http://localhost:8080/api/games/${id}/reject`, {}, {
            withCredentials: true
        })
            .then(() => {
                setGames(prev =>
                    prev.map(game =>
                        game.gameId === id ? { ...game, status: 'REJECTED' } : game
                    )
                );
            })
            .catch(err => console.error(err));
    };

    const toggleDetails = (id) => {
        setExpandedGameId(prev => prev === id ? null : id);
    };

    return (
        <div>
            <nav className="navbar navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">{t('game_approval_title')}</span>
                </div>
            </nav>

            <div className="container mt-5">
                <h2 className="mb-4 text-center">{t('game_approval_pending_title')}</h2>

                {games.length === 0 ? (
                    <div className="alert alert-warning text-center">
                        {t('game_approval_empty')}
                    </div>
                ) : (
                    <div className="row">
                        {games.map(game => (
                            <div className="col-md-6 mb-4" key={game.gameId}>
                                <div className="card shadow-sm h-100">
                                    <img
                                        src={`/${game.gameUrl}`}
                                        className="card-img-top"
                                        alt="Game Poster"
                                        style={{
                                            height: '280px',
                                            objectFit: 'contain',         // <-- giữ nguyên tỉ lệ và toàn bộ ảnh
                                            backgroundColor: '#f8f9fa'    // <-- thêm nền sáng nhẹ để ảnh nhỏ không bị xấu
                                        }}
                                        onError={(e) => (e.target.src = "/posters/default-game-thumbnail.jpg")}
                                    />


                                    <div className="card-body">
                                        <h5 className="card-title">{game.title}</h5>
                                        <p><strong>{t('game_id')}:</strong> {game.gameId}</p>
                                        <p>
                                            <strong>{t('game_status')}:</strong>{' '}
                                            <span className={
                                                game.status === 'APPROVED' ? 'text-success' :
                                                    game.status === 'REJECTED' ? 'text-danger' : 'text-warning'
                                            }>
                                                {t(`game_status_${game.status.toLowerCase()}`)}
                                            </span>
                                        </p>

                                        <button className="btn btn-info btn-sm mb-2" onClick={() => toggleDetails(game.gameId)}>
                                            {expandedGameId === game.gameId ? t('game_hide_details') : `👁 ${t('game_view_details')}`}
                                        </button>

                                        {expandedGameId === game.gameId && (
                                            <div className="mt-2 border-top pt-2">
                                                <p><strong>{t('game_category')}:</strong> {game.category || 'N/A'}</p>
                                                <p><strong>{t('game_age_group')}:</strong> {game.ageGroup || 'N/A'}</p>
                                                <p><strong>{t('game_description')}:</strong> {game.description || t('game_no_description')}</p>
                                                <p><strong>{t('game_created_at')}:</strong> {new Date(game.createdAt).toLocaleString()}</p>
                                                <p><strong>{t('game_updated_at')}:</strong> {new Date(game.updatedAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-footer d-flex justify-content-between">
                                        {game.status === "PENDING" && (
                                            <>
                                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(game.gameId)}>✅ {t('game_approve')}</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(game.gameId)}>❌ {t('game_reject')}</button>
                                            </>
                                        )}
                                        {game.status === "APPROVED" && (
                                            <button
                                                className="btn btn-danger btn-sm w-100"
                                                onClick={() => handleReject(game.gameId)}
                                            >
                                                ❌ {t('game_reject')}
                                            </button>
                                        )}
                                        {game.status === "REJECTED" && (
                                            <button
                                                className="btn btn-success btn-sm w-100"
                                                onClick={() => handleApprove(game.gameId)}
                                            >
                                                ✅ {t('game_approve')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameApproval;
