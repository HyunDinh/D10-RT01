import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Clients from './components/Clients';
import AccessDenied from './components/AccessDenied';
import Profile from "./components/Profile";
import ChildCart from './components/shoppingCart/ChildCart';
import ParentCart from './components/shoppingCart/ParentCart';
import TutorProfile from './components/tutor/TutorProfile';
import TutorForm from './components/tutor/TutorForm';
import AdminTutorList from './components/tutor/AdminTutorList';
import PublicTutorList from './components/tutor/PublicTutorList';
import QuestionForm from './components/question/QuestionForm';
import QuestionList from './components/question/QuestionList';
import QuestionEdit from './components/question/QuestionEdit';
import AnswerForm from './components/question/AnswerForm';
import PaymentHistoryPage from './components/payment/PaymentHistoryPage';
import HandlePayosReturn from './components/payment/HandlePayosReturn';
import './App.css';
import CoursesPage from "./components/course/CoursesPage";
import AddCoursePage from "./components/course/AddCoursePage";
import EditCoursePage from "./components/course/EditCoursePage";
import LessonPage from "./components/course/LessonPage";
import AddLessonPage from "./components/course/AddLessonPage";
import LessonContentPage from "./components/course/LessonContentPage";
import AddLessonContentPage from "./components/course/AddLessonContentPage";
import EditLessonPage from "./components/course/EditLessonPage";
import LessonContentPlayer from './components/course/LessonContentPlayer';
import EditLessonContentPage from './components/course/EditLessonContentPage';

function App() {
  return (
      <Router>
        <div className="App">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hocho/home" element={<Home />} />
            <Route path="/hocho/dashboard" element={<Dashboard />} />
            <Route path="/hocho/login" element={<Login />} />
            <Route path="/hocho/profile" element={<Profile />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/hocho/clients" element={<Clients />} />
            <Route path="/hocho/access-denied" element={<AccessDenied />} />
            <Route path="/hocho/childList" element={<div>Child List Page (To be implemented)</div>} />
            <Route path="/hocho/parent" element={<div>Parent Page (To be implemented)</div>} />
            <Route path="/hocho/teacher" element={<div>Teacher Page (To be implemented)</div>} />
            <Route path="/hocho/teacher/course" element={<CoursesPage />} />
            <Route path="/hocho/teacher/course/:courseId/lesson" element={<LessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/add" element={<AddLessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content" element={<LessonContentPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/edit" element={<EditLessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content/add" element={<AddLessonContentPage/>} />

            <Route path="/hocho/child/cart" element={<ChildCart />} />
            <Route path="/hocho/parent/cart" element={<ParentCart />} />
            <Route path="/hocho/tutors/admin" element={<AdminTutorList />} />
            <Route path="/hocho/tutors" element={<PublicTutorList />} />
            <Route path="/hocho/tutors/profile/:userId" element={<TutorProfile />} />
            <Route path="/hocho/tutors/form" element={<TutorForm />} />
            <Route path="/hocho/tutors/form/:userId" element={<TutorForm />} />
            <Route path="/hocho/questions/new" element={<QuestionForm />} />
            <Route path="/hocho/questions" element={<QuestionList />} />
            <Route path="/hocho/questions/:id/edit" element={<QuestionEdit />} />
            <Route path="/hocho/questions/:id/answer" element={<AnswerForm />} />

            <Route path="/hocho/teacher/course/add" element={<AddCoursePage />} />
            <Route path="/hocho/teacher/course/edit" element={<EditCoursePage />} />

            {/* Payment Routes - Tương ứng với API của project thanh toán */}
            <Route path="/hocho/payment/history" element={<PaymentHistoryPage />} /> {/* Hiển thị lịch sử thanh toán */}
            <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn />} />

            {/* Lesson Content Routes */}
            <Route path="/lesson-content/edit/:contentId" element={<EditLessonContentPage />} />
            <Route path="/lesson-content/:contentId" element={<LessonContentPlayer />} />
          </Routes>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
      </Router>
  );
}

export default App;