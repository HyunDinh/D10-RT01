const net = require('net');
const { exec } = require('child_process');

const port = 3000;

const client = new net.Socket();
client.once('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'ECONNREFUSED') {
        // Port đang được sử dụng, tìm và kill tiến trình
        exec(`netstat -aon | findstr :${port}`, (err, stdout) => {
            if (err || !stdout) {
                console.log(`Không tìm thấy tiến trình trên port ${port}`);
                return;
            }
            const lines = stdout.split('\n');
            const pidLine = lines.find(line => line.includes(`:${port}`));
            if (pidLine) {
                const pid = pidLine.trim().split(/\s+/).pop();
                console.log(`Đang kill tiến trình ${pid} trên port ${port}...`);
                exec(`taskkill /PID ${pid} /F`, (killErr) => {
                    if (killErr) {
                        console.error(`Lỗi khi kill tiến trình ${pid}:`, killErr);
                    } else {
                        console.log(`Đã kill tiến trình ${pid}`);
                    }
                });
            }
        });
    }
    client.destroy();
});

// Kiểm tra port
client.connect(port, 'localhost', () => {
    console.log(`Port ${port} đang rảnh`);
    client.destroy();
});