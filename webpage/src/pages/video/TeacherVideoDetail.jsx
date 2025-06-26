import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/video/TeacherVideo.module.css';

const statusMap = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
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
        setError('Không thể tải video. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    fetchVideo();
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoId, videoUrl]);

  if (loading) {
    return <div className={styles.myVideosLoading}>Đang tải...</div>;
  }
  if (error) {
    return <div className={styles.myVideosError}>{error}</div>;
  }
  if (!video) {
    return <div className={styles.myVideosError}>Không tìm thấy video.</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.teacherVideoDetailContainer}>
        <div className={styles.teacherVideoDetailMain}>
          <button className={styles.teacherVideoDetailBackBtn} onClick={() => navigate(-1)}>
            <span style={{marginRight: 6}}>←</span> Quay lại
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
              <div>Không có dữ liệu video</div>
            )}
          </div>
          <div className={styles.teacherVideoDetailInfo}>
            <p><b>Mô tả:</b> {video.description || 'Không có mô tả'}</p>
            <p><b>Trạng thái:</b> {statusMap[video.status] || video.status}</p>
            <p><b>Người đăng:</b> {video.createdBy?.fullName || 'Không rõ'}</p>
            <p><b>Ngày tạo:</b> {new Date(video.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 