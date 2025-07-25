import {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

function PlayDinoRun() {
    const [userId, setUserId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [score, setScore] = useState(null);
    const [highScore, setHighScore] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const iframeRef = useRef();

    // ✅ B1: Lấy userId và gameId khi mở trang
    useEffect(() => {
        axios.get('/api/games/userInfo?titleGame=Dino Run', {withCredentials: true})
            .then(res => {
                const {userId, gameId} = res.data;
                setUserId(userId);
                setGameId(gameId);

                // ✅ B2: Lấy điểm cao nhất
                return axios.get(`/api/games/highScore?userId=${userId}&gameId=${gameId}`, {
                    withCredentials: true
                });
            })
            .then(res => {
                setHighScore(res.data.highScore);
            })
            .catch(err => {
                console.error("❌ Lỗi khi lấy thông tin người dùng và game:", err);
            });
    }, []);

    // ✅ B3: Nhận điểm từ game iframe sau khi chơi
    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.data === 'number') {
                const newScore = event.data;
                setScore(newScore);
                setGameStarted(true);

                // ✅ Nếu điểm mới lớn hơn highScore → lưu DB + cập nhật UI
                if (userId && gameId && (highScore === null || newScore > highScore)) {
                    axios.post('/api/games/saveScore', null, {
                        params: {
                            userId, gameId, score: newScore
                        }, withCredentials: true
                    }).then(() => {
                        setHighScore(newScore); // ✅ Cập nhật highScore trong UI
                    }).catch(err => {
                        console.error("❌ Lỗi khi lưu điểm:", err);
                    });
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [userId, gameId, highScore]); // 👈 cần để phản ứng đúng với mỗi lần thay đổi

    return (<>
            <Header/>

            <div style={{width: '100vw', height: '100vh', position: 'relative'}}>
                <iframe
                    ref={iframeRef}
                    src="/game/dino/index.html"
                    width="100%"
                    height="100%"
                    style={{border: 'none'}}
                    title="Dino Game"
                    allowFullScreen
                />

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
                    }}
                >
                    {highScore !== null && <div>🥇 Highest Score: {highScore}</div>}
                    {gameStarted && score !== null && <div>🏁 Your Score: {score}</div>}
                </div>
            </div>
            <Footer/>
        </>);
}

export default PlayDinoRun;
