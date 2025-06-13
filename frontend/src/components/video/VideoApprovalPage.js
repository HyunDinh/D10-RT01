import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, List, Typography, Space, message, Spin, Modal } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;

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
      const response = await axios.get('/api/videos/admin/all', { withCredentials: true });
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
      await axios.put(`/api/videos/admin/${videoId}/status?status=APPROVED`, {}, { withCredentials: true });
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
      await axios.put(`/api/videos/admin/${selectedVideo.videoId}/status?status=REJECTED`, {}, { withCredentials: true });
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
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Video Approval</Title>

      <List
        loading={loading}
        grid={{ gutter: 16, column: 3 }}
        dataSource={videos}
        renderItem={(video) => (
          <List.Item>
            <Card
              title={video.title}
              actions={[
                video.status === 'PENDING' && (
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(video.videoId)}
                  >
                    Approve
                  </Button>
                ),
                video.status === 'PENDING' && (
                  <Button 
                    danger 
                    icon={<CloseOutlined />}
                    onClick={() => showRejectModal(video)}
                  >
                    Reject
                  </Button>
                ),
                <Button onClick={() => navigate(`/video/${video.videoId}`)}>
                  View Video
                </Button>
              ]}
            >
              <p>Uploaded by: {video.createdBy.fullName}</p>
              <p>Created: {new Date(video.createdAt).toLocaleDateString()}</p>
              <p>Status: {video.status}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Reject Video"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
        }}
      >
        <p>Bạn có chắc chắn muốn từ chối video này không?</p>
      </Modal>
    </div>
  );
} 