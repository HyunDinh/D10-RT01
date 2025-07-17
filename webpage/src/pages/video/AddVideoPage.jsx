import React, {useState} from 'react';
import {Button, Form, Input, message, Modal, Select, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import axios from 'axios';
import styles from '../../styles/video/TeacherVideo.module.css';
import { useTranslation } from 'react-i18next';

const {Option} = Select;
const {TextArea} = Input;

const AddVideoModal = ({open, onCancel, refreshVideos}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

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

            message.success(t('video_add_success'));
            form.resetFields();
            refreshVideos(); // Refresh video list
            onCancel(); // Close modal
        } catch (error) {
            console.error('Error uploading video:', error);
            message.error(t('video_add_error'));
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
            title={t('video_add_title')}
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
                        label={t('video_form_label_title')}
                        rules={[{required: true, message: t('video_form_validation_title')}]}>
                        <Input className={styles.addVideoInput}/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t('video_form_label_description')}
                        rules={[{required: true, message: t('video_form_validation_description')}]}>
                        <TextArea rows={4} className={styles.addVideoTextArea}/>
                    </Form.Item>

                    <Form.Item
                        name="ageGroup"
                        label={t('video_form_label_age_group')}
                        rules={[{required: true, message: t('video_form_validation_age_group')}]}>
                        <Select placeholder={t('video_form_label_age_group')} className={styles.addVideoSelect}>
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
                        getValueFromEvent={(e) => (Array.isArray(e.fileList) ? e.fileList : e && e.fileList)}
                        rules={[{required: true, message: t('video_form_select_file')}]}>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept="video/*"
                            className={styles.addVideoUpload}
                        >
                            <Button icon={<UploadOutlined/>} className={styles.addVideoUploadButton}>
                                {t('video_form_upload_btn')}
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
                            {t('video_form_submit_btn')}
                        </Button>
                        <Button onClick={handleCancel} className={styles.addVideoCancelButton}>
                            {t('video_form_cancel_btn')}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default AddVideoModal;