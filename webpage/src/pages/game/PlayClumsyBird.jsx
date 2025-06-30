import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function PlayClumsyBird() {
    const [userId, setUserId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [score, setScore] = useState(null);
    const [highScore, setHighScore] = useState(null);     // ✅ từ game gửi về
    const [dbHighScore, setDbHighScore] = useState(null); // ✅ từ DB
    const iframeRef = useRef();

    // ✅ Lấy userId + gameId + highScore từ DB khi vào game
    useEffect(() => {
        axios.get('/api/games/userInfo?titleGame=Clumsy Bird', { withCredentials: true })
            .then(res => {
                const { userId, gameId } = res.data;
                setUserId(userId);
                setGameId(gameId);

                return axios.get(`/api/games/highScore?userId=${userId}&gameId=${gameId}`, {
                    withCredentials: true
                });
            })
            .then(res => {
                setDbHighScore(res.data.highScore);      // ✅ giữ điểm DB để so sánh khi lưu
                setHighScore(res.data.highScore);        // ✅ dùng để hiển thị ban đầu
            })
            .catch(err => {
                console.error("❌ Lỗi khi lấy thông tin người dùng/game:", err);
            });
    }, []);

    // ✅ Lắng nghe điểm gửi từ iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'CLUMSY_BIRD_SCORE') {
                console.log("📥 Received from Clumsy Bird iframe:", event.data);
                const { steps, highScore: gameHighScore } = event.data;
                setScore(steps);
                setHighScore(gameHighScore);

                // ✅ Gửi điểm nếu đạt kỷ lục mới (so với DB)
                if (userId && gameId && steps > dbHighScore) {
                    axios.post('/api/games/saveScore', null, {
                        params: {
                            userId,
                            gameId,
                            score: steps
                        },
                        withCredentials: true
                    }).then(() => {
                        console.log("✅ Điểm mới đã lưu vào DB!");
                        setDbHighScore(steps); // Cập nhật lại luôn
                    }).catch(err => {
                        console.error("❌ Lỗi khi lưu điểm:", err);
                    });
                }
            }
        };

        // ✅ Gửi yêu cầu lấy điểm sau 500ms
        const timer = setTimeout(() => {
            const iframeWindow = iframeRef.current?.contentWindow;
            if (iframeWindow) {
                console.log("📤 React asking game to send score...");
                iframeWindow.postMessage({ type: 'GET_SCORE' }, '*');
            }
        }, 500);

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timer);
        };
    }, [userId, gameId, dbHighScore]);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* ✅ Box hiện điểm ở góc phải như DinoRun */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: '#000',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    lineHeight: '1.6',
                    zIndex: 1000
                }}
            >
                {dbHighScore !== null && <div>🥇 Highest Score: {dbHighScore}</div>}
                {score !== null && <div>🏁 Your Score: {score}</div>}
            </div>

            {/* Iframe chứa game */}
            <iframe
                ref={iframeRef}
                src="/game/bird/index.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Clumsy Bird"
                allowFullScreen
            />
        </div>
    );
}

export default PlayClumsyBird;
