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

const {Title} = Typography;

export default function TeacherVideoListPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editVideoId, setEditVideoId] = useState(null);

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
            message.success('Video deleted successfully');
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            message.error('Failed to delete video');
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'PENDING':
                return <Tag color="orange">Pending</Tag>;
            case 'APPROVED':
                return <Tag color="green">Approved</Tag>;
            case 'REJECTED':
                return <Tag color="red">Rejected</Tag>;
            default:
                return <Tag>Unknown</Tag>;
        }
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>My Video</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>My Video</li>
                    </ul>
                </div>
            </section>
            <div className={styles.myVideosContainer}>
                <Space className={styles.myVideosHeader} align="center">
                    <Title level={2} className={styles.myVideosTitle}>
                        My Videos
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        className={styles.myVideosAddButton}
                        onClick={() => setIsModalOpen(true)}
                        aria-label="Add new video"
                    >
                        Add New Video
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
                                                  aria-label="Edit video"/>,
                                    <DeleteOutlined key="delete" onClick={() => handleDelete(video.videoId)}
                                                    aria-label="Delete video"/>,
                                    <Button
                                        key="view"
                                        onClick={() => navigate(`/video/${video.videoId}`)}
                                        className={styles.myVideosViewButton}
                                        aria-label={`View video ${video.title}`}
                                    >
                                        View Video
                                    </Button>,
                                ]}
                            >
                                <p className={styles.myVideosCardStatus}>Status: {getStatusTag(video.status)}</p>
                                <p className={styles.myVideosCardCreated}>
                                    Created: {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </Card>
                        </List.Item>
                    )}
                />
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