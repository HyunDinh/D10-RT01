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
import VideoPage from './components/video/VideoPage';
import TeacherVideoListPage from './components/video/TeacherVideoListPage';
import AddVideoPage from './components/video/AddVideoPage';
import EditVideoPage from './components/video/EditVideoPage';
import VideoApprovalPage from './components/video/VideoApprovalPage';
import VideoPlayer from './components/video/VideoPlayer';
import QuizList from './components/quiz/QuizList';
import QuizDetail from './components/quiz/QuizDetail';
import QuizResult from './components/quiz/QuizResult';
import QuizEdit from './components/quiz/QuizEdit';
import QuizForm from './components/quiz/QuizForm';
import QuizReview from './components/quiz/QuizReview';
import QuizDetailTeacher from './components/quiz/QuizDetailTeacher';

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

            {/* Shooping Cart Routes */}
            <Route path="/hocho/child/cart" element={<ChildCart />} />  {/* Trang giỏ hàng của trẻ em */}
            <Route path="/hocho/parent/cart" element={<ParentCart />} /> {/* Trang giỏ hàng của phụ huynh */}

            {/* Tutor Routes */}
            <Route path="/hocho/tutors/admin" element={<AdminTutorList />} />  {/* Trang quản lý thông tin gia sư */}
            <Route path="/hocho/tutors" element={<PublicTutorList />} /> {/* Trang thông tin gia sư */}
            <Route path="/hocho/tutors/profile/:userId" element={<TutorProfile />} /> {/* Trang xem chi tiết thông tin gia sư */}
            <Route path="/hocho/tutors/form" element={<TutorForm />} /> {/* Trang đăng ký form thông tin gia sư */}
            <Route path="/hocho/tutors/form/:userId" element={<TutorForm />} /> {/* Trang chỉnh sửa thông tin gia sư */}

            {/* Question and Answer Routes */}
            <Route path="/hocho/questions/new" element={<QuestionForm />} /> {/* Trang tạo câu hỏi dành cho trẻ em */}
            <Route path="/hocho/questions" element={<QuestionList />} />  {/* Trang diễn đàn câu hỏi */}
            <Route path="/hocho/questions/:id/edit" element={<QuestionEdit />} /> {/* Trang chỉnh sửa câu hỏi  */}
            <Route path="/hocho/questions/:id/answer" element={<AnswerForm />} /> {/* Trang trả lời câu hỏi và có thể chỉnh sửa  */}


            {/* Course Routes */}
            <Route path="/hocho/teacher/course" element={<CoursesPage />} />
            <Route path="/hocho/teacher/course/add" element={<AddCoursePage />} />
            <Route path="/hocho/teacher/course/edit" element={<EditCoursePage />} />

            {/* Payment Routes - Tương ứng với API của project thanh toán */}
            <Route path="/hocho/payment/history" element={<PaymentHistoryPage />} /> {/* Hiển thị lịch sử thanh toán */}
            <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn />} />

            {/* Lesson Routes */}
            <Route path="/lesson-content/edit/:contentId" element={<EditLessonContentPage />} />
            <Route path="/lesson-content/:contentId" element={<LessonContentPlayer />} />
            <Route path="/hocho/teacher/course/:courseId/lesson" element={<LessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/add" element={<AddLessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content" element={<LessonContentPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/edit" element={<EditLessonPage/>} />
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content/add" element={<AddLessonContentPage/>} />

            {/* Video Routes */}
            <Route path="/hocho/video" element={<VideoPage />} /> {/* Trang xem video cho trẻ em */}
            <Route path="/hocho/teacher/video" element={<TeacherVideoListPage />} /> {/* Trang quản lý video cho giáo viên */}
            <Route path="/hocho/teacher/video/add" element={<AddVideoPage />} /> {/* Trang thêm video mới */}
            <Route path="/hocho/teacher/video/edit/:videoId" element={<EditVideoPage />} /> {/* Trang chỉnh sửa video */}
            <Route path="/hocho/admin/video/approval" element={<VideoApprovalPage />} /> {/* Trang duyệt video cho admin */}
            <Route path="/video/:videoId" element={<VideoPlayer />} /> {/* Trang xem video (chỉ thấy 1  video) */}

            {/* Quiz Routes */}
            <Route path="/quizzes" element={<QuizList />} /> {/* Trang hiển thị các quizzes của giáo viên */}
            <Route path="/quizzes/create" element={<QuizForm />} /> {/* Trang tạo quizzes của giáo viên */}
            <Route path="/quizzes/:id" element={<QuizDetailTeacher />} /> {/* Trang hiển thị thông tin chi tiết của bài quizz dành cho giáo viên */}
            <Route path="/quizzes/:id/do" element={<QuizDetail />} /> {/* Trang làm bài quiz dành cho trẻ em */}
            <Route path="/quizzes/:id/edit" element={<QuizEdit />} /> {/* Trang chỉnh sửa bài quizz dành cho giáo viên */}
            <Route path="/quizzes/:id/result" element={<QuizResult />} /> {/* Trang hiển thị kết quả bài quizz dành cho trẻ em */}
            <Route path="/quizzes/:id/review" element={<QuizReview />} /> {/* Trang xem lại kết quả chi tiết bài quizz dành cho trẻ em */}
          </Routes>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
      </Router>
  );
}

export default App;