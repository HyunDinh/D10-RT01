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
import Header from '../../components/Header';
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
                setError('Lỗi khi tải dữ liệu thống kê. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    // Helper functions to prepare data for charts
    const prepareUserData = () => {
        return [
            { name: 'Quản trị viên', value: statistics.users.admin, color: '#2D3748' },
            { name: 'Giáo viên', value: statistics.users.teacher, color: '#38A169' },
            { name: 'Phụ huynh', value: statistics.users.parent, color: '#DD6B20' },
            { name: 'Học sinh', value: statistics.users.child, color: '#3182CE' }
        ];
    };

    const prepareContentData = () => {
        return [
            { name: 'Khóa học', total: statistics.courses.total, pending: statistics.courses.pending, approved: statistics.courses.approved },
            { name: 'Video', total: statistics.videos.total, pending: statistics.videos.pending, approved: statistics.videos.approved },
            { name: 'Bài kiểm tra', total: statistics.quizzes.total, pending: 0, approved: statistics.quizzes.total }
        ];
    };

    const prepareFeedbackData = () => {
        return [
            { name: 'Đang chờ', value: statistics.feedbacks.pending, color: '#E53E3E' },
            { name: 'Đang xử lý', value: statistics.feedbacks.inProgress, color: '#DD6B20' },
            { name: 'Đã giải quyết', value: statistics.feedbacks.resolved, color: '#38A169' },
            { name: 'Đã đóng', value: statistics.feedbacks.closed, color: '#718096' }
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
        <>
            <Header />
            <main className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.headerTitle}>Trang chủ quản trị</h1>
                        <p className={styles.headerDescription}>Chào mừng đến với bảng điều khiển quản trị Hocho - Nơi quản lý nội dung học tập cho trẻ em</p>
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
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FontAwesomeIcon icon={faChartPie} className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>Thống kê người dùng</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <div>
                                    <div className={styles.cardGrid}>
                                        <StatCard title="Tổng người dùng" value={statistics.users.total} icon={faUsers} color="#4C51BF" />
                                        <StatCard title="Giáo viên" value={statistics.users.teacher} icon={faUserTie} color="#38A169" />
                                        <StatCard title="Học sinh" value={statistics.users.child} icon={faChild} color="#3182CE" />
                                    </div>
                                    <div className={styles.cardGrid2}>
                                        <StatCard title="Quản trị viên" value={statistics.users.admin} icon={faUsers} color="#2D3748" />
                                        <StatCard title="Phụ huynh" value={statistics.users.parent} icon={faUsers} color="#DD6B20" />
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
                                            <Tooltip formatter={(value) => [`${value} người dùng`, 'Số lượng']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        {/* Content Statistics Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FontAwesomeIcon icon={faChartBar} className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>Thống kê nội dung</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <div>
                                    <div className={styles.cardGrid}>
                                        <StatCard title="Tổng khóa học" value={statistics.courses.total} icon={faBook} color="#805AD5" />
                                        <StatCard title="Khóa học chờ duyệt" value={statistics.courses.pending} icon={faBook} color="#D53F8C" />
                                        <StatCard title="Khóa học đã duyệt" value={statistics.courses.approved} icon={faBook} color="#319795" />
                                    </div>
                                    <div className={styles.cardGrid}>
                                        <StatCard title="Tổng video" value={statistics.videos.total} icon={faVideo} color="#3182CE" />
                                        <StatCard title="Video chờ duyệt" value={statistics.videos.pending} icon={faVideo} color="#E53E3E" />
                                        <StatCard title="Video đã duyệt" value={statistics.videos.approved} icon={faVideo} color="#38A169" />
                                    </div>
                                    <div>
                                        <StatCard title="Tổng bài kiểm tra" value={statistics.quizzes.total} icon={faQuestionCircle} color="#DD6B20" />
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
                                            <Bar dataKey="total" name="Tổng" fill="#8884d8" />
                                            <Bar dataKey="pending" name="Chờ duyệt" fill="#ff8042" />
                                            <Bar dataKey="approved" name="Đã duyệt" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        {/* Feedback Statistics Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FontAwesomeIcon icon={faChartLine} className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>Thống kê phản hồi</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <div>
                                    <div className={styles.cardGrid}>
                                        <StatCard title="Tổng phản hồi" value={statistics.feedbacks.total} icon={faComments} color="#4C51BF" />
                                        <StatCard title="Đang chờ" value={statistics.feedbacks.pending} icon={faComments} color="#E53E3E" />
                                        <StatCard title="Đang xử lý" value={statistics.feedbacks.inProgress} icon={faComments} color="#DD6B20" />
                                    </div>
                                    <div className={styles.cardGrid2}>
                                        <StatCard title="Đã giải quyết" value={statistics.feedbacks.resolved} icon={faComments} color="#38A169" />
                                        <StatCard title="Đã đóng" value={statistics.feedbacks.closed} icon={faComments} color="#718096" />
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
                                            <Tooltip formatter={(value) => [`${value} phản hồi`, 'Số lượng']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        {/* System Management Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FontAwesomeIcon icon={faTable} className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>Quản lý hệ thống</h2>
                            </div>
                            <div className={styles.managementGrid}>
                                <a href="/hocho/admin/accounts" className={`${styles.managementCard} ${styles.blueCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.blueCardIcon}`}>
                                            <FontAwesomeIcon icon={faUsers} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.blueCardTitle}`}>Quản lý tài khoản</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Quản lý tất cả tài khoản người dùng trong hệ thống</p>
                                </a>
                                <a href="/hocho/admin/tutors" className={`${styles.managementCard} ${styles.greenCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.greenCardIcon}`}>
                                            <FontAwesomeIcon icon={faUserTie} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.greenCardTitle}`}>Quản lý gia sư</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Quản lý thông tin và hồ sơ gia sư</p>
                                </a>
                                <a href="/hocho/admin/feedbacks" className={`${styles.managementCard} ${styles.purpleCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.purpleCardIcon}`}>
                                            <FontAwesomeIcon icon={faComments} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.purpleCardTitle}`}>Quản lý phản hồi</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Xem và phản hồi các góp ý từ người dùng</p>
                                </a>
                                <a href="/hocho/admin/course/approval" className={`${styles.managementCard} ${styles.yellowCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.yellowCardIcon}`}>
                                            <FontAwesomeIcon icon={faBook} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.yellowCardTitle}`}>Duyệt khóa học</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Xem xét và phê duyệt các khóa học mới</p>
                                </a>
                                <a href="/hocho/admin/video/approval" className={`${styles.managementCard} ${styles.redCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.redCardIcon}`}>
                                            <FontAwesomeIcon icon={faVideo} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.redCardTitle}`}>Duyệt video</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Xem xét và phê duyệt các video mới</p>
                                </a>
                                <a href="/hocho/admin/games/storage" className={`${styles.managementCard} ${styles.indigoCard}`}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.cardIconContainer} ${styles.indigoCardIcon}`}>
                                            <FontAwesomeIcon icon={faChild} />
                                        </div>
                                        <h3 className={`${styles.cardTitle} ${styles.indigoCardTitle}`}>Quản lý trò chơi</h3>
                                    </div>
                                    <p className={styles.cardDescription}>Quản lý các trò chơi giáo dục trong hệ thống</p>
                                </a>
                            </div>
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default AdminHome;
