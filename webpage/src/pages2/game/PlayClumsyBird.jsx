import React, { useEffect, useState, useRef } from 'react';

function PlayClumsyBird() {
    const [score, setScore] = useState(null);
    const [highScore, setHighScore] = useState(null);
    const iframeRef = useRef();

    useEffect(() => {
        const handleMessage = (event) => {
            console.log("📥 Received from iframe:", event.data);

            if (event.data?.type === 'CLUMSY_BIRD_SCORE') {
                setScore(event.data.steps);
                setHighScore(event.data.highScore);
            }
        };


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
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            {/* Khung hiển thị điểm */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, background: '#fff', padding: '10px', borderRadius: '8px' }}>
                {score !== null && (
                    <div>
                        <strong>Score:</strong> {score}<br />
                        <strong>High Score:</strong> {highScore}
                    </div>
                )}
            </div>


            <iframe
                ref={iframeRef}
                src="/game/bird/index.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Clumsy Bird"
                allow="fullscreen"
            />
        </div>
    );
}

export default PlayClumsyBird;
