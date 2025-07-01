import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from '../../styles/lesson/LessonPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.jsx';
import AddLessonPage from './AddLessonPage.jsx';

export default function LessonPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);

    const openAddLessonDialog = () => setShowAddLessonDialog(true);
    const closeAddLessonDialog = () => setShowAddLessonDialog(false);

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            const result = await axios.get(`/api/lessons/course/${courseId}`, {
                withCredentials: true,
            });
            setLessons(result.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to load lessons. Please try again later.');
            }
        }
    };

    const handleDeleteClick = (lessonId) => {
        setSelectedLessonId(lessonId);
        setShowDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setSelectedLessonId(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/lessons/${selectedLessonId}`, {
                withCredentials: true,
            });
            setShowDeleteDialog(false);
            setSelectedLessonId(null);
            fetchLessons(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting lesson:', error);
            setShowDeleteDialog(false);
            setSelectedLessonId(null);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else if (error.response?.status === 500) {
                setError('Server error occurred while deleting the lesson. Please contact support or try again.');
            } else {
                setError('Failed to delete lesson. Please try again later.');
            }
        }
    };

    // Callback to refresh lessons after adding a new one
    const handleLessonAdded = () => {
        closeAddLessonDialog();
        fetchLessons(); // Refresh the lesson list
    };

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.alertDanger}>{error}</div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>Course Detail</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>
                            <a href="/hocho/teacher/course">Teacher Course</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Course Detail</li>
                    </ul>
                </div>
            </section>

            <main className={styles.container}>
                <header className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>Lessons Overview</h2>
                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.chip} ${styles.chipSuccess}`}
                            aria-label="Add a new lesson"
                            onClick={openAddLessonDialog}
                        >
                            Add New Lesson
                        </button>
                        <Link
                            to="/hocho/teacher/course"
                            className={`${styles.chip} ${styles.chipSecondary}`}
                            aria-label="Return to courses"
                        >
                            Back to Courses
                        </Link>
                    </div>
                </header>

                <section className={styles.lessonTable}>
                    {lessons.length === 0 ? (
                        <div className={styles.noLessons}>
                            <p>No lessons available. Start by adding a new lesson!</p>
                        </div>
                    ) : (
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th scope="col">Title</th>
                                    <th scope="col">Duration</th>
                                    <th scope="col">Created At</th>
                                    <th scope="col">Updated At</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {lessons.map((lesson) => (
                                    <tr key={lesson.lessonId}>
                                        <td>{lesson.title}</td>
                                        <td>{lesson.duration}</td>
                                        <td>{new Date(lesson.createdAt).toLocaleString()}</td>
                                        <td>{new Date(lesson.updatedAt).toLocaleString()}</td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                <Link
                                                    to={`/hocho/teacher/course/${courseId}/lesson/${lesson.lessonId}/edit`}
                                                    className={`${styles.chip} ${styles.chipWarning} ${styles.chipSm}`}
                                                    state={{ lesson }}
                                                    aria-label={`Edit lesson ${lesson.title}`}
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    to={`/hocho/teacher/course/${courseId}/lesson/${lesson.lessonId}/content`}
                                                    className={`${styles.chip} ${styles.chipInfo} ${styles.chipSm}`}
                                                    aria-label={`View content of lesson ${lesson.title}`}
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    className={`${styles.chip} ${styles.chipDanger} ${styles.chipSm}`}
                                                    onClick={() => handleDeleteClick(lesson.lessonId)}
                                                    aria-label={`Delete lesson ${lesson.title}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <DeleteConfirmDialog
                    sh={showDeleteDialog}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    message="Are you sure you want to delete this lesson?"
                />
            </main>
            <Footer />
            {showAddLessonDialog && (
                <div className={styles.modal} onClick={closeAddLessonDialog}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <AddLessonPage
                            showModal={showAddLessonDialog}
                            closeModal={closeAddLessonDialog}
                            courseId={courseId}
                            onLessonAdded={handleLessonAdded} // Pass callback to refresh lessons
                        />
                    </div>
                </div>
            )}
        </>
    );
}