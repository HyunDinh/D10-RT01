import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/video/VideoPlayer.module.css';
import suggestedStyles from '../../styles/video/SuggestedVideos.module.css';
import CommentSection from './CommentSection';
import ListVideo from './ListVideo';
import {base64ToArrayBuffer} from '../../components/videoUtils'; // Tách hàm ra file util

export default function VideoPlayer() {
    const {videoId} = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const playedSecondsRef = useRef(0);
    const [video, setVideo] = useState(null);
    const [suggestedVideos, setSuggestedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const videoUrl = useMemo(() => {
        if (video?.contentData) {
            const buffer = base64ToArrayBuffer(video.contentData);
            if (buffer) {
                return URL.createObjectURL(new Blob([buffer], {type: 'video/mp4'}));
            }
        }
        return null;
    }, [video?.contentData]);

    useEffect(() => {
        const fetchVideoAndSuggestions = async () => {
            try {
                setLoading(true);
                // Fetch main video
                const videoResponse = await axios.get(`/api/videos/${videoId}`, {
                    withCredentials: true,
                });
                setVideo(videoResponse.data);

                // Fetch suggested videos
                const suggestedResponse = await axios.get(
                    `/api/videos/student/all-approved?excludeVideoId=${videoId}`,
                    {withCredentials: true}
                );
                setSuggestedVideos(suggestedResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching video or suggestions:', err);
                setError('Không thể tải video. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };
        fetchVideoAndSuggestions();
    }, [videoId]);

// Dọn dẹp URL
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    const handleEnded = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
            playerRef.current.getInternalPlayer().play();
        }
    };

    const handleError = (e) => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
            playerRef.current.getInternalPlayer().play();
        }
    };

    const handleSuggestedVideoClick = (suggestedVideoId) => {
        navigate(`/hocho/video/${videoId}`);
    };

    if (error) {
        return (
            <div className={styles.videoDetailContainer}>
                <div className={styles.videoDetailError}>{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.videoDetailContainer}>
                <div className={styles.videoDetailLoading}></div>
            </div>
        );
    }

    return (
        <>
            <Header/>
            <section className={styles.videoDetailContainer}>
                <div className={styles.videoDetailMain}>
                    <h2 className={styles.videoDetailTitle}>{video.title}</h2>
                    <div className={styles.videoDetailPlayerWrapper}>
                        {video.contentData ? (
                            isTyping ? (
                                <div className={styles.videoDetailPlayerPlaceholder} aria-live="polite">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={`Thumbnail for ${video.title}`}
                                            className={styles.videoDetailPlaceholderThumbnail}
                                        />
                                    ) : (
                                        <div className={styles.videoDetailPlaceholderNoThumbnail}>
                                            Đang tải...
                                        </div>
                                    )}
                                    <div className={styles.videoDetailSpinner}></div>
                                </div>
                            ) : (
                                <ReactPlayer
                                    ref={playerRef}
                                    url={videoUrl}
                                    controls
                                    playing
                                    className={styles.videoDetailPlayer}
                                    width="100%"
                                    height="100%"
                                    aria-label={`Video: ${video.title}`}
                                    config={{
                                        attributes: {
                                            controlsList: 'nodownload',
                                        },
                                    }}
                                    onReady={() => {
                                        if (playerRef.current && playedSecondsRef.current > 0) {
                                            playerRef.current.seekTo(playedSecondsRef.current, 'seconds');
                                        }
                                    }}
                                    onEnded={handleEnded}
                                    onError={handleError}
                                />
                            )
                        ) : (
                            <div className={styles.videoDetailNoVideo} aria-live="polite">
                                Không có dữ liệu video
                            </div>
                        )}
                    </div>
                    <p className={styles.videoDetailUploadedBy}>Tải lên bởi: {video.createdBy.fullName}</p>
                    <CommentSection videoId={videoId} playerRef={playerRef} playedSecondsRef={playedSecondsRef}/>
                </div>

                <aside className={styles.videoDetailSuggested}>
                    <h3 className={styles.videoDetailSuggestedTitle}>Video gợi ý</h3>
                    <ListVideo
                        videos={suggestedVideos}
                        onCardClick={handleSuggestedVideoClick}
                        className={suggestedStyles.videoSuggestedList}
                    />
                </aside>
            </section>
            <Footer/>
        </>
    );
}