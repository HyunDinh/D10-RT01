import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, List, Typography, Space, message, Spin, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function TeacherVideoListPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/videos/teacher', { withCredentials: true });
      setVideos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await axios.delete(`/api/videos/teacher/${videoId}`, { withCredentials: true });
      message.success('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      message.error('Failed to delete video');
    }
  };

  const handleEdit = (videoId) => {
    navigate(`/hocho/teacher/video/edit/${videoId}`);
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
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }} align="center">
        <Title level={2}>My Videos</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/hocho/teacher/video/add')}
        >
          Add New Video
        </Button>
      </Space>

      <List
        loading={loading}
        grid={{ gutter: 16, column: 3 }}
        dataSource={videos}
        renderItem={(video) => (
          <List.Item>
            <Card
              title={video.title}
              actions={[
                <EditOutlined key="edit" onClick={() => handleEdit(video.videoId)} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(video.videoId)} />,
                <Button key="view" onClick={() => navigate(`/video/${video.videoId}`)}>
                  View Video
                </Button>
              ]}
            >
              <p>Status: {getStatusTag(video.status)}</p>
              <p>Created: {new Date(video.createdAt).toLocaleDateString()}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
} 