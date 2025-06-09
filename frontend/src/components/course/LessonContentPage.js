// File: `frontend/src/components/course/LessonContentDisplayPage.js`
import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

export default function LessonContentPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [courseId, lessonId]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/lessons/${lessonId}/contents`, { withCredentials: true });
      setContent(response.data);
    } catch (err) {
      console.error('Error fetching lesson content:', err);
      setError('Failed to load lesson content. Please try again later.');
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mt-5">
        <p>Loading lesson content...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">


        <Link to={`/hocho/teacher/course/${courseId}/lesson/${lessonId}/content/add`} className="btn btn-primary">
            Add New Content
        </Link>
        <Link to={`/hocho/teacher/course/${courseId}/lesson`} className="btn btn-secondary ms-2">
            Back to Lesson
        </Link>
    </div>
  );
}