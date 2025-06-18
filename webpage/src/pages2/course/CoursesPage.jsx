import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import {toast} from "react-toastify";

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const result = await axios.get('/api/teacher/courses', {
        withCredentials: true,
      });
      // Kiểm tra xem result.data có phải là mảng không
      const coursesData = Array.isArray(result.data) ? result.data : [];
      const mappedCourses = coursesData.map(course => ({
        ...course,
        ageGroup: course.age_group || course.ageGroup,
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

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    try {
      await axios.delete(`/api/teacher/course/${courseId}`, {
        withCredentials: true
      });
      // toast.success('Course deleted successfully!');
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response?.status === 401) {
        navigate('/hocho/login');
      } else {
        // toast.error('Failed to delete course');
        setError('Failed to delete course. Please try again later.');
      }
    }
  };

  // Get distinct age groups for the dropdown
  const ageGroups = Array.from(new Set(courses.map(course => course.ageGroup))).filter(Boolean);

  // Filter courses based on the dropdown selection
  const filteredCourses = filter === 'All'
    ? courses
    : courses.filter(course => course.ageGroup === filter);

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Course List</h1>
        <div>
          <Link to="/hocho/teacher/course/add" className="btn btn-success me-2">
            Add New Course
          </Link>
          <Link to="/hocho/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Dropdown for filtering courses by age group */}
      <div className="mb-3">
        <select
          className="form-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Age Groups</option>
          {ageGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Age Group</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => (
              <tr key={course.courseId}>
                <td>{course.title}</td>
                <td>{course.ageGroup}</td>
                <td>{course.price}</td>
                <td>{course.status}</td>
                <td>{new Date(course.createdAt).toLocaleString()}</td>
                <td>
                  <Link to={`/hocho/teacher/course/${course.courseId}/lesson`} className="btn btn-dark btn-sm me-2">
                    View Lessons
                  </Link>
                  <Link 
                    to="/hocho/teacher/course/edit" 
                    state={{ course }} 
                    className="btn btn-warning btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(course.courseId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}