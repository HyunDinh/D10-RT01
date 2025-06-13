import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Spin, message } from 'antd';

export default function VideoPlayer() {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fileBuffer, setFileBuffer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndProcessVideo = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/videos/${videoId}`);
                const fetchedVideo = response.data;
                setVideo(fetchedVideo);

                if (fetchedVideo && fetchedVideo.contentData) {
                    const arrayBuffer = base64ToArrayBuffer(fetchedVideo.contentData);
                    const newBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
                    setFileBuffer(arrayBuffer);
                } else {
                    message.error('Không thể tải video: dữ liệu bị thiếu hoặc không hợp lệ.');
                    setFileBuffer(null);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching video:', error);
                message.error('Failed to load video');
                setLoading(false);
                setFileBuffer(null);
            }
        };

        fetchAndProcessVideo();
    }, [videoId]);

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (!video) {
        return <div>Video not found</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2>{video.title}</h2>
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                {fileBuffer ? (
                    <ReactPlayer
                        url={URL.createObjectURL(new Blob([fileBuffer], { type: 'video/mp4' }))}
                        controls
                        width="100%"
                        height="auto"
                    />
                ) : (
                    <div>Loading video...</div>
                )}
            </div>
        </div>
    );
} 