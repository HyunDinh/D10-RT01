import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function EditLessonContentPage() {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTitle, setCurrentTitle] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/lesson-contents/content/${contentId}`);
                const content = response.data;
                form.setFieldsValue({ title: content.title });
                setCurrentTitle(content.title);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lesson content:', error);
                message.error('Failed to load content for editing.');
                setLoading(false);
            }
        };
        fetchContent();
    }, [contentId, form]);

    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('title', values.title);
        if (fileList.length > 0) {
            formData.append('file', fileList[0].originFileObj);
        }

        setLoading(true);
        try {
            await axios.put(`/api/lesson-contents/${contentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            message.success('Content updated successfully');
            // Navigate back to the lesson content list (need lessonId)
            // For now, navigate to a placeholder or a known page
            // You might need to pass lessonId from the previous page or fetch it here
            navigate(-1); // Go back to the previous page
        } catch (error) {
            console.error('Error updating content:', error);
            message.error('Failed to update content');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';
        
        if (!isVideo && !isPDF) {
            message.error('You can only upload video or PDF files!');
            return Upload.LIST_IGNORE;
        }

        const isLt100M = file.size / 1024 / 1024 < 100;
        if (!isLt100M) {
            message.error('File must be smaller than 100MB!');
            return Upload.LIST_IGNORE;
        }

        return false; // Prevent auto upload
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="large" tip="Loading content..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Edit Lesson Content: {currentTitle}</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item label="Upload New File (Optional)">
                    <Upload
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        fileList={fileList}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                    <p style={{ marginTop: 8, color: '#888' }}>Leave blank to keep existing file.</p>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                    </Button>
                    <Button 
                        style={{ marginLeft: 8 }} 
                        onClick={() => navigate(-1)} // Go back to previous page
                    >
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
} 