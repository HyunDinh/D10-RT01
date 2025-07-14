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
import {base64ToArrayBuffer} from '../../components/videoUtils'; // Move function to util file

export default function VideoPlayer() {
    const {videoId} = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const playedSecondsRef = useRef(0);
    const [video, setVideo] = useState(null);
    const [suggestedVideos, setSuggestedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping] = useState(false);
    const [maxVideoTime, setMaxVideoTime] = useState(null); // in seconds
    const [remainingTime, setRemainingTime] = useState(null); // in seconds
    const [pageSuspended] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true); // NEW: track playing state
    const timerRef = useRef(null); // NEW: timer interval ref


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
                const suggestedResponse = await axios.get(`/api/videos/student/all-approved?excludeVideoId=${videoId}`, {withCredentials: true});
                setSuggestedVideos(suggestedResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching video or suggestions:', err);
                setError('Cannot load video. Please try again later.');
                setLoading(false);
            }
        };
        fetchVideoAndSuggestions();
    }, [videoId]);


    // Fetch maxVideoTime from the DB via time restrictions endpoint.
    useEffect(() => {
        const fetchTimeRestrictions = async () => {
            try {
                const response = await axios.get(`/api/time-restriction/get/by-child`, {withCredentials: true});
                if (response.data) {
                    const maxTime = response.data.maxVideoTime; // expected in seconds
                    setMaxVideoTime(maxTime);
                    setRemainingTime(maxTime);
                    console.log('Max time: ', maxTime);
                }
            } catch (err) {
                console.error('Error fetching time restrictions:', err);
            }
        };
        fetchTimeRestrictions();
    }, []);

    useEffect(() => {
        // Khi load lại trang, nếu có thời gian chưa gửi thì gửi lên backend
        const saved = Number(localStorage.getItem('videoPlayedSeconds') || 0);
        if (saved > 0) {
            playedSecondsRef.current = saved;
            updateTimeSpent();
            localStorage.removeItem('videoPlayedSeconds');
        }
    }, []);

    // Dọn dẹp URL và gửi thời gian còn lại khi chuyển trang
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
            if (playedSecondsRef.current > 0) {
                updateTimeSpent();
                localStorage.removeItem('videoPlayedSeconds');
            }
        };
    }, [videoUrl]);

    // Timer effect: decrement remainingTime every second when playing
    useEffect(() => {
        if (isPlaying && maxVideoTime !== null && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev > 1) return prev - 1;
                    // Time's up
                    setIsPlaying(false);
                    clearInterval(timerRef.current);
                    // Optionally, call updateTimeSpent() here
                    return 0;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, maxVideoTime]);

    // If time runs out, show suspension message
    if (remainingTime === 0) {
        return (
            <>
                <Header/>
                <div className={styles.videoDetailContainer}>
                    <div className={styles.videoDetailError}>
                        Video time limit reached. Please contact your parents.
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    // Function to update the backend with the time spent
    const updateTimeSpent = () => {
        const timeSpent = playedSecondsRef.current;
        const childId = localStorage.getItem('childId');
        axios.post(`/api/time-restriction/subtract`, {childId, timeSpent})
            .then(response => {
                console.log('Time limit updated:', response.data.maxVideoTime);
            })
            .catch(err => {
                console.error('Error updating time spent:', err);
            });
    };


    const handleSuggestedVideoClick = (suggestedVideoId) => {
        navigate(`/hocho/video/${videoId}`);
    };

    // Format remaining time as mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (<div className={styles.videoDetailContainer}>
                <div className={styles.videoDetailError}>{error}</div>
            </div>);
    }

    if (loading) {
        return (<div className={styles.videoDetailContainer}>
                <div className={styles.videoDetailLoading}></div>
            </div>);
    }

    if (pageSuspended) {
        return (<>
                <Header/>
                <div className={styles.videoDetailContainer}>
                    <div className={styles.videoDetailError}>
                        Video time limit reached. Please contact your parents.
                    </div>
                </div>
                <Footer/>
            </>);
    }

    return (<>
            <Header/>
            <section className={styles.videoDetailContainer}>
                <div className={styles.videoDetailMain}>
                    <h2>{maxVideoTime !== null ? `Time remaining: ${formatTime(remainingTime ?? maxVideoTime)}` : ' '}</h2>
                    <div className={styles.videoDetailPlayerWrapper}>
                        {video.contentData ? (isTyping ? (
                                <div className={styles.videoDetailPlayerPlaceholder} aria-live="polite">
                                    {video.thumbnailUrl ? (<img
                                            src={video.thumbnailUrl}
                                            alt={`Thumbnail for ${video.title}`}
                                            className={styles.videoDetailPlaceholderThumbnail}
                                        />) : (<div className={styles.videoDetailPlaceholderNoThumbnail}>
                                            Loading...
                                        </div>)}
                                    <div className={styles.videoDetailSpinner}></div>
                                </div>) : (<ReactPlayer
                                    ref={playerRef}
                                    url={videoUrl}
                                    controls
                                    playing={isPlaying && remainingTime > 0}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                    className={styles.videoDetailPlayer}
                                    width="100%"
                                    height="100%"
                                    aria-label={`Video: ${video.title}`}
                                    config={{
                                        attributes: {
                                            controlsList: 'nodownload',
                                        },
                                    }}
                                />)) : (<div className={styles.videoDetailNoVideo} aria-live="polite">
                                No video data available
                            </div>)}
                    </div>
                    <h2 className={styles.videoDetailTitle}>{video.title}</h2>
                    <p className={styles.videoDetailUploadedBy}>Uploaded by: {video.createdBy.fullName}</p>
                    <CommentSection videoId={videoId} playerRef={playerRef} playedSecondsRef={playedSecondsRef}/>
                </div>

                <aside className={styles.videoDetailSuggested}>
                    <h3 className={styles.videoDetailSuggestedTitle}>Suggested Videos</h3>
                    <ListVideo
                        videos={suggestedVideos}
                        onCardClick={handleSuggestedVideoClick}
                        className={suggestedStyles.videoSuggestedList}
                    />
                </aside>
            </section>
            <Footer/>
        </>);
}
