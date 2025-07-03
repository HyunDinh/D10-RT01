import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/course/CoursePublic.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBook, faBookOpen, faChevronRight, faFilePen, faTrash} from '@fortawesome/free-solid-svg-icons';
import AddCoursePage from './AddCoursePage';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import EditCoursePage from './EditCoursePage';

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('All');
    const [error, setError] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const result = await axios.get('/api/teacher/courses', {
                withCredentials: true,
            });
            const mappedCourses = result.data.map((course) => ({
                ...course, ageGroup: course.age_group || course.ageGroup,
            }));
            mappedCourses.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup));
            setCourses(mappedCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to load courses. Please try again later.');
            }
        }
    };

    const handleDeleteClick = (courseId) => {
        setSelectedCourseId(courseId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/teacher/course/${selectedCourseId}`, {
                withCredentials: true,
            });
            setShowDeleteDialog(false);
            setSelectedCourseId(null);
            fetchCourses(); // Refresh courses after deletion
        } catch (error) {
            console.error('Delete error:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to delete course. Please try again.');
            }
            setShowDeleteDialog(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setSelectedCourseId(null);
    };

    const handleEditClick = (course) => {
        setSelectedCourse(course);
        setShowEditDialog(true);
    };

    const handleCloseAddDialog = () => {
        setShowAddDialog(false);
        fetchCourses(); // Refresh courses after adding
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedCourse(null);
        fetchCourses(); // Refresh courses after editing
    };

    // Get distinct age groups for the dropdown
    const ageGroups = Array.from(new Set(courses.map((course) => course.ageGroup))).filter(Boolean);

    // Filter courses based on the dropdown selection
    const filteredCourses = filter === 'All' ? courses : courses.filter((course) => course.ageGroup === filter);

    if (error) {
        return (<div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>);
    }

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Teacher Course</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Teacher Course</li>
                    </ul>
                </div>
            </section>

            <div className={styles.courseListContainer}>
                <div className={styles.courseFilter}>
                    <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All Age Groups</option>
                        {ageGroups.map((group) => (<option key={group} value={group}>
                                {group}
                            </option>))}
                    </select>
                    <div>
                        <button className={styles.customBtn} onClick={() => setShowAddDialog(true)}>
                            ➕ Add New Course
                        </button>
                        <Link to="/hocho/dashboard" className={styles.customBtn}>
                            🔙 Back to Dashboard
                        </Link>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className={styles.courseTable}>
                        <thead className="table-dark">
                        <tr>
                            <th>Title</th>
                            <th>Age Group</th>
                            <th>Subject</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCourses.map((course) => (<tr key={course.courseId}>
                                <td>{course.title}</td>
                                <td>{course.ageGroup}</td>
                                <td>{course.subject ? course.subject.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'N/A'}</td>
                                <td>{course.price}</td>
                                <td>{course.status}</td>
                                <td>{new Date(course.createdAt).toLocaleString()}</td>
                                <td>
                                    <Link to={`/hocho/teacher/course/${course.courseId}/lesson`}
                                          className={styles.chip}>
                                        <FontAwesomeIcon icon={faBook} style={{marginRight: 5}}/>
                                        View Lessons
                                    </Link>
                                    <Link to={`/hocho/teacher/quizzes?courseId=${course.courseId}`}
                                          className={styles.chip}>
                                        <FontAwesomeIcon icon={faBookOpen} style={{marginRight: 5}}/>
                                        View Quiz
                                    </Link>
                                    <button onClick={() => handleEditClick(course)} className={styles.chip}>
                                        <FontAwesomeIcon icon={faFilePen} style={{marginRight: 5}}/>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteClick(course.courseId)} className={styles.chip}>
                                        <FontAwesomeIcon icon={faTrash} style={{marginRight: 5}}/>
                                        Delete
                                    </button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddDialog && <AddCoursePage onClose={handleCloseAddDialog}/>}
            {showDeleteDialog && (<DeleteConfirmDialog
                    sh={showDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    message="Are you sure you want to delete this course?"
                />)}
            {showEditDialog && <EditCoursePage course={selectedCourse} onClose={handleCloseEditDialog}/>}
            <Footer/>
        </>);
}