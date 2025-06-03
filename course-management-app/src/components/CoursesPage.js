// File: src/components/CoursesPage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from "axios";

export default function CoursesPage() {
  const { teacherId } = useParams(); // teacherId should be provided via route params
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCoursesFromTeachers();
  }, []);

  const fetchCoursesFromTeachers = async() => {
    const result = await axios.get('/teachers/' + teacherId + '/courses');
    setCourses(result.data);
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Course List</h1>
      <div className="mb-3">
        <Link to={`/teachers/${teacherId}/courses/add`} className="btn btn-success me-2">
          Add New Course
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back to Teachers
        </Link>
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
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_id}</td>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{course.age_group}</td>
                <td>{course.price}</td>
                <td>{course.status}</td>
                <td>{new Date(course.created_at).toLocaleString()}</td>
                <td>{course.updated_at && new Date(course.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};