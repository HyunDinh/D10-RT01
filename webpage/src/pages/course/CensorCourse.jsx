import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/course/CoursePublic.module.css';
import addLessonStyles from '../../styles/lesson/AddLesson.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const CourseApproval = () => {
    const [courses, setCourses] = useState([]);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [lessonMap, setLessonMap] = useState({});
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingLessons, setLoadingLessons] = useState({});
    const [error, setError] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const res = await axios.get('http://localhost:8080/api/courses/pending', {
                withCredentials: true,
            });
            const mapped = res.data.map((course) => ({
                ...course,
                ageGroup: course.age_group || course.ageGroup,
            }));
            setCourses(mapped);
            setLoadingCourses(false);
        } catch (err) {
            setError('Không thể tải danh sách khóa học');
            setLoadingCourses(false);
            console.error('Error loading courses:', err);
        }
    };

    const fetchLessons = async (courseId) => {
        if (lessonMap[courseId]) {
            setExpandedCourseId(courseId);
            return;
        }
        try {
            setLoadingLessons((prev) => ({ ...prev, [courseId]: true }));
            const res = await axios.get(`http://localhost:8080/api/lessons/course/${courseId}`, {
                withCredentials: true,
            });
            setLessonMap((prev) => ({ ...prev, [courseId]: res.data }));
            setExpandedCourseId(courseId);
            setLoadingLessons((prev) => ({ ...prev, [courseId]: false }));
        } catch (err) {
            setError('Không thể tải danh sách bài học');
            setLoadingLessons((prev) => ({ ...prev, [courseId]: false }));
            console.error('Error loading lessons:', err);
        }
    };

    const handleApproveClick = (id) => {
        setSelectedCourseId(id);
        setShowApproveModal(true);
    };

    const handleApproveCancel = () => {
        const modal = document.querySelector(`.${addLessonStyles.modal}`);
        const modalContent = document.querySelector(`.${addLessonStyles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowApproveModal(false);
                setSelectedCourseId(null);
            }, 300);
        } else {
            setShowApproveModal(false);
            setSelectedCourseId(null);
        }
    };

    const handleApproveConfirm = async () => {
        try {
            await axios.post(`http://localhost:8080/api/courses/${selectedCourseId}/approve`, {}, {
                withCredentials: true,
            });
            setCourses((prev) =>
                prev.map((course) =>
                    course.courseId === selectedCourseId ? { ...course, status: 'APPROVED' } : course
                )
            );
            setShowApproveModal(false);
            setSelectedCourseId(null);
        } catch (err) {
            setError('Không thể duyệt khóa học');
            setShowApproveModal(false);
            setSelectedCourseId(null);
            console.error('Error approving course:', err);
        }
    };

    const handleRejectClick = (id) => {
        setSelectedCourseId(id);
        setShowRejectModal(true);
    };

    const handleRejectCancel = () => {
        const modal = document.querySelector(`.${addLessonStyles.modal}`);
        const modalContent = document.querySelector(`.${addLessonStyles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowRejectModal(false);
                setSelectedCourseId(null);
            }, 300);
        } else {
            setShowRejectModal(false);
            setSelectedCourseId(null);
        }
    };

    const handleRejectConfirm = async () => {
        try {
            await axios.post(`http://localhost:8080/api/courses/${selectedCourseId}/reject`, {}, {
                withCredentials: true,
            });
            setCourses((prev) =>
                prev.map((course) =>
                    course.courseId === selectedCourseId ? { ...course, status: 'REJECTED' } : course
                )
            );
            setShowRejectModal(false);
            setSelectedCourseId(null);
        } catch (err) {
            setError('Không thể từ chối khóa học');
            setShowRejectModal(false);
            setSelectedCourseId(null);
            console.error('Error rejecting course:', err);
        }
    };

    if (loadingCourses) {
        return <div className={styles.courseListAlert}>Đang tải...</div>;
    }

    if (error) {
        return <div className={styles.courseListAlert}>{error}</div>;
    }

    return (
        <>
            <Header />
            <section className={addLessonStyles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={addLessonStyles.headerInfo}>
                    <p>Course Approval</p>
                    <ul className={addLessonStyles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Course Approval</li>
                    </ul>
                </div>
            </section>

            <main className={styles.courseListContainer}>
                <h2 className={styles.courseListTitle}>Pending Course Approvals</h2>

                {courses.length === 0 ? (
                    <div className={styles.courseListAlert}>No courses pending approval.</div>
                ) : (
                    <table className={styles.courseApprovalTable}>
                        <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Teacher</th>
                            <th>Age Group</th>
                            <th>Price</th>
                            <th>Created At</th>
                            <th>Status</th>
                            <th>View Details</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {courses.map((course) => (
                            <React.Fragment key={course.courseId}>
                                <tr>
                                    <td>{course.courseId}</td>
                                    <td>{course.title}</td>
                                    <td>{course.teacher?.fullName || 'N/A'}</td>
                                    <td>{course.ageGroup}</td>
                                    <td>{course.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td>{new Date(course.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td>
                      <span
                          className={`${styles.badge} ${
                              course.status === 'APPROVED' ? styles.approved : course.status === 'REJECTED' ? styles.rejected : styles.pending
                          }`}
                      >
                        {course.status}
                      </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`${styles.btn} ${styles.btnInfo}`}
                                            onClick={() =>
                                                expandedCourseId === course.courseId ? setExpandedCourseId(null) : fetchLessons(course.courseId)
                                            }
                                            aria-label={`View details for ${course.title}`}
                                        >
                                            <FontAwesomeIcon icon={faEye} /> View Details
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className={`${styles.btn} ${styles.btnSuccess}`}
                                            onClick={() => handleApproveClick(course.courseId)}
                                            disabled={course.status !== 'PENDING'}
                                            aria-label={`Approve ${course.title}`}
                                        >
                                            <FontAwesomeIcon icon={faCheck} /> Accept
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnDanger}`}
                                            onClick={() => handleRejectClick(course.courseId)}
                                            disabled={course.status !== 'PENDING'}
                                            aria-label={`Reject ${course.title}`}
                                        >
                                            <FontAwesomeIcon icon={faTimes} /> Reject
                                        </button>
                                    </td>
                                </tr>
                                {expandedCourseId === course.courseId && (
                                    <tr>
                                        <td colSpan="9">
                                            {loadingLessons[course.courseId] ? (
                                                <div className={styles.courseListAlert}>Loading lessons...</div>
                                            ) : lessonMap[course.courseId]?.length > 0 ? (
                                                <table className={styles.lessonTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>Lesson ID</th>
                                                        <th>Title</th>
                                                        <th>Duration (min)</th>
                                                        <th>Created At</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {lessonMap[course.courseId].map((lesson) => (
                                                        <tr key={lesson.lessonId}>
                                                            <td>{lesson.lessonId}</td>
                                                            <td>{lesson.title}</td>
                                                            <td>{lesson.duration}</td>
                                                            <td>
                                                                {new Date(lesson.createdAt).toLocaleDateString('en-GB', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <span className={styles.noLessons}>No lessons available.</span>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                )}

                {showApproveModal && (
                    <div className={addLessonStyles.modal}>
                        <div className={addLessonStyles.modalContent}>
                            <div className={addLessonStyles.modalHeader}>
                                <h5>Xác nhận duyệt khóa học</h5>
                                <button
                                    className={addLessonStyles.modalClose}
                                    onClick={handleApproveCancel}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <div className={addLessonStyles.modalBody}>
                                <p>Bạn có chắc chắn muốn duyệt khóa học này không?</p>
                            </div>
                            <div className={addLessonStyles.modalFooter}>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                                    onClick={handleApproveCancel}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                                    onClick={handleApproveConfirm}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showRejectModal && (
                    <div className={addLessonStyles.modal}>
                        <div className={addLessonStyles.modalContent}>
                            <div className={addLessonStyles.modalHeader}>
                                <h5>Xác nhận từ chối khóa học</h5>
                                <button
                                    className={addLessonStyles.modalClose}
                                    onClick={handleRejectCancel}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <div className={addLessonStyles.modalBody}>
                                <p>Bạn có chắc chắn muốn từ chối khóa học này không?</p>
                            </div>
                            <div className={addLessonStyles.modalFooter}>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                                    onClick={handleRejectCancel}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                                    onClick={handleRejectConfirm}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default CourseApproval;