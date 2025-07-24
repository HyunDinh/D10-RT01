import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/game/GameLeaderBoard.module.css';
import {useTranslation} from 'react-i18next';

function LeaderboardDialog({open, onClose, gameId}) {
    const [scores, setScores] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {t} = useTranslation();

    // Debug: Log gameId to ensure it's passed correctly
    useEffect(() => {
        console.log("📌 LeaderboardDialog gameId:", gameId);
        if (open && !gameId) {
            setError(t('game_leaderboard_error'));
        } else {
            setError(null); // clear error nếu gameId ok
        }
    }, [gameId, open]);

    // Fetch current user
    useEffect(() => {
        axios.get('/api/games/currentUser', {withCredentials: true})
            .then(res => {
                console.log("📥 Response from /currentUser:", res.data);
                setCurrentUserId(res.data.id); // ✅ dùng id, không phải userId
            })
            .catch(err => console.error("❌ Lỗi khi lấy currentUser:", err));
    }, []);

    // Fetch leaderboard
    useEffect(() => {
        if (!open || !gameId) return;

        axios.get(`/api/games/leaderBoard?gameId=${gameId}`, {withCredentials: true})
            .then(res => {
                console.log("📊 Fetched leaderboard:", res.data);
                setScores(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ Lỗi khi lấy BXH:", err);
                setError(t('game_leaderboard_error_fetch'));
                setLoading(false);
            });
    }, [gameId, open]);

    if (!open) return null;

    return (<div className={styles.overlay} onClick={onClose}>
        <div className={styles.container} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
                <h2>🏆 {t('game_leaderboard_title')}</h2>
                <button className={styles.close} onClick={onClose}>{t('game_leaderboard_close')}</button>
            </div>
            <div className={styles.content}>
                {loading && <p>{t('game_leaderboard_loading')}</p>}
                {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
                {!loading && !error && scores.length === 0 && (
                    <p style={{textAlign: 'center'}}>{t('game_leaderboard_empty')}</p>)}
                {!loading && !error && scores.length > 0 && (<table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '18px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <thead>
                    <tr style={{backgroundColor: '#f1f1f1', fontWeight: 'bold'}}>
                        <th style={{padding: '12px'}}>#</th>
                        <th style={{
                            padding: '12px', textAlign: 'left'
                        }}>{t('game_leaderboard_table_header_username')}</th>
                        <th style={{padding: '12px'}}>{t('game_leaderboard_table_header_score')}</th>
                        <th style={{padding: '12px'}}>{t('game_leaderboard_table_header_date')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scores.map((entry, index) => {
                        const entryUserId = entry.child?.id;
                        const isCurrentUser = Number(currentUserId) === Number(entryUserId);
                        const isTop3 = index < 3;

                        let bgColor = 'transparent';
                        if (isTop3) {
                            const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
                            bgColor = medalColors[index];
                        } else if (isCurrentUser) {
                            bgColor = '#e0f7fa';
                        }

                        return (<tr key={entry.id} style={{
                            backgroundColor: bgColor,
                            fontWeight: isTop3 || isCurrentUser ? 'bold' : 'normal',
                            color: isTop3 ? '#000' : '#333'
                        }}>
                            <td style={{padding: '12px', textAlign: 'center'}}>{index + 1}</td>
                            <td style={{padding: '12px'}}>
                                {entry.child?.username || t('game_leaderboard_anonymous')}
                                {isCurrentUser && (<span style={{
                                    marginLeft: '8px', color: '#fbc02d'
                                }}>{t('game_leaderboard_current_user')}</span>)}
                            </td>
                            <td style={{padding: '12px', textAlign: 'center'}}>{entry.highestScore}</td>
                            <td style={{padding: '12px', textAlign: 'center'}}>
                                {new Date(entry.scoreDate).toLocaleDateString('vi-VN')}
                            </td>
                        </tr>);
                    })}
                    </tbody>
                </table>)}
            </div>
        </div>
    </div>);
}

export default LeaderboardDialog;