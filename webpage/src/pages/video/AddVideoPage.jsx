import React, {useState} from 'react';
import {Button, Form, Input, message, Modal, Select, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import axios from 'axios';
import styles from '../../styles/video/TeacherVideo.module.css';

const {Option} = Select;
const {TextArea} = Input;

const AddVideoModal = ({open, onCancel, refreshVideos}) => {
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

            await axios.post('/api/videos/teacher', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                withCredentials: true,
            });

            message.success('Video uploaded successfully');
            form.resetFields();
            refreshVideos(); // Refresh video list
            onCancel(); // Close modal
        } catch (error) {
            console.error('Error uploading video:', error);
            message.error('Failed to upload video');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={open}
            title="Add New Video"
            onCancel={handleCancel}
            footer={null}
            className={styles.addVideoModal}
            aria-labelledby="add-video-modal-title"
            aria-describedby="add-video-modal-description"
        >
            <div className={styles.addVideoModalContent}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className={styles.addVideoForm}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{required: true, message: 'Please input the title!'}]}
                    >
                        <Input className={styles.addVideoInput}/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{required: true, message: 'Please input the description!'}]}
                    >
                        <TextArea rows={4} className={styles.addVideoTextArea}/>
                    </Form.Item>

                    <Form.Item
                        name="ageGroup"
                        label="Age Group"
                        rules={[{required: true, message: 'Please select an age group!'}]}
                    >
                        <Select placeholder="Select an age group" className={styles.addVideoSelect}>
                            <Option value="AGE_4_6">4-6 years</Option>
                            <Option value="AGE_7_9">7-9 years</Option>
                            <Option value="AGE_10_12">10-12 years</Option>
                            <Option value="AGE_13_15">13-15 years</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="Video File"
                        rules={[{required: true, message: 'Please upload a video!'}]}
                        valuePropName="fileList"
                        getValueFromEvent={(e) => (Array.isArray(e.fileList) ? e.fileList : e && e.fileList)}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept="video/*"
                            className={styles.addVideoUpload}
                        >
                            <Button icon={<UploadOutlined/>} className={styles.addVideoUploadButton}>
                                Select Video
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item className={styles.addVideoButtonGroup}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className={styles.addVideoSubmitButton}
                        >
                            Upload Video
                        </Button>
                        <Button onClick={handleCancel} className={styles.addVideoCancelButton}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default AddVideoModal;