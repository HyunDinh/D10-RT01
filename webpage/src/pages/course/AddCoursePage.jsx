import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/course/AddCourse.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faImage, faUpload} from '@fortawesome/free-solid-svg-icons';
import {useNavigate} from "react-router-dom";

const AddCoursePage = ({onClose}) => {

    const [ageGroups, setAgeGroups] = useState([]);
    const subjectOptions = [
        {value: 'MATHEMATICS', label: 'Mathematics'}, {
            value: 'LITERATURE',
            label: 'Literature'
        }, {value: 'ENGLISH', label: 'English'}, {value: 'PHYSICS', label: 'Physics'}, {
            value: 'CHEMISTRY',
            label: 'Chemistry'
        }, {value: 'BIOLOGY', label: 'Biology'}, {value: 'HISTORY', label: 'History'}, {
            value: 'GEOGRAPHY',
            label: 'Geography'
        }, {value: 'CIVICS', label: 'Civics'}, {
            value: 'PHYSICAL_EDUCATION',
            label: 'Physical Education'
        }, {value: 'TECHNOLOGY', label: 'Technology'},];

    const [course, setCourse] = useState({
        title: '', description: '', age_group: '', price: '', courseImageUrl: '', subject: '',
    });

    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAgeGroups();
    }, [])

    const fetchAgeGroups = async () => {
        try {
            const response = await axios.get('/api/teacher/age-groups');
            setAgeGroups(response.data);
        } catch (error) {
            console.error('Error fetching age groups:', error);
        }
    };

    const handleChange = (e) => {
        setCourse({...course, [e.target.name]: e.target.value});
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file (PNG, JPG, JPEG)');
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('imageFile', imageFile);

            const response = await axios.post('/api/courses/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }, withCredentials: true
            });

            return response.data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const tempErrors = {};
        if (!course.title) tempErrors.title = 'Required';
        if (!course.description) tempErrors.description = 'Required';
        if (!course.age_group) tempErrors.age_group = 'Required';
        if (!course.price) tempErrors.price = 'Required';
        if (!course.subject) tempErrors.subject = 'Required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Upload image first if selected
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) return; // Stop if upload failed
            }

            // Create course with image URL
            const courseData = {
                ...course, courseImageUrl: imageUrl
            };

            await axios.post(`/api/teacher/course/add`, courseData, {
                withCredentials: true
            });
            // toast.success("Course added successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to create course. Please try again.');
        }
    };

    return (<div className={styles.dialogOverlay}>
        <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>➕ Add New Course</h2>
            <form className={styles.courseForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="courseName">Course Title</label>
                    <input
                        type="text"
                        name="title"
                        id="courseName"
                        placeholder="Enter course title"
                        value={course.title}
                        onChange={handleChange}
                        required
                    />
                    {errors.title && <div className={styles.error}>{errors.title}</div>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="courseImage">
                        <FontAwesomeIcon icon={faImage}/> Course Image
                    </label>
                    <input
                        type="file"
                        name="courseImage"
                        id="courseImage"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                    />
                    {uploading && <FontAwesomeIcon icon={faUpload} spin/>}
                    {imagePreview && (<div className={styles.previewBox}>
                        <img src={imagePreview} alt="Preview"/>
                    </div>)}
                    <small className={styles.note}>Upload PNG, JPG, JPEG (max 10MB)</small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="courseDescription">Description</label>
                    <textarea
                        name="description"
                        id="courseDescription"
                        placeholder="Enter description"
                        rows="3"
                        value={course.description}
                        onChange={handleChange}
                        required
                    />
                    {errors.description && <div className={styles.error}>{errors.description}</div>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="ageGroup">Age Group</label>
                    <select
                        name="age_group"
                        id="ageGroup"
                        value={course.age_group}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select age group</option>
                        {ageGroups.map(group => (<option key={group} value={group}>{group}</option>))}
                    </select>
                    {errors.age_group && <div className={styles.error}>{errors.age_group}</div>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        name="price"
                        id="price"
                        placeholder="Enter course price"
                        value={course.price}
                        onChange={handleChange}
                        required
                    />
                    {errors.price && <div className={styles.error}>{errors.price}</div>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <select
                        name="subject"
                        id="subject"
                        value={course.subject}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select subject</option>
                        {subjectOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                    {errors.subject && <div className={styles.error}>{errors.subject}</div>}
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button type="submit" className={styles.btnPrimary} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Add Course'}
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={(onClose) }>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>);
};
export default AddCoursePage;