import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/course/CoursePublic.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export default function EditCoursePage() {
    const [ageGroups, setAgeGroups] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState({
        title: '',
        description: '',
        age_group: '',
        price: '',
        courseImageUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!location.state?.course) {
            navigate('/hocho/teacher/course');
            return;
        }
        setCourse(location.state.course);
        if (location.state.course.courseImageUrl) {
            setImagePreview(getCourseImageUrl(location.state.course.courseImageUrl));
        }
        fetchAgeGroups();
    }, [location.state, navigate]);

    const fetchAgeGroups = async () => {
        try {
            const response = await axios.get('/api/teacher/age-groups', {
                withCredentials: true
            });
            setAgeGroups(response.data);
        } catch (error) {
            console.error('Error fetching age groups:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            }
        }
    };

    const handleChange = (e) => {
        setCourse({ ...course, [e.target.name]: e.target.value });
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

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setCourse({ ...course, courseImageUrl: '' });
    };

    const uploadImage = async () => {
        if (!imageFile) return course.courseImageUrl; // Return existing URL if no new file
        
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('imageFile', imageFile);
            
            const response = await axios.post('/api/courses/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
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
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        try {
            // Upload image first if selected
            let imageUrl = await uploadImage();
            if (imageUrl === null) return; // Stop if upload failed
            
            // Update course with image URL
            const courseData = {
                ...course,
                courseImageUrl: imageUrl
            };
            
            await axios.put(`/api/teacher/courses/${course.courseId}`, courseData, {
                withCredentials: true
            });
            // toast.success("Course updated successfully!");
            setTimeout(() => {
                navigate('/hocho/teacher/course');
            }, 1500); // Delay to let the toast display
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to update course.');
            }
        }
    };

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return null;
        }
        // Extract filename from courseImageUrl (e.g., "/course/filename.jpg" -> "filename.jpg")
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
        <div className="container mt-5">
            <form className={styles.courseForm} onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="courseName" className={styles.courseFormLabel + " form-label"}>Course Title</label>
                    <input
                        type="text"
                        className={styles.courseFormInput + " form-control"}
                        name="title"
                        id="courseName"
                        placeholder="Enter course title"
                        value={course.title}
                        onChange={handleChange}
                        required
                    />
                    {errors.title && <div className={styles.courseFormError + " text-danger"}>{errors.title}</div>}
                </div>
                
                <div className="mb-3">
                    <label htmlFor="courseImage" className={styles.courseFormLabel + " form-label"}>
                        <FontAwesomeIcon icon={faImage} /> Course Image
                    </label>
                    <div className="d-flex align-items-center gap-3">
                        <input
                            type="file"
                            className={styles.courseFormInput + " form-control"}
                            name="courseImage"
                            id="courseImage"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageChange}
                        />
                        {uploading && <FontAwesomeIcon icon={faUpload} spin />}
                        {imagePreview && (
                            <button 
                                type="button" 
                                className="btn btn-outline-danger btn-sm"
                                onClick={removeImage}
                                title="Remove image"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                    {imagePreview && (
                        <div className="mt-2">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{ 
                                    maxWidth: '200px', 
                                    maxHeight: '200px', 
                                    objectFit: 'cover',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px'
                                }} 
                            />
                        </div>
                    )}
                    <small className="text-muted">Upload PNG, JPG, or JPEG file (max 10MB)</small>
                </div>
                
                <div className="mb-3">
                    <label htmlFor="courseDescription" className={styles.courseFormLabel + " form-label"}>Description</label>
                    <textarea
                        className={styles.courseFormTextarea + " form-control"}
                        name="description"
                        id="courseDescription"
                        placeholder="Enter course description"
                        rows="3"
                        value={course.description}
                        onChange={handleChange}
                        required
                    />
                    {errors.description && <div className={styles.courseFormError + " text-danger"}>{errors.description}</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="ageGroup" className={styles.courseFormLabel + " form-label"}>Age Group</label>
                    <select
                        className={styles.courseFormSelect + " form-select"}
                        name="age_group"
                        id="ageGroup"
                        value={course.age_group}
                        onChange={handleChange}
                        required
                    >
                        {ageGroups.map((group) => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                    {errors.age_group && <div className={styles.courseFormError + " text-danger"}>{errors.age_group}</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className={styles.courseFormLabel + " form-label"}>Price</label>
                    <input
                        type="number"
                        className={styles.courseFormInput + " form-control"}
                        name="price"
                        id="price"
                        placeholder="Enter course price"
                        value={course.price}
                        onChange={handleChange}
                        required
                    />
                    {errors.price && <div className={styles.courseFormError + " text-danger"}>{errors.price}</div>}
                </div>
                <button 
                    type="submit" 
                    className={styles.courseFormBtn + " btn btn-warning w-100"}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Save Changes'}
                </button>
                <button type="button" className={styles.courseFormBtn + ' ' + styles.cancel + " btn btn-secondary w-100 mt-2"} onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </form>
            {/*<ToastContainer />*/}
        </div>
    );
};
