import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Button, Card, List, message, Space, Tag, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import styles from '../../styles/video/TeacherVideo.module.css';
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import AddVideoModal from "./AddVideoPage";
import EditVideoModal from "./EditVideoPage";
import {useTranslation} from 'react-i18next';

const {Title} = Typography;

export default function TeacherVideoListPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editVideoId, setEditVideoId] = useState(null);
    const {t} = useTranslation();

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/videos/teacher', {withCredentials: true});
            setVideos(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again later.');
            setLoading(false);
        }
    };

    const handleEdit = (videoId) => {
        setEditVideoId(videoId);
        setIsEditModalOpen(true);
    };
    const handleDelete = async (videoId) => {
        try {
            await axios.delete(`/api/videos/teacher/${videoId}`, {withCredentials: true});
            message.success(t('video_delete_success'));
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            message.error(t('video_delete_error'));
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'PENDING':
                return <Tag color="orange">{t('video_status_pending')}</Tag>;
            case 'APPROVED':
                return <Tag color="green">{t('video_status_approved')}</Tag>;
            case 'REJECTED':
                return <Tag color="red">{t('video_status_rejected')}</Tag>;
            default:
                return <Tag>{t('video_status_unknown')}</Tag>;
        }
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{t('video_list_error')}</div>
            </div>
        );
    }

    return (
        <>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>{t('my_video')}</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('home')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>{t('my_video')}</li>
                    </ul>
                </div>
            </section>
            <div className={styles.myVideosContainer}>
                <Space className={styles.myVideosHeader} align="center">
                    <Title level={2} className={styles.myVideosTitle}>
                        {t('my_video')}
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        className={styles.myVideosAddButton}
                        onClick={() => setIsModalOpen(true)}
                        aria-label={t('video_add_btn')}
                    >
                        {t('video_add_btn')}
                    </Button>
                </Space>

                <List
                    loading={loading}
                    grid={{gutter: 16, column: 3}}
                    dataSource={videos}
                    className={styles.myVideosList}
                    renderItem={(video) => (
                        <List.Item>
                            <Card
                                title={video.title}
                                className={styles.myVideosCard}
                                actions={[
                                    <EditOutlined key="edit" onClick={() => handleEdit(video.videoId)}
                                                  aria-label={t('video_edit_btn')}/>,
                                    <DeleteOutlined key="delete" onClick={() => handleDelete(video.videoId)}
                                                    aria-label={t('video_delete_btn')}/>,
                                    <Button
                                        key="view"
                                        onClick={() => navigate(`/hocho/teacher/video/${video.videoId}`)}
                                        className={styles.myVideosViewButton}
                                        aria-label={t('video_view_btn', {title: video.title})}
                                    >
                                        {t('video_view_btn', {title: video.title})}
                                    </Button>,
                                ]}
                            >
                                <p className={styles.myVideosCardStatus}>{t('video_status_label')} {getStatusTag(video.status)}</p>
                                <p className={styles.myVideosCardCreated}>
                                    {t('video_created_at')} {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </Card>
                        </List.Item>
                    )}
                />
                {videos.length === 0 && (
                    <div className={styles.noVideos}>{t('video_list_empty')}</div>
                )}
                <AddVideoModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    refreshVideos={fetchVideos}
                />
                <EditVideoModal
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditVideoId(null);
                    }}
                    videoId={editVideoId}
                    refreshVideos={fetchVideos}
                />
            </div>
            <Footer/>
        </>

    );
}