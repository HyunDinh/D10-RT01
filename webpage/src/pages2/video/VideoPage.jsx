import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Card, List, Select, Space, Typography} from 'antd';
import ReactPlayer from 'react-player';

const {Title} = Typography;
const {Option} = Select;

export default function VideoPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ageGroupFilter, setAgeGroupFilter] = useState('ALL');

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    useEffect(() => {
        fetchVideos();
    }, [ageGroupFilter]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            let apiUrl = '';
            if (ageGroupFilter === 'ALL') {
                apiUrl = '/api/videos/student/all-approved';
            } else {
                apiUrl = `/api/videos/student/age-group/${ageGroupFilter}`;
            }
            const response = await axios.get(`http://localhost:8080${apiUrl}`, {withCredentials: true});
            setVideos(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again later.');
            setLoading(false);
        }
    };

    const handleCardClick = (videoId) => {
        navigate(`/hocho/video/${videoId}`);
    };

    if (error) {
        return (<div className="container mt-5">
            <div className="alert alert-danger">{error}</div>
        </div>);
    }

    return (<div style={{padding: '24px'}}>
        <Space style={{marginBottom: '16px'}} align="center">
            <Title level={2}>Videos for Children</Title>
            <Select
                defaultValue="ALL"
                style={{width: 120}}
                onChange={(value) => setAgeGroupFilter(value)}
            >
                <Option value="ALL">Tất cả</Option>
                <Option value="AGE_4_6">4-6 tuổi</Option>
                <Option value="AGE_7_9">7-9 tuổi</Option>
                <Option value="AGE_10_12">10-12 tuổi</Option>
                <Option value="AGE_13_15">13-15 tuổi</Option>
            </Select>
        </Space>

        <List
            loading={loading}
            grid={{gutter: 16, column: 3}}
            dataSource={videos}
            renderItem={(video) => (<List.Item>
                <Card
                    title={video.title}
                    hoverable
                    onClick={() => handleCardClick(video.videoId)} // Card click approximates title click
                >
                    <a href={`/hocho/video/${video.videoId}`}>Watch video</a>
                    {video.contentData ? (<ReactPlayer
                        url={URL.createObjectURL(new Blob([base64ToArrayBuffer(video.contentData)], {type: 'video/mp4'}))}
                        controls
                        width="100%"
                        height="auto"
                    />) : (<p>No video data available</p>)}
                    <p>Uploaded by: {video.createdBy.fullName}</p>
                </Card>
            </List.Item>)}
        />
    </div>);
}