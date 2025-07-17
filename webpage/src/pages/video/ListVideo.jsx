import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import styles from '../../styles/video/VideoPage.module.css';
import {base64ToArrayBuffer} from '../../components/videoUtils';
import { useTranslation } from 'react-i18next';

const ListVideo = ({videos = [], onCardClick, className = ''}) => {
    const [playingVideoId, setPlayingVideoId] = useState(null); // ID of the currently playing video
    const [hoveredVideoId, setHoveredVideoId] = useState(null); // ID of the currently hovered video
    const playerRefs = useRef({}); // Store reference to ReactPlayer
    const { t } = useTranslation();

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
        setPlayingVideoId(videoId); // Play the hovered video
        setHoveredVideoId(videoId); // Set hover state
        // Reset video to start
        if (playerRefs.current[videoId]) {
            playerRefs.current[videoId].seekTo(0, 'seconds');
        }
    };

    // Xử lý khi rời chuột
    const handleMouseLeave = (videoId) => {
        setPlayingVideoId(null); // Stop video
        setHoveredVideoId(null); // Remove hover state
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
                <p className={styles.videoPageNoVideo}>{t('video_list_no_videos')}</p>
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
                    aria-label={t('video_list_watch_video', { title: video.title })}
                >
                    <div className={styles.videoPageCardBody}>
                        <div className={styles.videoPagePlayerWrapper}>
                            <ReactPlayer
                                ref={(player) => (playerRefs.current[video.videoId] = player)}
                                url={videoUrls[video.videoId]}
                                controls={hoveredVideoId === video.videoId} // Show controls on hover
                                className={styles.videoPagePlayer}
                                width="100%"
                                height="100%"
                                playing={playingVideoId === video.videoId} // Play on hover
                                muted={true}
                                aria-label={t('video_list_video', { title: video.title })}
                                config={{
                                    attributes: {controlsList: 'nodownload'},
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.bottomVideo}>
                        <img 
                            src={video.createdBy?.avatarUrl && video.createdBy.avatarUrl !== 'none'
                                ? `http://localhost:8080/api/hocho/profile/${video.createdBy.avatarUrl}`
                                : '/images/default-avatar.png'}
                            alt={t('video_list_teacher_avatar')}
                            className={styles.userAvatar}
                            onError={e => { e.target.src = '/images/default-avatar.png'; }}
                        />
                        <div className={styles.bottomVideoTitle}>
                            <h3 className={styles.videoPageCardTitle}>{video.title}</h3>
                            <p className={styles.videoPageUploadedBy}>
                                {t('video_list_uploaded_by', { fullName: video.createdBy?.fullName || t('video_list_unknown') })}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default ListVideo;