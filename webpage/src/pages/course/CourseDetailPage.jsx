import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import styles from '../../styles/course/CoursePublic.module.css';
import Footer from "../../components/Footer.jsx";

const CourseDetailPage = () => {
    const {courseId} = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [childId, setChildId] = useState(null);
    const navigate = useNavigate();

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return '/avaBack.jpg';
        }
        // Extract filename from courseImageUrl (e.g., "/course/filename.jpg" -> "filename.jpg")
        const fileName = courseImageUrl.split('/').pop();
        return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get course detail info (temporarily from all list)
                const courseRes = await axios.get(`http://localhost:8080/api/courses`, {withCredentials: true});
                const foundCourse = courseRes.data.find(c => (c.id?.toString() === courseId?.toString()) || (c.courseId?.toString() === courseId?.toString()));
                setCourse(foundCourse);

                // Get lesson list
                const lessonsRes = await axios.get(`http://localhost:8080/api/lessons/course/${courseId}`, {withCredentials: true});
                setLessons(lessonsRes.data);

                // Get quiz list
                const quizzesRes = await axios.get(`http://localhost:8080/api/quizzes/course/${courseId}`, {withCredentials: true});
                setQuizzes(quizzesRes.data);
            } catch (err) {
                setError('Unable to load course data.');
            }
            setLoading(false);
        };
        fetchData();
    }, [courseId]);

    useEffect(() => {
        // Get childId from profile
        axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true})
            .then(res => setChildId(res.data.id));
    }, []);

    useEffect(() => {
        if (childId && courseId) {
            axios.get(`http://localhost:8080/api/enrollments/check/${childId}/${courseId}`, {withCredentials: true})
                .then(res => setEnrolled(res.data === true));
        }
    }, [childId, courseId]);

    if (loading) return <div>Loading data...</div>;
    if (error) return <div>{error}</div>;
    if (!course) return <div>Course not found.</div>;

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Course Details</p>
                    <ul className={styles.breadcrumbItems}>
                        <li><a href="/hocho/home">Home</a></li>
                        <li> /</li>
                        <li><a href="/hocho/courses">Course List</a></li>
                        <li> /</li>
                        <li>{course.title}</li>
                    </ul>
                </div>
            </section>

            <div className={styles.mainContainer}>
                <div className={styles.courseDetailBox}>
                    <div className={styles.courseInfo}>
                        <h2>{course.title}</h2>
                    </div>
                    <img
                        src={getCourseImageUrl(course.courseImageUrl)}
                        alt={course.title}
                        className={styles.courseImg}
                        onError={(e) => (e.target.src = '/avaBack.jpg')}
                    />

                </div>

                <div className={styles.lessonQuizSection}>
                    <div className={styles.lessonBox}>
                        <h3>Lesson List</h3>
                        {lessons.length === 0 ? (<div>No lessons available.</div>) : (<ul>
                                {lessons.map(lesson => (<li key={lesson.lessonId || lesson.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        justifyContent: 'space-between'
                                    }}>
                                        {lesson.title}
                                        {enrolled && (<button className={`${styles.btn} ${styles.btnSuccess}`}
                                                              onClick={() => navigate(`/hocho/lesson/${lesson.lessonId || lesson.id}/content-student`)}
                                            >
                                                View Lesson
                                            </button>)}
                                    </li>))}
                            </ul>)}
                    </div>
                    {enrolled && (<div className={styles.quizBox}>
                            <h3>Quiz List</h3>
                            {quizzes.length === 0 ? (<div>No quizzes available.</div>) : (<ul>
                                    {quizzes.map(quiz => (<li key={quiz.quizId || quiz.id}>{quiz.title}</li>))}
                                </ul>)}
                        </div>)}
                </div>
            </div>
            <Footer/>
        </>);
};

export default CourseDetailPage;