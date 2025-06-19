
import { useEffect, useState } from 'react';

function PlayDino() {
    const [score, setScore] = useState(null);

    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.data === 'number') {
                console.log("🎯 Final Score from Dino:", event.data);
                setScore(event.data); // ✅ Cập nhật điểm
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* Game iframe */}
            <iframe
                src="/game/dino/index.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Dino Game"
                allowFullScreen
            />

            {/* ✅ Hiển thị điểm */}
            {score !== null && (
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
                    }}
                >
                    🏁 Your Score: {score}
                </div>
            )}
        </div>
    );
}

export default PlayDino;
