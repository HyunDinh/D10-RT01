import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/video/TeacherVideo.module.css';

const statusMap = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function TeacherVideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoUrl = useMemo(() => {
    if (video?.contentData) {
      const binary = atob(video.contentData);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      return URL.createObjectURL(new Blob([array], { type: 'video/mp4' }));
    }
    return null;
  }, [video?.contentData]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/videos/${videoId}`, { withCredentials: true });
        setVideo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Cannot load video. Please try again later.');
        setLoading(false);
      }
    };
    fetchVideo();
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoId, videoUrl]);

  if (loading) {
    return <div className={styles.myVideosLoading}>Loading...</div>;
  }
  if (error) {
    return <div className={styles.myVideosError}>{error}</div>;
  }
  if (!video) {
    return <div className={styles.myVideosError}>Video not found.</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.teacherVideoDetailContainer}>
        <div className={styles.teacherVideoDetailMain}>
          <button className={styles.teacherVideoDetailBackBtn} onClick={() => navigate(-1)}>
            <span style={{marginRight: 6}}>←</span> Back
          </button>
          <h2 className={styles.teacherVideoDetailTitle}>{video.title}</h2>
          <div className={styles.teacherVideoDetailPlayerWrapper}>
            {videoUrl ? (
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                controls
                width="100%"
                height="100%"
                className={styles.teacherVideoDetailPlayer}
              />
            ) : (
              <div>No video data available</div>
            )}
          </div>
          <div className={styles.teacherVideoDetailInfo}>
            <p><b>Description:</b> {video.description || 'No description'}</p>
            <p><b>Status:</b> {statusMap[video.status] || video.status}</p>
            <p><b>Uploaded by:</b> {video.createdBy?.fullName || 'Unknown'}</p>
            <p><b>Created at:</b> {new Date(video.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 