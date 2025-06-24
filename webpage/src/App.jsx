import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Verify from './pages/Verify';
import VerifyChild from './pages/VerifyChild';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Auth from './pages2/Auth';
import Home from './pages2/Home';
import ForgotPassword from './pages2/ForgotPassword';
import ResetPassword from './pages2/ResetPassword';
import Profile from './pages2/Profile';


import Admin from './pages2/admin/Admin';

import TutorProfile from './pages2/tutor/TutorProfile';
import TutorForm from './pages2/tutor/TutorForm';
import AdminTutorList from './pages2/tutor/AdminTutorList';
import PublicTutorList from './pages2/tutor/PublicTutorList';

// shopping cart routes
import ChildCart from './pages2/shoppingCart/ChildCart';
import ParentCart from './pages2/shoppingCart/ParentCart';

// question and answer routes
import QuestionForm from './pages2/question/QuestionForm';
import QuestionList from './pages2/question/QuestionList';
import QuestionEdit from './pages2/question/QuestionEdit';
import AnswerForm from './pages2/question/AnswerForm';

// payment routes
import PaymentHistoryPage from './pages2/payment/PaymentHistoryPage';
import HandlePayosReturn from './pages2/payment/HandlePayosReturn';

// course routes
import CoursesPage from "./pages2/course/CoursesPage";
import AddCoursePage from "./pages2/course/AddCoursePage";
import EditCoursePage from "./pages2/course/EditCoursePage";
import LessonPage from "./pages2/course/LessonPage";
import AddLessonPage from "./pages2/course/AddLessonPage";
import LessonContentPage from "./pages2/course/LessonContentPage";
import AddLessonContentPage from "./pages2/course/AddLessonContentPage";
import EditLessonPage from "./pages2/course/EditLessonPage";
import LessonContentPlayer from './pages2/course/LessonContentPlayer';
import EditLessonContentPage from './pages2/course/EditLessonContentPage';
import CourseDetailPage from "./pages2/course/CourseDetailPage";

// video routes
import VideoPage from './pages2/video/VideoPage';
import TeacherVideoListPage from './pages2/video/TeacherVideoListPage';
import AddVideoPage from './pages2/video/AddVideoPage';
import EditVideoPage from './pages2/video/EditVideoPage';
import VideoApprovalPage from './pages2/video/VideoApprovalPage';
import VideoPlayer from './pages2/video/VideoPlayer';
import TeacherVideoDetail from './pages2/video/TeacherVideoDetail';

// quiz routes
import QuizList from './pages2/quiz/QuizList';
import QuizDetail from './pages2/quiz/QuizDetail';
import QuizResult from './pages2/quiz/QuizResult';
import QuizEdit from './pages2/quiz/QuizEdit';
import QuizForm from './pages2/quiz/QuizForm';
import QuizReview from './pages2/quiz/QuizReview';
import QuizDetailTeacher from './pages2/quiz/QuizDetailTeacher';

// Time Restriction Routes
// import TimeRestrictionPage from "./pages2/parent/TimeRestrictionPage";
import PublicCoursePage from "./pages2/course/PublicCoursePage";

// Game Routes
import PlayDino from "./pages2/game/PlayDinoRun";
import PlayClumsyBird from "./pages2/game/PlayClumsyBird";
import GamesPage from "./pages2/game/GamesPage.jsx";

// Approval Routes
import CourseApproval from "./pages2/course/CensorCourse";
import GameApproval from "./pages2/game/GameApproval";
import PlayDinoRun from "./pages2/game/PlayDinoRun";


