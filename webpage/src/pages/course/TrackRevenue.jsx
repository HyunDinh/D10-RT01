import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/TrackRevenue.module.css';

import {
    Bar,
    BarChart,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

const COLORS = ['#0088FE', '#FF8042'];

function TrackRevenue() {
    const [teacherId, setTeacherId] = useState(1);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [topCourses, setTopCourses] = useState([]);
    const [totalStudentsToday, setTotalStudentsToday] = useState(0);
    const [ageChartData, setAgeChartData] = useState([]);
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [subjectList, setSubjectList] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        axios.get('/api/teacher/revenue/total', {withCredentials: true})
            .then(res => setTotalRevenue(res.data.totalRevenue || 0))
            .catch(err => console.error("Error fetching total revenue", err));

        axios.get('/api/teacher/student/total', {withCredentials: true})
            .then(res => setTotalStudents(res.data))
            .catch(err => console.error("Error fetching total students", err));

        axios.get('/api/teacher/courses/total', {withCredentials: true})
            .then(res => setTotalCourses(res.data))
            .catch(err => console.error("Error fetching total courses", err));

        axios.get('/api/teacher/courses/top', {withCredentials: true})
            .then(res => setTopCourses(res.data))
            .catch(err => console.error("Error fetching top courses", err));

        axios.get('/api/teacher/student/total/today', {withCredentials: true})
            .then(res => setTotalStudentsToday(res.data.totalStudents))
            .catch(err => console.error("Error fetching students today", err));

        axios.get('/api/teacher/student/age-groups', {withCredentials: true})
            .then(res => {
                const data = [{ageGroup: '4-6', students: res.data['AGE_4_6'] || 0}, {
                    ageGroup: '7-9',
                    students: res.data['AGE_7_9'] || 0
                }, {ageGroup: '10-12', students: res.data['AGE_10_12'] || 0}, {
                    ageGroup: '13-15',
                    students: res.data['AGE_13_15'] || 0
                },];
                setAgeChartData(data);
            })
            .catch(err => console.error("Error fetching age group data", err));

        axios.get('/api/teacher/revenue/daily', {withCredentials: true})
            .then(res => setDailyRevenueData(res.data))
            .catch(err => console.error("Error fetching daily revenue data", err));

        // Lấy danh sách subject (có thể hardcode nếu chưa có API)
        axios.get('/api/teacher/courses/subjects', {withCredentials: true})
            .then(res => setSubjectList(res.data))
            .catch(err => {
                // Nếu chưa có API, hardcode danh sách subject
                setSubjectList([
                    'MATHEMATICS', 'LITERATURE', 'ENGLISH', 'PHYSICS', 'CHEMISTRY',
                    'BIOLOGY', 'HISTORY', 'GEOGRAPHY', 'CIVICS', 'PHYSICAL_EDUCATION', 'TECHNOLOGY'
                ]);
            });
    }, []);

    const pieData = [{name: 'Today', value: totalStudentsToday}, {
        name: 'Before',
        value: totalStudents - totalStudentsToday
    },];

    const handleSubmit = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        const formattedStart = new Date(startDate).toISOString().split('T')[0];
        const formattedEnd = new Date(endDate).toISOString().split('T')[0];

        axios.get('/api/teacher/revenue/daily', {
            params: {startDate: formattedStart, endDate: formattedEnd}, withCredentials: true
        })
            .then(res => setDailyRevenueData(res.data))
            .catch(err => console.error("Error fetching filtered daily revenue", err));
    };

    // Hàm lấy top courses theo subject
    const fetchTopCourses = (subject = '') => {
        axios.get('/api/teacher/courses/top', {
            params: subject ? { subject } : {},
            withCredentials: true
        })
            .then(res => setTopCourses(res.data))
            .catch(err => console.error("Error fetching top courses", err));
    };

    // Khi chọn subject và submit
    const handleTopCourseFilter = (e) => {
        e.preventDefault();
        fetchTopCourses(selectedSubject);
    };

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Overview Statistics</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Overview Statistics</li>
                    </ul>
                </div>
            </section>

            <div className={styles.container}>
                {/* Total Revenue Box */}
                <div className={styles.statCardContainerTop}>
                    <div className={`${styles.statCard} ${styles.revenue}`}>
                        <p className="text-gray-500">Total Revenue</p>
                        <p className={`${styles.value}`}>{totalRevenue} VNĐ</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className={styles.chartContainer}>
                    {/* Age Bar Chart */}
                    <div className={styles.chart}>
                        <h2>Students by Age Group</h2>
                        <BarChart width={500} height={300} data={ageChartData}>
                            <XAxis dataKey="ageGroup"/>
                            <YAxis/>
                            <Tooltip/>
                            <Bar dataKey="students" fill="#8884d8"/>
                        </BarChart>
                        {/* Chú thích màu sắc cho BarChart */}
                        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginLeft: 32}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    background: '#8884d8',
                                    borderRadius: '50%',
                                    marginRight: 8,
                                    verticalAlign: 'middle'
                                }}></span>
                                <span>Số lượng học sinh theo nhóm tuổi</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards Middle */}
                    <div className={styles.statCardContainerMiddle}>
                        <div className={`${styles.statCard} ${styles.students}`}>
                            <p className="text-gray-500">Total Students</p>
                            <p className={styles.value}>{totalStudents}</p>
                        </div>
                        <div className={`${styles.statCard} ${styles.courses}`}>
                            <p className="text-gray-500">Total Courses</p>
                            <p className={styles.value}>{totalCourses}</p>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className={styles.chart}>
                        <h2>New vs Old Students</h2>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                        {/* Chú thích màu sắc */}
                        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginLeft: 32}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    background: COLORS[0],
                                    borderRadius: '50%',
                                    marginRight: 8,
                                    verticalAlign: 'middle'
                                }}></span>
                                <span>Số lượng học sinh đăng ký hôm nay</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    background: COLORS[1],
                                    borderRadius: '50%',
                                    marginRight: 8,
                                    verticalAlign: 'middle'
                                }}></span>
                                <span>Số lượng học sinh cũ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Revenue */}
                <div className={`${styles.chart} ${styles.sectionSpacing}`}>
                    <h2 style={{marginBottom: '20px'}}>Daily Revenue</h2>
                    <div className={styles.dateInputs}>
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                        <button onClick={handleSubmit}>Submit</button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyRevenueData}>
                            <XAxis dataKey="date"/>
                            <YAxis/>
                            <Tooltip/>
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Purchased Courses */}
                <div className={`${styles.tableContainer} ${styles.sectionSpacing}`}>
                    <h2 className="text-xl font-semibold mb-4">Top Purchased Courses</h2>
                    <form onSubmit={handleTopCourseFilter} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <label htmlFor="subject-select">Subject:</label>
                        <select
                            id="subject-select"
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            style={{ padding: 8, borderRadius: 6 }}
                        >
                            <option value="">All subjects</option>
                            {subjectList.map(subject => (
                                <option key={subject} value={subject}>{subject.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                        <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none' }}>
                            Filter
                        </button>
                    </form>
                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Course Name</th>
                            <th>Number of Students</th>
                            <th>Revenue</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topCourses.length > 0 ? (topCourses.map((courseData, index) => {
                                const {course, students, revenue} = courseData;
                                return (<tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{course.title}</td>
                                        <td>{students}</td>
                                        <td>{revenue} ₫</td>
                                    </tr>);
                            })) : (<tr>
                                <td colSpan="4" className="text-center">No Data Available</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer/>
        </>);
}

export default TrackRevenue;
