import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faBook, 
    faVideo, 
    faQuestionCircle,
    faComments,
    faUserGraduate,
    faUserTie,
    faChild,
    faChartPie,
    faChartBar,
    faChartLine,
    faTable
} from '@fortawesome/free-solid-svg-icons';
import { 
    BarChart, Bar, PieChart, Pie, Cell, 
    AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer 
} from 'recharts';
import SidebarAdmin from '../../components/SidebarAdmin';
import Footer from '../../components/Footer';
import styles from '../../styles/AdminHome.module.css';

const AdminHome = () => {
    const [statistics, setStatistics] = useState({
        users: {
            total: 0,
            admin: 0,
            teacher: 0,
            parent: 0,
            child: 0,
            pendingTeachers: 0
        },
        courses: {
            total: 0,
            pending: 0,
            approved: 0
        },
        videos: {
            total: 0,
            pending: 0,
            approved: 0
        },
        quizzes: {
            total: 0
        },
        feedbacks: {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch user statistics
                const usersResponse = await axios.get('http://localhost:8080/api/admin/users', {
                    withCredentials: true,
                });

                const users = usersResponse.data;
                const adminCount = users.filter(user => user.role === 'admin').length;
                const teacherCount = users.filter(user => user.role === 'teacher').length;
                const parentCount = users.filter(user => user.role === 'parent').length;
                const childCount = users.filter(user => user.role === 'child').length;

                // Fetch pending teachers
                const pendingTeachersResponse = await axios.get('http://localhost:8080/api/admin/pending-teachers', {
                    withCredentials: true,
                });

                // Fetch feedback statistics
                const feedbackStatsResponse = await axios.get('http://localhost:8080/api/admin/feedbacks/stats', {
                    withCredentials: true,
                });

                // Fetch course statistics
                const pendingCoursesResponse = await axios.get('http://localhost:8080/api/courses/pending', {
                    withCredentials: true,
                });

                const allCoursesResponse = await axios.get('http://localhost:8080/api/courses', {
                    withCredentials: true,
                });

                // Fetch video statistics
                const pendingVideosResponse = await axios.get('http://localhost:8080/api/videos/admin/status/PENDING', {
                    withCredentials: true,
                });

                const allVideosResponse = await axios.get('http://localhost:8080/api/videos/admin/all', {
                    withCredentials: true,
                });

                // Fetch quiz statistics
                const quizzesResponse = await axios.get('http://localhost:8080/api/quizzes', {
                    withCredentials: true,
                });

                setStatistics({
                    users: {
                        total: users.length,
                        admin: adminCount,
                        teacher: teacherCount,
                        parent: parentCount,
                        child: childCount,
                        pendingTeachers: pendingTeachersResponse.data.length
                    },
                    courses: {
                        total: allCoursesResponse.data.length,
                        pending: pendingCoursesResponse.data.length,
                        approved: allCoursesResponse.data.length - pendingCoursesResponse.data.length
                    },
                    videos: {
                        total: allVideosResponse.data.length,
                        pending: pendingVideosResponse.data.length,
                        approved: allVideosResponse.data.filter(video => video.status === 'APPROVED').length
                    },
                    quizzes: {
                        total: quizzesResponse.data.length
                    },
                    feedbacks: feedbackStatsResponse.data
                });
            } catch (err) {
                console.error('Error fetching statistics:', err);
                setError('Error loading statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    // Helper functions to prepare data for charts
    const prepareUserData = () => {
        return [
            { name: 'Administrator', value: statistics.users.admin, color: '#2D3748' },
            { name: 'Teacher', value: statistics.users.teacher, color: '#38A169' },
            { name: 'Parent', value: statistics.users.parent, color: '#DD6B20' },
            { name: 'Student', value: statistics.users.child, color: '#3182CE' }
        ];
    };

    const prepareContentData = () => {
        return [
            { name: 'Course', total: statistics.courses.total, pending: statistics.courses.pending, approved: statistics.courses.approved },
            { name: 'Video', total: statistics.videos.total, pending: statistics.videos.pending, approved: statistics.videos.approved },
            { name: 'Quiz', total: statistics.quizzes.total, pending: 0, approved: statistics.quizzes.total }
        ];
    };

    const prepareFeedbackData = () => {
        return [
            { name: 'Pending', value: statistics.feedbacks.pending, color: '#E53E3E' },
            { name: 'In Progress', value: statistics.feedbacks.inProgress, color: '#DD6B20' },
            { name: 'Resolved', value: statistics.feedbacks.resolved, color: '#38A169' },
            { name: 'Closed', value: statistics.feedbacks.closed, color: '#718096' }
        ];
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className={styles.statCard}>
            <div className={styles.iconContainer} style={{ backgroundColor: color }}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <div className={styles.statInfo}>
                <h3 className={styles.statTitle}>{title}</h3>
                <p className={styles.statValue}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className={styles.adminLayout}>
            <SidebarAdmin />
            <div className={styles.adminContent}>
                <main className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                            <p className={styles.headerDescription}>Welcome to Hocho Admin Dashboard - Manage educational content for children</p>
                        </div>
                        <div className={styles.headerIcon}>
                            <FontAwesomeIcon icon={faChild} />
                        </div>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : (
                        <div>
                            {/* User Statistics Section */}
                            <section id="dashboard" className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <FontAwesomeIcon icon={faChartPie} className={styles.sectionIcon} />
                                    <h2 className={styles.sectionTitle}>User Statistics</h2>
                                </div>
                                <div className={styles.sectionContent}>
                                    <div>
                                        <div className={styles.cardGrid}>
                                            <StatCard title="Total Users" value={statistics.users.total} icon={faUsers} color="#4C51BF" />
                                            <StatCard title="Teacher" value={statistics.users.teacher} icon={faUserTie} color="#38A169" />
                                            <StatCard title="Student" value={statistics.users.child} icon={faChild} color="#3182CE" />
                                        </div>
                                        <div className={styles.cardGrid2}>
                                            <StatCard title="Administrator" value={statistics.users.admin} icon={faUsers} color="#2D3748" />
                                            <StatCard title="Parent" value={statistics.users.parent} icon={faUsers} color="#DD6B20" />
                                        </div>
                                    </div>
                                    <div className={styles.chartContainer}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={prepareUserData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {prepareUserData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} users`, 'Amount']} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>

                            {/* Content Statistics Section */}
                            <section id="content-stats" className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <FontAwesomeIcon icon={faChartBar} className={styles.sectionIcon} />
                                    <h2 className={styles.sectionTitle}>Content Statistics</h2>
                                </div>
                                <div className={styles.sectionContent}>
                                    <div>
                                        <div className={styles.cardGrid}>
                                            <StatCard title="Total Courses" value={statistics.courses.total} icon={faBook} color="#805AD5" />
                                            <StatCard title="Pending Courses" value={statistics.courses.pending} icon={faBook} color="#D53F8C" />
                                            <StatCard title="Approved Courses" value={statistics.courses.approved} icon={faBook} color="#319795" />
                                        </div>
                                        <div className={styles.cardGrid}>
                                            <StatCard title="Total Videos" value={statistics.videos.total} icon={faVideo} color="#3182CE" />
                                            <StatCard title="Pending Videos" value={statistics.videos.pending} icon={faVideo} color="#E53E3E" />
                                            <StatCard title="Approved Videos" value={statistics.videos.approved} icon={faVideo} color="#38A169" />
                                        </div>
                                        <div>
                                            <StatCard title="Total Quizzes" value={statistics.quizzes.total} icon={faQuestionCircle} color="#DD6B20" />
                                        </div>
                                    </div>
                                    <div className={styles.chartContainer}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={prepareContentData()}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="total" name="Total" fill="#8884d8" />
                                                <Bar dataKey="pending" name="Pending" fill="#ff8042" />
                                                <Bar dataKey="approved" name="Approved" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>

                            {/* Feedback Statistics Section */}
                            <section id="feedback-stats" className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <FontAwesomeIcon icon={faChartLine} className={styles.sectionIcon} />
                                    <h2 className={styles.sectionTitle}>Feedback Statistics</h2>
                                </div>
                                <div className={styles.sectionContent}>
                                    <div>
                                        <div className={styles.cardGrid}>
                                            <StatCard title="Total Feedback" value={statistics.feedbacks.total} icon={faComments} color="#4C51BF" />
                                            <StatCard title="Pending" value={statistics.feedbacks.pending} icon={faComments} color="#E53E3E" />
                                            <StatCard title="In Progress" value={statistics.feedbacks.inProgress} icon={faComments} color="#DD6B20" />
                                        </div>
                                        <div className={styles.cardGrid2}>
                                            <StatCard title="Resolved" value={statistics.feedbacks.resolved} icon={faComments} color="#38A169" />
                                            <StatCard title="Closed" value={statistics.feedbacks.closed} icon={faComments} color="#718096" />
                                        </div>
                                    </div>
                                    <div className={styles.chartContainer}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={prepareFeedbackData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                >
                                                    {prepareFeedbackData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} feedback`, 'Amount']} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>

                            {/* System Management Section */}
                            <section id="system-management" className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <FontAwesomeIcon icon={faTable} className={styles.sectionIcon} />
                                    <h2 className={styles.sectionTitle}>System Management</h2>
                                </div>
                                <div className={styles.managementGrid}>
                                    <a href="/hocho/admin/accounts" className={`${styles.managementCard} ${styles.blueCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.blueCardIcon}`}>
                                                <FontAwesomeIcon icon={faUsers} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.blueCardTitle}`}>Account Management</h3>
                                        </div>
                                        <p className={styles.cardDescription}>Manage all user accounts in the system</p>
                                    </a>
                                    <a href="/hocho/admin/tutors" className={`${styles.managementCard} ${styles.greenCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.greenCardIcon}`}>
                                                <FontAwesomeIcon icon={faUserTie} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.greenCardTitle}`}>Tutor Management</h3>
                                        </div>
                                        <p className={styles.cardDescription}>Manage tutor information and profiles</p>
                                    </a>
                                    <a href="/hocho/admin/feedbacks" className={`${styles.managementCard} ${styles.purpleCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.purpleCardIcon}`}>
                                                <FontAwesomeIcon icon={faComments} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.purpleCardTitle}`}>Feedback Management</h3>
                                        </div>
                                        <p className={styles.cardDescription}>View and respond to user feedback</p>
                                    </a>
                                    <a href="/hocho/admin/course/approval" className={`${styles.managementCard} ${styles.yellowCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.yellowCardIcon}`}>
                                                <FontAwesomeIcon icon={faBook} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.yellowCardTitle}`}>Course Approval</h3>
                                        </div>
                                        <p className={styles.cardDescription}>Review and approve new courses</p>
                                    </a>
                                    <a href="/hocho/admin/video/approval" className={`${styles.managementCard} ${styles.redCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.redCardIcon}`}>
                                                <FontAwesomeIcon icon={faVideo} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.redCardTitle}`}>Video Approval</h3>
                                        </div>
                                        <p className={styles.cardDescription}>Review and approve new videos</p>
                                    </a>
                                    <a href="/hocho/admin/games/storage" className={`${styles.managementCard} ${styles.indigoCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={`${styles.cardIconContainer} ${styles.indigoCardIcon}`}>
                                                <FontAwesomeIcon icon={faChild} />
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${styles.indigoCardTitle}`}>Game Management</h3>
                                        </div>
                                        <p className={styles.cardDescription}>Manage educational games in the system</p>
                                    </a>
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminHome;
