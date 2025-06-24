import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GamesPage() {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/games/approved')  // ✅ Đổi đúng endpoint backend trả về danh sách game được duyệt
            .then(res => setGames(res.data))
            .catch(err => console.error(err));
    }, []);

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

        navigate(`/hocho/child/games/${slug}`, { state: { game } });
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎮 Danh sách trò chơi cho học sinh</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {games.map(game => (
                    <div key={game.gameId} style={{
                        border: '1px solid #ccc',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        background: '#fff'
                    }}>
                        <img
                            src={`/${game.gameUrl}`}
                            alt={game.title}
                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <h3>{game.title}</h3>
                        <p><strong>Độ tuổi:</strong> {game.ageGroup}</p>
                        <p style={{ minHeight: '60px' }}>{game.description}</p>
                        <button
                            onClick={() => handlePlay(game)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            ▶️ Chơi ngay
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GamesPage;
