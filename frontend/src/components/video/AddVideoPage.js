import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export default function AddVideoPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('ageGroup', values.ageGroup);
            formData.append('file', values.file[0].originFileObj);

            await axios.post(
                '/api/videos/teacher',
                formData,
                { 
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true 
                }
            );
            
            message.success('Video uploaded successfully');
            navigate('/hocho/teacher/video');
        } catch (error) {
            console.error('Error uploading video:', error);
            message.error('Failed to upload video');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2>Add New Video</h2>
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
                    label="Video File"
                    rules={[{ required: true, message: 'Please upload a video!' }]}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e.fileList) ? e.fileList : e && e.fileList)}
                >
                    <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="video/*"
                    >
                        <Button icon={<UploadOutlined />}>Select Video</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Upload Video
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