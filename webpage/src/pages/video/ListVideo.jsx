import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import styles from '../../styles/video/VideoPage.module.css';
import {base64ToArrayBuffer} from '../../components/videoUtils';

const ListVideo = ({videos = [], onCardClick, className = ''}) => {
    const [playingVideoId, setPlayingVideoId] = useState(null); // ID của video đang phát
    const [hoveredVideoId, setHoveredVideoId] = useState(null); // ID của video đang hover
    const playerRefs = useRef({}); // Lưu tham chiếu đến ReactPlayer

    // Tạo danh sách video URLs một lần duy nhất
    const videoUrls = useMemo(() => {
        const urls = {};
        videos.forEach((video) => {
            if (video.contentData) {
                const buffer = base64ToArrayBuffer(video.contentData);
                if (buffer) {
                    urls[video.videoId] = URL.createObjectURL(new Blob([buffer], {type: 'video/mp4'}));
                }
            }
        });
        return urls;
    }, [videos]);

    // Dọn dẹp URLs khi component unmount hoặc videos thay đổi
    useEffect(() => {
        return () => {
            Object.values(videoUrls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [videoUrls]);

    // Xử lý khi hover vào video
    const handleMouseEnter = (videoId) => {
        setPlayingVideoId(videoId); // Phát video được hover
        setHoveredVideoId(videoId); // Đặt trạng thái hover
        // Đặt lại video từ đầu
        if (playerRefs.current[videoId]) {
            playerRefs.current[videoId].seekTo(0, 'seconds');
        }
    };

    // Xử lý khi rời chuột
    const handleMouseLeave = (videoId) => {
        setPlayingVideoId(null); // Dừng video
        setHoveredVideoId(null); // Xóa trạng thái hover
    };

    // Xử lý khi phím được nhấn
    const handleKeyDown = (e, videoId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCardClick(videoId);
        }
    };

    // Hàm định dạng thời lượng (giả định duration là số giây)
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!videos.length) {
        return (
            <div className={styles.videoPageContainer}>
                <p className={styles.videoPageNoVideo}>Không có video nào để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className={`${styles.videoPageList} ${className}`}>
            {videos.map((video) => (
                <article
                    key={video.videoId}
                    className={styles.videoPageCard}
                    onClick={() => onCardClick(video.videoId)}
                    onMouseEnter={() => handleMouseEnter(video.videoId)}
                    onMouseLeave={() => handleMouseLeave(video.videoId)}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, video.videoId)}
                    role="button"
                    aria-label={`Xem video ${video.title}`}
                >
                    <div className={styles.videoPageCardBody}>
                        <div className={styles.videoPagePlayerWrapper}>
                            <ReactPlayer
                                ref={(player) => (playerRefs.current[video.videoId] = player)}
                                url={videoUrls[video.videoId]}
                                controls={hoveredVideoId === video.videoId} // Hiển  thị controls khi hover
                                className={styles.videoPagePlayer}
                                width="100%"
                                height="100%"
                                playing={playingVideoId === video.videoId} // Phát khi hover
                                muted={true}
                                aria-label={`Video: ${video.title}`}
                                config={{
                                    attributes: {controlsList: 'nodownload'},
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.bottomVideo}>
                        <img src="/logo.png" alt="User Avatar" className={styles.userAvatar}/>
                        <div className={styles.bottomVideoTitle}>
                            <h3 className={styles.videoPageCardTitle}>{video.title}</h3>
                            <p className={styles.videoPageUploadedBy}>
                                Tải lên bởi: {video.createdBy?.fullName || 'Không rõ'}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default ListVideo;