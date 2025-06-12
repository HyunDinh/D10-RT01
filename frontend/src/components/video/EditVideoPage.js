import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Upload, message, Spin, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export default function EditVideoPage() {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/videos/${videoId}`, { withCredentials: true });
                const videoData = response.data;
                form.setFieldsValue({
                    title: videoData.title,
                    description: videoData.description,
                    ageGroup: videoData.ageGroup,
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching video for edit:', error);
                message.error('Failed to load video data.');
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId, form]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('ageGroup', values.ageGroup);
            if (values.file && values.file[0] && values.file[0].originFileObj) {
                formData.append('file', values.file[0].originFileObj);
            }

            await axios.put(
                `/api/videos/teacher/${videoId}`,
                formData,
                { 
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true 
                }
            );
            
            message.success('Video updated successfully');
            navigate('/hocho/teacher/video');
        } catch (error) {
            console.error('Error updating video:', error);
            message.error('Failed to update video');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2>Edit Video</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: '600px' }}
            >
                <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input the description!' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="ageGroup"
                    label="Age Group"
                    rules={[{ required: true, message: 'Please select an age group!' }]}
                >
                    <Select placeholder="Select an age group">
                        <Option value="AGE_4_6">4-6 years</Option>
                        <Option value="AGE_7_9">7-9 years</Option>
                        <Option value="AGE_10_12">10-12 years</Option>
                        <Option value="AGE_13_15">13-15 years</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Replace Video File (Optional)"
                >
                    <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="video/*"
                    >
                        <Button icon={<UploadOutlined />}>Select New Video</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Update Video
                    </Button>
                    <Button 
                        style={{ marginLeft: '8px' }} 
                        onClick={() => navigate('/hocho/teacher/video')}
                    >
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
} 