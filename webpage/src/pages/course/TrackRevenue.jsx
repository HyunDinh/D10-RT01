import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/TrackRevenue.module.css';

import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#FF8042'];

function TrackRevenue() {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [topCourses, setTopCourses] = useState([]);
    const [totalStudentsToday, setTotalStudentsToday] = useState(0);
    const [ageChartData, setAgeChartData] = useState([]); // Contains data for students by age group

    // Fetch data on component load
    useEffect(() => {
        axios.get('/api/teacher/revenue/total', { withCredentials: true })
            .then(response => setTotalRevenue(response.data.totalRevenue || 0))
            .catch(error => console.error("Error fetching total revenue", error));

        axios.get('/api/teacher/student/total', { withCredentials: true })
            .then(response => setTotalStudents(response.data))
            .catch(error => console.error("Error fetching total students", error));

        axios.get('/api/teacher/courses/total', { withCredentials: true })
            .then(response => setTotalCourses(response.data))
            .catch(error => console.error("Error fetching total courses", error));

        axios.get('/api/teacher/courses/top', { withCredentials: true })
            .then(response => setTopCourses(response.data))
            .catch(error => console.error("Error fetching top courses", error));

        axios.get('/api/teacher/student/total/today', { withCredentials: true })
            .then(response => setTotalStudentsToday(response.data.totalStudents))
            .catch(error => console.error("Error fetching students today", error));

        axios.get('/api/teacher/student/age-groups', { withCredentials: true })
            .then(response => {
                const data = [
                    { ageGroup: '4-6', students: response.data['AGE_4_6'] || 0 },
                    { ageGroup: '7-9', students: response.data['AGE_7_9'] || 0 },
                    { ageGroup: '10-12', students: response.data['AGE_10_12'] || 0 },
                    { ageGroup: '13-15', students: response.data['AGE_13_15'] || 0 },
                ];
                setAgeChartData(data); // Update data for the Bar Chart
            })
            .catch(error => console.error("Error fetching age group data", error));
    }, []);

    const pieData = [
        { name: 'Today', value: totalStudentsToday },
        { name: 'Before', value: totalStudents - totalStudentsToday },
    ];

    return (
        <div className={styles.container}>
            <h1 className="text-3xl font-bold mb-6">Overview Statistics</h1>

            {/* Total Revenue Box */}
            <div className={styles.statCardContainerTop}>
                <div className={`${styles.statCard} ${styles.revenue}`}>
                    <p className="text-gray-500">Total Revenue</p>
                    <p className={`${styles.value} value`}>{totalRevenue} ₫</p>  {/* Bold & Large */}
                </div>
            </div>

            {/* Charts */}
            <div className={styles.chartContainer}>
                {/* Bar Chart: Students by Age Group */}
                <div className={styles.chart}>
                    <h2>Students by Age Group</h2>
                    <BarChart width={500} height={300} data={ageChartData}>
                        <XAxis dataKey="ageGroup" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Stacked statistic cards for students and courses */}
                <div className={styles.statCardContainerMiddle}>
                    <div className={`${styles.statCard} ${styles.students}`}>
                        <p className="text-gray-500">Total Students</p>
                        <p className={`${styles.value} value`}>{totalStudents}</p>  {/* Bold & Large */}
                    </div>
                    <div className={`${styles.statCard} ${styles.courses}`}>
                        <p className="text-gray-500">Total Courses</p>
                        <p className={`${styles.value} value`}>{totalCourses}</p>  {/* Bold & Large */}
                    </div>
                </div>

                {/* Pie Chart: New vs Old Students */}
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            </div>

            {/* Top courses table */}
            <div className={styles.tableContainer}>
                <h2 className="text-xl font-semibold mb-4">Top Purchased Courses</h2>
                <table>
                    <thead>
                    <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Course Name</th>
                        <th className="p-2">Number of Students</th>
                        <th className="p-2">Revenue</th>
                    </tr>
                    </thead>
                    <tbody>
                    {topCourses.length > 0 ? (
                        topCourses.map((courseData, index) => {
                            const { course, students, revenue } = courseData;
                            return (
                                <tr key={index}>
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{course.title}</td>
                                    <td className="p-2">{students}</td>
                                    <td className="p-2">{revenue} ₫</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-2 text-center">No Data Available</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default TrackRevenue;
