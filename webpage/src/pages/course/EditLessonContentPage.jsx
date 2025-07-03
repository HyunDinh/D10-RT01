import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Form, Input, Upload} from 'antd';
import styles from '../../styles/lesson/EditLessonContent.module.css';

const EditLessonContentPage = ({showModal, closeModal, contentId, lessonId, courseId, onContentUpdated}) => {
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
                form.setFieldsValue({title: content.title});
                setCurrentTitle(content.title);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lesson content:', error);
                alert('Failed to load content for editing.');
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
            alert('Content updated successfully');
            onContentUpdated();
            closeModal();
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Failed to update content');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';

        if (!isVideo && !isPDF) {
            alert('You can only upload video or PDF files!');
            return Upload.LIST_IGNORE;
        }

        const isLt100M = file.size / 1024 / 1024 < 100;
        if (!isLt100M) {
            alert('File must be smaller than 100MB!');
            return Upload.LIST_IGNORE;
        }

        return false; // Prevent auto upload
    };

    const handleChange = ({fileList}) => {
        setFileList(fileList);
    };

    return (<div className={styles.card}>
            <div className={styles.cardHeader}>
                <h4>Edit Lesson Content: {currentTitle}</h4>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            <div className={styles.cardBody}>
                {loading ? (<div className={styles.loading}>Loading content...</div>) : (<Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className={styles.form}
                    >
                        <Form.Item
                            name="title"
                            label={<span className={styles.formLabel}>Title</span>}
                            rules={[{required: true, message: 'Please input the title!'}]}
                        >
                            <Input className={styles.formControl}/>
                        </Form.Item>

                        <Form.Item label={<span className={styles.formLabel}>Upload New File (Optional)</span>}>
                            <Upload
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                fileList={fileList}
                                maxCount={1}
                            >
                                <Button className={styles.btn}>
                                    Select File
                                </Button>
                            </Upload>
                            <p className={styles.textDanger}>Leave blank to keep existing file.</p>
                        </Form.Item>

                        <Form.Item className={styles.formGroupButton}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className={`${styles.btn} ${styles.btnSuccess}`}
                            >
                                Save Changes
                            </Button>
                            <Button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>)}
            </div>
        </div>);
};

export default EditLessonContentPage;