const App = () => {
    return (<Router>
            <link href="https://cdn..net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
            <Routes>
                <Route path="" element={<Home/>}/>

                {/*// new*/}
                <Route path="hocho/login" element={<Auth/>}/>
                <Route path="hocho/home" element={<Home/>}/>
                <Route path="hocho/forgot-password" element={<ForgotPassword/>}/>
                <Route path="hocho/reset-password" element={<ResetPassword/>}/>
                <Route path="hocho/profile" element={<Profile/>}/>
                <Route path="hocho/admin" element={<Admin/>}/>

                  
                <Route path="hocho/verify" element={<Verify/>}/>
                <Route path="hocho/verify-child" element={<VerifyChild/>}/>
                <Route path="hocho/welcome" element={<Welcome/>}/>
                <Route path="hocho/dashboard" element={<Dashboard/>}/>
                <Route path="hocho/" element={<Auth/>}/>

                {/* Tutor Routes */}
                <Route path="hocho/tutors/admin" element={<AdminTutorList/>}/> {/* Trang quản lý thông tin gia sư */}
                <Route path="hocho/tutors" element={<PublicTutorList/>}/> {/* Trang thông tin gia sư */}
                <Route path="hocho/tutors/profile/:userId"
                       element={<TutorProfile/>}/> {/* Trang xem chi tiết thông tin gia sư */}
                <Route path="hocho/tutors/form" element={<TutorForm/>}/> {/* Trang đăng ký form thông tin gia sư */}
                <Route path="hocho/tutors/form/:userId"
                       element={<TutorForm/>}/> {/* Trang chỉnh sửa thông tin gia sư */}

                {/* Shooping Cart Routes */}
                <Route path="/hocho/child/cart" element={<ChildCart/>}/> {/* Trang giỏ hàng của trẻ em */}
                <Route path="/hocho/parent/cart" element={<ParentCart/>}/> {/* Trang giỏ hàng của phụ huynh */}

                {/* Question and Answer Routes */}
                <Route path="/hocho/questions/new" element={<QuestionForm/>}/> {/* Trang tạo câu hỏi dành cho trẻ em */}
                <Route path="/hocho/questions" element={<QuestionList/>}/> {/* Trang diễn đàn câu hỏi */}
                <Route path="/hocho/questions/:id/edit" element={<QuestionEdit/>}/> {/* Trang chỉnh sửa câu hỏi  */}
                <Route path="/hocho/questions/:id/answer"
                       element={<AnswerForm/>}/> {/* Trang trả lời câu hỏi và có thể chỉnh sửa  */}

                {/* Course Routes */}
                <Route path="/hocho/course" element={<PublicCoursePage/>}/>
                <Route path="/hocho/course-detail/:courseId" element={<CourseDetailPage/>}/>
                <Route path="/hocho/teacher/course" element={<CoursesPage/>}/>
                <Route path="/hocho/teacher/course/add" element={<AddCoursePage/>}/>
                <Route path="/hocho/teacher/course/edit" element={<EditCoursePage/>}/>
                <Route path="/hocho/admin/course/approval"  element={<CourseApproval />} /> {/* Trang admin approve khoá học  */}

                {/* Payment Routes - Tương ứng với API của project thanh toán */}
                <Route path="/hocho/payment/history"
                       element={<PaymentHistoryPage/>}/> {/* Hiển thị lịch sử thanh toán */}
                <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn/>}/>

                {/* Lesson Routes */}
                <Route path="/hocho/lesson-content/edit/:contentId" element={<EditLessonContentPage/>}/>
                <Route path="/hocho/lesson-content/:contentId" element={<LessonContentPlayer/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson" element={<LessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/add" element={<AddLessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content" element={<LessonContentPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/edit" element={<EditLessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content/add"
                       element={<AddLessonContentPage/>}/>

                {/* Video Routes */}
                <Route path="/hocho/video" element={<VideoPage/>}/> {/* Trang xem video cho trẻ em done */}
                <Route path="/hocho/teacher/video"
                       element={<TeacherVideoListPage/>}/> {/* Trang quản lý video cho giáo viên done*/}
                <Route path="/hocho/teacher/video/add" element={<AddVideoPage/>}/> {/* Trang thêm video mới done*/}
                <Route path="/hocho/teacher/video/edit/:videoId"
                       element={<EditVideoPage/>}/> {/* Trang chỉnh sửa videodone */}
                <Route path="/hocho/admin/video/approval"
                       element={<VideoApprovalPage/>}/> {/* Trang duyệt video cho admin done */}
                <Route path="/hocho/video/:videoId"
                       element={<VideoPlayer/>}/> {/* Trang xem video (chỉ thấy 1  video)done */}
                <Route path="/hocho/teacher/video/:videoId" element={<TeacherVideoDetail/>}/> {/* Trang chi tiết video cho giáo viên */}

                {/* Quiz Routes */}
                <Route path="/hocho/quizzes" element={<QuizList/>}/> {/* Trang hiển thị các quizzes của giáo viên */}
                <Route path="/hocho/quizzes/create" element={<QuizForm/>}/> {/* Trang tạo quizzes của giáo viên */}
                <Route path="/hocho/quizzes/:id" element={
                    <QuizDetailTeacher/>}/> {/* Trang hiển thị thông tin chi tiết của bài quizz dành cho giáo viên */}
                <Route path="/hocho/quizzes/:id/do" element={<QuizDetail/>}/> {/* Trang làm bài quiz dành cho trẻ em */}
                <Route path="/hocho/quizzes/:id/edit"
                       element={<QuizEdit/>}/> {/* Trang chỉnh sửa bài quizz dành cho giáo viên */}
                <Route path="/hocho/quizzes/:id/result"
                       element={<QuizResult/>}/> {/* Trang hiển thị kết quả bài quizz dành cho trẻ em */}
                <Route path="/hocho/quizzes/:id/review"
                       element={<QuizReview/>}/> {/* Trang xem lại kết quả chi tiết bài quizz dành cho trẻ em */}

            
                {/* Time Restriction Routes */}
                {/*<Route path="/hocho/parent/time-restriction" element={<TimeRestrictionPage/>}/>*/}

                {/* Admin Routes */}
                
                {/* Game Routes */}
                <Route path="/hocho/child/games/dinoRun" element={<PlayDinoRun />} />
                <Route path="/hocho/child/games/clumsyBird" element={<PlayClumsyBird />} />
                <Route path="/hocho/admin/games/storage" element={<GameApproval />} />
                <Route path="/hocho/games" element={<GamesPage />} />

            </Routes>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </Router>);
};

export default App;
