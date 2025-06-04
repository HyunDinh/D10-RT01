import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditCoursePage() {
    const [ageGroups, setAgeGroups] = useState([]);
    const { userId, courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState({
        title: '',
        description: '',
        age_group: '',
        price: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCourse();
        fetchAgeGroups();
    }, [userId, courseId]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`/api/teachers/${userId}/courses/${courseId}/edit`);
            setCourse(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch course data.");
        }
    };

    const fetchAgeGroups = async () => {
        try {
            const response = await axios.get('/api/teachers/age-groups');
            setAgeGroups(response.data);
        } catch (error) {
            console.error('Error fetching age groups:', error);
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
            await axios.put(`/api/teachers/${userId}/courses/${courseId}/edit`, course);
            toast.success("Course updated successfully!");
            setTimeout(() => {
                navigate(`/teachers/${userId}/courses`);
            }, 1500); // Delay to let the toast display
        } catch (error) {
            console.error(error);
            toast.error("Failed to update course.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-warning text-white">
                            <h4 className="mb-0">Edit Course</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="courseName" className="form-label">Course Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        id="courseName"
                                        placeholder="Enter course title"
                                        value={course.title}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.title && <div className="text-danger">{errors.title}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="courseDescription" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        id="courseDescription"
                                        placeholder="Enter course description"
                                        rows="3"
                                        value={course.description}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.description && <div className="text-danger">{errors.description}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ageGroup" className="form-label">Age Group</label>
                                    <select
                                        className="form-select"
                                        name="age_group"
                                        id="ageGroup"
                                        value={course.age_group}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select age group</option>
                                        {ageGroups.map((group) => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                    {errors.age_group && <div className="text-danger">{errors.age_group}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        id="price"
                                        placeholder="Enter course price"
                                        value={course.price}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.price && <div className="text-danger">{errors.price}</div>}
                                </div>
                                <button type="submit" className="btn btn-warning w-100">Save Changes</button>
                                <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate(-1)}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};
