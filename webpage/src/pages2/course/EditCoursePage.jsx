import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/course/CoursePublic.module.css';
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
        price: ''
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!location.state?.course) {
            navigate('/hocho/teacher/course');
            return;
        }
        setCourse(location.state.course);
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
            await axios.put(`/api/teacher/courses/${course.courseId}`, course, {
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
                <button type="submit" className={styles.courseFormBtn + " btn btn-warning w-100"}>Save Changes</button>
                <button type="button" className={styles.courseFormBtn + ' ' + styles.cancel + " btn btn-secondary w-100 mt-2"} onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </form>
            {/*<ToastContainer />*/}
        </div>
    );
};
