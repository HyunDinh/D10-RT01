import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function LeaderboardPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const gameId = params.get('gameId');

    const [scores, setScores] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        axios.get('/api/games/currentUser', { withCredentials: true })
            .then(res => {
                console.log("📥 Response from /currentUser:", res.data);
                setCurrentUserId(res.data.id); // ✅ dùng id, không phải userId
            })
            .catch(err => console.error("❌ Lỗi khi lấy currentUser:", err));
    }, []);

    useEffect(() => {
        if (!gameId) return;
        axios.get(`/api/games/leaderBoard?gameId=${gameId}`, { withCredentials: true })
            .then(res => {
                console.log("📊 Fetched leaderboard:", res.data);
                setScores(res.data);
            })
            .catch(err => console.error("❌ Lỗi khi lấy BXH:", err));
    }, [gameId]);

    return (
        <div style={{ padding: '40px', background: '#f9f9f9', minHeight: '100vh' }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '30px',
                fontSize: '28px',
                fontWeight: 'bold'
            }}>
                🏆 Bảng xếp hạng trò chơi
            </h2>

            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '18px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <thead>
                <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Tên người chơi</th>
                    <th style={{ padding: '12px' }}>Điểm</th>
                    <th style={{ padding: '12px' }}>Ngày</th>
                </tr>
                </thead>
                <tbody>
                {scores.map((entry, index) => {
                    const entryUserId = entry.child?.id; // ✅ sửa lại đúng property
                    const isCurrentUser = Number(currentUserId) === Number(entryUserId);
                    const isTop3 = index < 3;

                    let bgColor = 'transparent';
                    if (isTop3) {
                        const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
                        bgColor = medalColors[index];
                    } else if (isCurrentUser) {
                        bgColor = '#e0f7fa';
                    }

                    return (
                        <tr key={entry.id} style={{
                            backgroundColor: bgColor,
                            fontWeight: isTop3 || isCurrentUser ? 'bold' : 'normal',
                            color: isTop3 ? '#000' : '#333'
                        }}>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ padding: '12px' }}>
                                {entry.child?.username || 'Ẩn danh'}
                                {isCurrentUser && (
                                    <span style={{ marginLeft: '8px', color: '#fbc02d' }}>⭐</span>
                                )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{entry.highestScore}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {new Date(entry.scoreDate).toLocaleDateString('vi-VN')}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default LeaderboardPage;
