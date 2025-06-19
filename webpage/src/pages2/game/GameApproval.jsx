import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const GameApproval = () => {
    const [games, setGames] = useState([]);
    const [expandedGameId, setExpandedGameId] = useState(null);

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
                    <span className="navbar-brand mb-0 h1">Admin Game Approval</span>
                </div>
            </nav>

            <div className="container mt-5">
                <h2 className="mb-4 text-center">Pending Game Approvals</h2>

                {games.length === 0 ? (
                    <div className="alert alert-warning text-center">
                        No games pending approval.
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
                                        <p><strong>ID:</strong> {game.gameId}</p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span className={
                                                game.status === 'APPROVED' ? 'text-success' :
                                                    game.status === 'REJECTED' ? 'text-danger' : 'text-warning'
                                            }>
                                                {game.status}
                                            </span>
                                        </p>

                                        <button className="btn btn-info btn-sm mb-2" onClick={() => toggleDetails(game.gameId)}>
                                            {expandedGameId === game.gameId ? "Hide Details" : "👁 View Details"}
                                        </button>

                                        {expandedGameId === game.gameId && (
                                            <div className="mt-2 border-top pt-2">
                                                <p><strong>Category:</strong> {game.category || 'N/A'}</p>
                                                <p><strong>Age Group:</strong> {game.ageGroup || 'N/A'}</p>
                                                <p><strong>Description:</strong> {game.description || 'No description'}</p>
                                                <p><strong>Created At:</strong> {new Date(game.createdAt).toLocaleString()}</p>
                                                <p><strong>Updated At:</strong> {new Date(game.updatedAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-footer d-flex justify-content-between">
                                        {game.status === "PENDING" && (
                                            <>
                                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(game.gameId)}>✅ Approve</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(game.gameId)}>❌ Reject</button>
                                            </>
                                        )}
                                        {game.status === "APPROVED" && (
                                            <button
                                                className="btn btn-danger btn-sm w-100"
                                                onClick={() => handleReject(game.gameId)}
                                            >
                                                ❌ Reject
                                            </button>
                                        )}
                                        {game.status === "REJECTED" && (
                                            <button
                                                className="btn btn-success btn-sm w-100"
                                                onClick={() => handleApprove(game.gameId)}
                                            >
                                                ✅ Approve
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
