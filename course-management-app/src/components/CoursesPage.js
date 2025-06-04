// File: `course-management-app/src/components/CoursesPage.js`
import React, { useState, useEffect } from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {toast} from "react-toastify";

export default function CoursesPage() {
  const { userId, courseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (userId && userId !== 'undefined') {
      fetchCourses();
    }
  }, [userId]);

  // Fetch and sort courses by ageGroup alphabetically
  const fetchCourses = async () => {
    try {
      const result = await axios.get(`/api/teachers/${userId}/courses`);
      const mappedCourses = result.data.map(course => ({
        ...course,
        ageGroup: course.age_group || course.ageGroup,
      }));
      mappedCourses.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup));
      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    try {
      await axios.delete(`/api/teachers/${userId}/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      // Refresh course list
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  }

  // Get distinct age groups for the dropdown
  const ageGroups = Array.from(new Set(courses.map(course => course.ageGroup))).filter(Boolean);

  // Filter courses based on the dropdown selection
  const filteredCourses = filter === 'All'
      ? courses
      : courses.filter(course => course.ageGroup === filter);



  return (
      <div className="container mt-5">
        <h1 className="mb-4">Course List</h1>
        <div className="mb-3">
          <Link to={`/teachers/${userId}/courses/add`} className="btn btn-success me-2">
            Add New Course
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Teachers
          </Link>
        </div>
        {/* Dropdown for filtering courses by age group */}
        <div className="mb-3">
          <select
              className="form-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            {ageGroups.map(group => (
                <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Age group</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created at</th>
              <th>Updated at</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredCourses.map(course => (
                <tr key={course.courseId}>
                  <td>{course.courseId}</td>
                  <td>{course.title}</td>
                  <td>{course.description}</td>
                  <td>{course.ageGroup}</td>
                  <td>{course.price}</td>
                  <td>{course.status}</td>
                  <td>{new Date(course.createdAt).toLocaleString()}</td>
                  <td>{course.updatedAt && new Date(course.updatedAt).toLocaleString()}</td>
                  <td>
                    {/* Added Edit and Delete buttons */}
                    <Link to={`/teachers/${userId}/courses/${course.courseId}/edit`} className="btn btn-success w-100 mt-2">
                      Edit
                    </Link>
                    <button
                        className="btn btn-danger w-100 mt-2"
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