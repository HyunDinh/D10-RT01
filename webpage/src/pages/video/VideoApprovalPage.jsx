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


const {Title} = Typography;

export default function VideoApprovalPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

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
            setError('Failed to load videos. Please try again later.');
            setLoading(false);
        }
    };

    const handleApprove = async (videoId) => {
        try {
            await axios.put(`/api/videos/admin/${videoId}/status?status=APPROVED`, {}, {withCredentials: true});
            message.success('Video approved successfully');
            fetchVideos();
        } catch (error) {
            console.error('Error approving video:', error);
            message.error('Failed to approve video');
        }
    };

    const showRejectModal = (video) => {
        setSelectedVideo(video);
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        try {
            await axios.put(`/api/videos/admin/${selectedVideo.videoId}/status?status=REJECTED`, {}, {withCredentials: true});
            message.success('Video rejected successfully');
            setRejectModalVisible(false);
            fetchVideos();
        } catch (error) {
            console.error('Error rejecting video:', error);
            message.error('Failed to reject video');
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
                    <p>Approval Video</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Approval Video</li>
                    </ul>
                </div>
            </section>
            <div className={styles.videoApprovalContainer}>
                <Title level={2} className={styles.videoApprovalTitle}>
                    Video Approval
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
                                            aria-label={`Approve video ${video.title}`}
                                        >
                                            Approve
                                        </Button>
                                    ),
                                    video.status === 'PENDING' && (
                                        <Button
                                            danger
                                            icon={<CloseOutlined/>}
                                            className={styles.videoApprovalRejectButton}
                                            onClick={() => showRejectModal(video)}
                                            aria-label={`Reject video ${video.title}`}
                                        >
                                            Reject
                                        </Button>
                                    ),
                                    <Button
                                        className={styles.videoApprovalViewButton}
                                        onClick={() => navigate(`/video/${video.videoId}`)}
                                        aria-label={`View video ${video.title}`}
                                    >
                                        View Video
                                    </Button>,
                                ]}
                            >
                                <p className={styles.videoApprovalCardInfo}>
                                    Uploaded by: {video.createdBy.fullName}
                                </p>
                                <p className={styles.videoApprovalCardInfo}>
                                    Created: {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                                <p className={styles.videoApprovalCardInfo}>Status: {video.status}</p>
                            </Card>
                        </List.Item>
                    )}
                />

                <Modal
                    title="Reject Video"
                    open={rejectModalVisible}
                    onOk={handleReject}
                    onCancel={() => setRejectModalVisible(false)}
                    className={styles.videoApprovalModal}
                    okText="Confirm Reject"
                    cancelText="Cancel"
                    aria-labelledby="reject-video-modal-title"
                    aria-describedby="reject-video-modal-description"
                >
                    <div id="reject-video-modal-description" className={styles.videoApprovalModalDescription}>
                        Confirmation to reject the selected video.
                    </div>
                    <p className={styles.videoApprovalModalText}>
                        Bạn có chắc chắn muốn từ chối video này không?
                    </p>
                </Modal>
            </div>
            <Footer/>
        </>
    );
}