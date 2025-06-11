// File: `frontend/src/components/course/LessonContentPage.js`
import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { Button, Card, List, Typography, Space, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function LessonContentPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContents();
  }, [lessonId]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
      setContents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lesson contents:', err);
      setError('Failed to load lesson content. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
        try {
            await axios.delete(`/api/lesson-contents/${contentId}`);
            message.success('Content deleted successfully');
            fetchContents();
        } catch (error) {
            console.error('Error deleting content:', error);
            message.error('Failed to delete content');
        }
    };

    const handleEdit = (contentId) => {
        navigate(`/lesson-content/edit/${contentId}`);
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
                <Title level={2}>Lesson Contents</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/hocho/teacher/course/${courseId}/lesson/${lessonId}/content/add`)}
                >
                    Add New Content
                </Button>
                <Button onClick={() => navigate(`/hocho/teacher/course/${courseId}/lesson`)}>
                    Back to Lesson
                </Button>
            </Space>

            <List
                loading={loading}
                grid={{ gutter: 16, column: 3 }}
                dataSource={contents}
                renderItem={(content) => (
                    <List.Item>
                        <Card
                            title={content.title}
                            actions={[
                                <EditOutlined key="edit" onClick={() => handleEdit(content.contentId)} />,
                                <DeleteOutlined key="delete" onClick={() => handleDelete(content.contentId)} />,
                                <Button key="view" onClick={() => navigate(`/lesson-content/${content.contentId}`)}>
                                    View Content
                                </Button>
                            ]}
                        >
                            <p>Type: {content.contentType}</p>
                            <p>Created: {new Date(content.createdAt).toLocaleDateString()}</p>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
  );
}