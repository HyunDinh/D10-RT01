export const base64ToArrayBuffer = (base64) => {
    try {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (err) {
        console.error('Error decoding base64:', err);
        return null;
    }
};

