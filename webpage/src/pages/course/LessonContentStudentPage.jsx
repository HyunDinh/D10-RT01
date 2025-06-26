import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { List, Card, Typography, Spin, Button } from 'antd';

const { Title } = Typography;

export default function LessonContentStudentPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line
  }, [lessonId]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
      setContents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải nội dung bài học.');
      setLoading(false);
    }
  };

  if (loading) return <Spin tip="Đang tải nội dung..." />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Nội dung bài học</Title>
      {contents.length === 0 ? (
        <p>Chưa có nội dung nào cho bài học này.</p>
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={contents}
          renderItem={content => (
            <List.Item>
              <Card
                title={content.title}
                extra={
                  <Button type="link" onClick={() => navigate(`/hocho/lesson-content/${content.contentId}`)}>
                    Xem chi tiết
                  </Button>
                }
              >
                <p>Loại: {content.contentType}</p>
                <p>Ngày tạo: {new Date(content.createdAt).toLocaleDateString()}</p>
              </Card>
            </List.Item>
          )}
        />
      )}
      <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>
    </div>
  );
} 