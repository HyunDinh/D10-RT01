import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './CoursesList.css'; // Optional, for styling if needed

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 12;

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/courses'); // Replace with your API endpoint
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const totalPages = Math.ceil(courses.length / coursesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mt-5">
            <h2 className="text-primary text-center mb-4">Danh sách các khóa học</h2>
            <div className="row g-4">
                {currentCourses.map(course => (
                    <div key={course.id} className="col-md-4">
                        <div className="card h-100 course-card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{course.title}</h5>
                                <p className="card-text">
                                    <b>Description</b> {course.description.substring(0, 100)}...
                                </p>
                                <p className="card-text"><b>Giá:</b> {course.price} VND</p>
                                <button className="btn btn-primary btn-sm">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        {[...Array(totalPages).keys()].map(page => (
                            <li
                                key={page}
                                className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                                onClick={() => paginate(page + 1)}
                            >
                                <button className="page-link">
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default CoursesList;