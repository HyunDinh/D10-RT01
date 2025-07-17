import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Select, Modal, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from '../../styles/video/TeacherVideo.module.css';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { TextArea } = Input;

const EditVideoModal = ({ open, onCancel, videoId, refreshVideos }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { t } = useTranslation();

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
                    message.error(t('video_edit_load_error'));
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

            message.success(t('video_edit_success'));
            form.resetFields();
            refreshVideos();
            onCancel();
        } catch (error) {
            console.error('Error updating video:', error);
            message.error(t('video_edit_error'));
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
            title={t('video_edit_title')}
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
                            label={t('video_form_label_title')}
                            rules={[{ required: true, message: t('video_form_validation_title') }]}
                        >
                            <Input className={styles.addVideoInput} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={t('video_form_label_description')}
                            rules={[{ required: true, message: t('video_form_validation_description') }]}
                        >
                            <TextArea rows={4} className={styles.addVideoTextArea} />
                        </Form.Item>

                        <Form.Item
                            name="ageGroup"
                            label={t('video_form_label_age_group')}
                            rules={[{ required: true, message: t('video_form_validation_age_group') }]}
                        >
                            <Select className={styles.addVideoSelect} placeholder={t('video_form_label_age_group')}>
                                <Option value="AGE_4_6">4-6 years</Option>
                                <Option value="AGE_7_9">7-9 years</Option>
                                <Option value="AGE_10_12">10-12 years</Option>
                                <Option value="AGE_13_15">13-15 years</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="file"
                            label={t('video_form_label_file')}
                            valuePropName="fileList"
                            getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                            rules={[{ required: false }]}
                        >
                            <Upload beforeUpload={() => false} maxCount={1} accept="video/*">
                                <Button icon={<UploadOutlined />}>{t('video_form_upload_btn')}</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item className={styles.addVideoButtonGroup}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                className={styles.addVideoSubmitButton}
                            >
                                {t('video_form_submit_btn')}
                            </Button>
                            <Button onClick={handleCancel} className={styles.addVideoCancelButton}>
                                {t('video_form_cancel_btn')}
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </Modal>
    );
};

export default EditVideoModal;