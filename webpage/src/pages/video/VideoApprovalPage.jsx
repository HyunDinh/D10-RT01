import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Button, Card, List, message, Modal, Typography} from 'antd';
import {CheckOutlined, CloseOutlined} from '@ant-design/icons';
import styles from '../../styles/video/AdminVideo.module.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from 'react-i18next';

const {Title} = Typography;

export default function VideoApprovalPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const {t} = useTranslation();

    const statusLabels = {
        PENDING: t('video_status_pending'),
        APPROVED: t('video_status_approved'),
        REJECTED: t('video_status_rejected'),
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/videos/admin/all', {withCredentials: true});
            setVideos(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError(t('video_fetch_error'));
            setLoading(false);
        }
    };

    const handleApprove = async (videoId) => {
        try {
            await axios.put(`/api/videos/admin/${videoId}/status?status=APPROVED`, {}, {withCredentials: true});
            message.success(t('video_approve_success'));
            fetchVideos();
        } catch (error) {
            console.error('Error approving video:', error);
            message.error(t('video_approve_error'));
        }
    };

    const showRejectModal = (video) => {
        setSelectedVideo(video);
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        try {
            await axios.put(`/api/videos/admin/${selectedVideo.videoId}/status?status=REJECTED`, {}, {withCredentials: true});
            message.success(t('video_reject_success'));
            setRejectModalVisible(false);
            fetchVideos();
        } catch (error) {
            console.error('Error rejecting video:', error);
            message.error(t('video_reject_error'));
        }
    };

    if (error) {
        return (
            <div className={styles.videoApprovalContainer}>
                <div className={styles.videoApprovalError} aria-live="polite">
                    {error}
                </div>
            </div>
        );
    }

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>{t('video_approval_title')}</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('home_link')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>{t('video_approval_title')}</li>
                    </ul>
                </div>
            </section>
            <div className={styles.videoApprovalContainer}>
                <Title level={2} className={styles.videoApprovalTitle}>
                    {t('video_approval_title')}
                </Title>

                <List
                    loading={loading}
                    grid={{gutter: 16, column: 3}}
                    dataSource={videos}
                    className={styles.videoApprovalList}
                    renderItem={(video) => (
                        <List.Item>
                            <Card
                                title={video.title}
                                className={styles.videoApprovalCard}
                                actions={[
                                    video.status === 'PENDING' && (
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined/>}
                                            className={styles.videoApprovalApproveButton}
                                            onClick={() => handleApprove(video.videoId)}
                                            aria-label={t('video_approve_aria_label', {title: video.title})}
                                        >
                                            {t('video_approve_btn')}
                                        </Button>
                                    ),
                                    video.status === 'PENDING' && (
                                        <Button
                                            danger
                                            icon={<CloseOutlined/>}
                                            className={styles.videoApprovalRejectButton}
                                            onClick={() => showRejectModal(video)}
                                            aria-label={t('video_reject_aria_label', {title: video.title})}
                                        >
                                            {t('video_reject_btn')}
                                        </Button>
                                    ),
                                    <Button
                                        className={styles.videoApprovalViewButton}
                                        onClick={() => navigate(`/hocho/teacher/video/${video.videoId}`)}
                                        aria-label={t('video_view_aria_label', {title: video.title})}
                                    >
                                        {t('video_view_btn')}
                                    </Button>,
                                ]}
                            >
                                <p className={styles.videoApprovalCardInfo}>
                                    {t('video_uploaded_by')}: {video.createdBy.fullName}
                                </p>
                                <p className={styles.videoApprovalCardInfo}>
                                    {t('video_created_at')}: {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                                <p className={styles.videoApprovalCardInfo}>{t('video_status')}: {statusLabels[video.status]}</p>
                            </Card>
                        </List.Item>
                    )}
                />

                <Modal
                    title={t('video_reject_modal_title')}
                    open={rejectModalVisible}
                    onOk={handleReject}
                    onCancel={() => setRejectModalVisible(false)}
                    className={styles.videoApprovalModal}
                    okText={t('video_reject_modal_ok')}
                    cancelText={t('video_reject_modal_cancel')}
                    aria-labelledby="reject-video-modal-title"
                    aria-describedby="reject-video-modal-description"
                >
                    <div id="reject-video-modal-description" className={styles.videoApprovalModalDescription}>
                        {t('video_reject_modal_description')}
                    </div>
                    <p className={styles.videoApprovalModalText}>
                        {t('video_reject_modal_text')}
                    </p>
                </Modal>
            </div>
            <Footer/>
        </>
    );
}