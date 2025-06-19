
function PlayClumsyBird() {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <iframe
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
