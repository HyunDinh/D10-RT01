import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Select, Modal, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from '../../styles/video/TeacherVideo.module.css';

const { Option } = Select;
const { TextArea } = Input;

const EditVideoModal = ({ open, onCancel, videoId, refreshVideos }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && videoId) {
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
        }
    }, [open, videoId, form]);

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

            await axios.put(`/api/videos/teacher/${videoId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            message.success('Video updated successfully');
            form.resetFields();
            refreshVideos();
            onCancel();
        } catch (error) {
            console.error('Error updating video:', error);
            message.error('Failed to update video');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={open}
            title="Edit Video"
            onCancel={handleCancel}
            footer={null}
            className={styles.addVideoModal}
            aria-labelledby="edit-video-modal-title"
            aria-describedby="edit-video-modal-description"
        >
            <div className={styles.addVideoModalContent}>
                {loading ? (
                    <Spin size="large" className={styles.editVideoSpinner} />
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className={styles.addVideoForm}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please input the title!' }]}
                        >
                            <Input className={styles.addVideoInput} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please input the description!' }]}
                        >
                            <TextArea rows={4} className={styles.addVideoTextArea} />
                        </Form.Item>

                        <Form.Item
                            name="ageGroup"
                            label="Age Group"
                            rules={[{ required: true, message: 'Please select an age group!' }]}
                        >
                            <Select placeholder="Select an age group" className={styles.addVideoSelect}>
                                <Option value="AGE_4_6">4-6 years</Option>
                                <Option value="AGE_7_9">7-9 years</Option>
                                <Option value="AGE_10_12">10-12 years</Option>
                                <Option value="AGE_13_15">13-15 years</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="file" label="Replace Video File (Optional)">
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                accept="video/*"
                                className={styles.addVideoUpload}
                            >
                                <Button icon={<UploadOutlined />} className={styles.addVideoUploadButton}>
                                    Select New Video
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item className={styles.addVideoButtonGroup}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                className={styles.addVideoSubmitButton}
                            >
                                Update Video
                            </Button>
                            <Button onClick={handleCancel} className={styles.addVideoCancelButton}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </Modal>
    );
};

export default EditVideoModal;