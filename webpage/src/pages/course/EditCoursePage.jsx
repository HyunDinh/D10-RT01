import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/course/EditCourse.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';

const EditCoursePage = ({ course, onClose }) => {
    const [ageGroups, setAgeGroups] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        age_group: '',
        price: '',
        courseImageUrl: '',
        subject: '',
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const subjectOptions = [
        { value: 'MATHEMATICS', label: 'Mathematics' },
        { value: 'LITERATURE', label: 'Literature' },
        { value: 'ENGLISH', label: 'English' },
        { value: 'PHYSICS', label: 'Physics' },
        { value: 'CHEMISTRY', label: 'Chemistry' },
        { value: 'BIOLOGY', label: 'Biology' },
        { value: 'HISTORY', label: 'History' },
        { value: 'GEOGRAPHY', label: 'Geography' },
        { value: 'CIVICS', label: 'Civics' },
        { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' },
        { value: 'TECHNOLOGY', label: 'Technology' },
    ];

    useEffect(() => {
        console.log('Course Prop:', course); // Debug: Log course prop
        if (!course) {
            setError('No course data provided.');
            return;
        }
        setFormData({
            title: course.title || '',
            description: course.description || '',
            age_group: course.ageGroup || course.age_group || '',
            price: course.price || '',
            courseImageUrl: course.courseImageUrl || '',
            subject: course.subject || '',
        });
        if (course.courseImageUrl) {
            setImagePreview(getCourseImageUrl(course.courseImageUrl));
        }
        fetchAgeGroups();
    }, [course]);

    const fetchAgeGroups = async () => {
        try {
            const response = await axios.get('/api/teacher/age-groups', {
                withCredentials: true,
            });
            console.log('Age Groups:', response.data); // Debug: Log age groups
            setAgeGroups(response.data);
        } catch (error) {
            console.error('Error fetching age groups:', error);
            setError('Failed to load age groups. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setError('Please select an image file (PNG, JPG, JPEG).');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB.');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, courseImageUrl: '' });
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.courseImageUrl;
        setUploading(true);
        try {
            const imageFormData = new FormData();
            imageFormData.append('imageFile', imageFile);
            const response = await axios.post('/api/courses/upload-image', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            console.log('Image Upload Response:', response.data); // Debug: Log image upload response
            return response.data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const tempErrors = {};
        if (!formData.title) tempErrors.title = 'Course title is required.';
        if (!formData.description) tempErrors.description = 'Description is required.';
        if (!formData.age_group) tempErrors.age_group = 'Age group is required.';
        if (!formData.price || formData.price <= 0) tempErrors.price = 'Valid price is required.';
        if (!formData.subject) tempErrors.subject = 'Subject is required.';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const courseId = String(course.courseId);
        if (courseId.includes(':')) {
            setError('Invalid course ID format.');
            return;
        }

        try {
            const imageUrl = await uploadImage();
            if (imageUrl === null) return;

            const courseData = { ...formData, courseImageUrl: imageUrl };

             await axios.put(`/api/teacher/courses/${course.courseId}`, courseData, {
                withCredentials: true,
            });
            onClose();
        } catch (error) {

            if (error.response?.status === 405) {
                setError('The server does not allow this action. Please check the course ID or contact support.');
            } else if (error.response?.status === 401) {
                setError('Unauthorized. Please log in again.');
            } else {
                setError(`Failed to update course: ${error.response?.data?.message || 'Unknown error'}`);
            }
        }
    };

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return null;
        }
        const fileName = courseImageUrl.split('/').pop();
        return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.dialogOverlay}>
            <div className={styles.dialog}>
                <h2 className={styles.dialogTitle}>✏️ Edit Course</h2>
                <form className={styles.courseForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="courseName">Course Title</label>
                        <input
                            type="text"
                            id="courseName"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && <div className={styles.error}>{errors.title}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="courseImage">
                            <FontAwesomeIcon icon={faImage} /> Course Image
                        </label>
                        <div className={styles.uploadRow}>
                            <input
                                type="file"
                                id="courseImage"
                                name="courseImage"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleImageChange}
                            />
                            {uploading && <FontAwesomeIcon icon={faUpload} spin />}
                            {imagePreview && (
                                <button
                                    type="button"
                                    title="Remove image"
                                    className={styles.removeBtn}
                                    onClick={removeImage}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            )}
                        </div>
                        {imagePreview && (
                            <div className={styles.previewBox}>
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                        <small className={styles.note}>Upload PNG, JPG, or JPEG (max 10MB)</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="courseDescription">Description</label>
                        <textarea
                            id="courseDescription"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                        {errors.description && <div className={styles.error}>{errors.description}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="ageGroup">Age Group</label>
                        <select
                            id="ageGroup"
                            name="age_group"
                            value={formData.age_group}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select age group</option>
                            {ageGroups.map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                        {errors.age_group && <div className={styles.error}>{errors.age_group}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                        {errors.price && <div className={styles.error}>{errors.price}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subject">Subject</label>
                        <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select subject</option>
                            {subjectOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.subject && <div className={styles.error}>{errors.subject}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="submit" className={styles.btnPrimary} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Save Changes'}
                        </button>
                        <button type="button" className={styles.btnSecondary} onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCoursePage;