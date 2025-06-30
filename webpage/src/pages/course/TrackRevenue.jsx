import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell,
} from 'recharts';

const ageChartData = [
    { ageGroup: '4-6', students: 150 },
    { ageGroup: '7-9', students: 300 },
    { ageGroup: '10-12', students: 420 },
    { ageGroup: '13-15', students: 290 },
];

const pieData = [
    { name: 'Hôm nay', value: 124 },
    { name: 'Trước đó', value: 1116 },
];

const COLORS = ['#0088FE', '#FF8042'];

const topCourses = [
    { name: 'Toán lớp 5', students: 200, revenue: 4000 },
    { name: 'Tiếng Anh lớp 3', students: 180, revenue: 3600 },
    { name: 'Khoa học vui', students: 150, revenue: 3000 },
    { name: 'Lập trình Scratch', students: 120, revenue: 2500 },
    { name: 'Tư duy logic', students: 100, revenue: 2000 },
];

export default function Dashboard() {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Thống kê tổng quan</h1>

            {/* Top 3 statistic cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 shadow rounded">
                    <p className="text-gray-500">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-green-600">$18,600</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <p className="text-gray-500">Tổng học sinh</p>
                    <p className="text-2xl font-bold text-blue-600">1,240</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <p className="text-gray-500">Tổng khóa học</p>
                    <p className="text-2xl font-bold text-purple-600">36</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Bar Chart: Students by Age Group */}
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl mb-2 font-semibold">Số học sinh theo độ tuổi</h2>
                    <BarChart width={500} height={300} data={ageChartData}>
                        <XAxis dataKey="ageGroup" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Pie Chart: New vs Old Students */}
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl mb-2 font-semibold">Tỷ lệ học sinh mới hôm nay</h2>
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
            <div className="bg-white p-6 shadow rounded">
                <h2 className="text-xl mb-4 font-semibold">Top khóa học được mua nhiều</h2>
                <table className="w-full table-auto">
                    <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Tên khóa học</th>
                        <th className="p-2">Số học sinh</th>
                        <th className="p-2">Doanh thu ($)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {topCourses.map((course, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{course.name}</td>
                            <td className="p-2">{course.students}</td>
                            <td className="p-2">{course.revenue}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
