import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Verify from './pages/auth/Verify';
import VerifyChild from './pages/auth/VerifyChild';
import Auth from './pages/auth/Auth';
import Home from './pages/main/Home';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/auth/Profile';


import Admin from './pages/admin/Admin';

import TutorProfile from './pages/tutor/TutorProfile';
import TutorForm from './pages/tutor/TutorForm';
import AdminTutorList from './pages/tutor/AdminTutorList';
import PublicTutorList from './pages/tutor/PublicTutorList';

// shopping cart routes
import ChildCart from './pages/shoppingCart/ChildCart';
import ParentCart from './pages/shoppingCart/ParentCart';

// question and answer routes
import QuestionForm from './pages/question/QuestionForm';
import QuestionList from './pages/question/QuestionList';
import QuestionEdit from './pages/question/QuestionEdit';
import AnswerForm from './pages/question/AnswerForm';

// payment routes
import PaymentHistoryPage from './pages/payment/PaymentHistoryPage';
import HandlePayosReturn from './pages/payment/HandlePayosReturn';

// course routes
import CoursesPage from "./pages/course/CoursesPage";
import AddCoursePage from "./pages/course/AddCoursePage";
import EditCoursePage from "./pages/course/EditCoursePage";
import LessonPage from "./pages/course/LessonPage";
import AddLessonPage from "./pages/course/AddLessonPage";
import LessonContentPage from "./pages/course/LessonContentPage";
import AddLessonContentPage from "./pages/course/AddLessonContentPage";
import EditLessonPage from "./pages/course/EditLessonPage";
import LessonContentPlayer from './pages/course/LessonContentPlayer';
import EditLessonContentPage from './pages/course/EditLessonContentPage';
import CourseDetailPage from "./pages/course/CourseDetailPage";

// video routes
import VideoPage from './pages/video/VideoPage';
import TeacherVideoListPage from './pages/video/TeacherVideoListPage';
import AddVideoPage from './pages/video/AddVideoPage';
import EditVideoPage from './pages/video/EditVideoPage';
import VideoApprovalPage from './pages/video/VideoApprovalPage';
import VideoPlayer from './pages/video/VideoPlayer';
import TeacherVideoDetail from './pages/video/TeacherVideoDetail';

// quiz routes
import QuizList from './pages/quiz/QuizList';
import QuizDetail from './pages/quiz/QuizDetail';
import QuizResult from './pages/quiz/QuizResult';
import QuizEdit from './pages/quiz/QuizEdit';
import QuizForm from './pages/quiz/QuizForm';
import QuizReview from './pages/quiz/QuizReview';
import QuizDetailTeacher from './pages/quiz/QuizDetailTeacher';

// Time Restriction Routes
import PublicCoursePage from "./pages/course/PublicCoursePage";

// Game Routes
import PlayDino from "./pages/game/PlayDinoRun";
import PlayClumsyBird from "./pages/game/PlayClumsyBird";
import GamesPage from "./pages/game/GamesPage.jsx";

// Approval Routes
import CourseApproval from "./pages/course/CensorCourse";
import GameApproval from "./pages/game/GameApproval";
import PlayDinoRun from "./pages/game/PlayDinoRun";


const App = () => {
    return (<Router>
            <Routes>
                // ************************************** ADMIN ROUTES **************************************

                <Route path="hocho/admin/accounts" element={<Admin/>}/>
                <Route path="hocho/admin/tutors" element={<AdminTutorList/>}/>
                <Route path="hocho/admin/course/approval"  element={<CourseApproval />} />
                <Route path="hocho/admin/video/approval" element={<VideoApprovalPage/>}/>
                <Route path="hocho/admin/games/storage" element={<GameApproval />} />

                // ************************************** HOME PAGE **************************************

                <Route path="" element={<Home/>}/>
                <Route path="hocho/home" element={<Home/>}/>

                // ************************************** AUTH ROUTES **************************************

                <Route path="hocho/" element={<Auth/>}/>
                <Route path="hocho/login" element={<Auth/>}/>
                <Route path="hocho/forgot-password" element={<ForgotPassword/>}/>
                <Route path="hocho/reset-password" element={<ResetPassword/>}/>
                <Route path="hocho/profile" element={<Profile/>}/>
                <Route path="hocho/verify" element={<Verify/>}/>
                <Route path="hocho/verify-child" element={<VerifyChild/>}/>

                // ************************************** TUTOR ROUTES **************************************

                <Route path="hocho/tutors" element={<PublicTutorList/>}/>
                <Route path="hocho/tutors/profile/:userId" element={<TutorProfile/>}/>
                <Route path="hocho/tutors/form" element={<TutorForm/>}/>
                <Route path="hocho/tutors/form/:userId" element={<TutorForm/>}/>

                // ************************************** SHOPPING CART ROUTES **************************************

                <Route path="/hocho/child/cart" element={<ChildCart/>}/>
                <Route path="/hocho/parent/cart" element={<ParentCart/>}/>

                // ************************************** QUESTION AND ANSWER ROUTES **************************************

                <Route path="/hocho/questions/new" element={<QuestionForm/>}/>
                <Route path="/hocho/questions" element={<QuestionList/>}/>
                <Route path="/hocho/questions/:id/edit" element={<QuestionEdit/>}/>
                <Route path="/hocho/questions/:id/answer" element={<AnswerForm/>}/>

                // ************************************** COURSE ROUTES **************************************

                <Route path="/hocho/course" element={<PublicCoursePage/>}/>
                <Route path="/hocho/course-detail/:courseId" element={<CourseDetailPage/>}/>
                <Route path="/hocho/teacher/course" element={<CoursesPage/>}/>
                <Route path="/hocho/teacher/course/add" element={<AddCoursePage/>}/>
                <Route path="/hocho/teacher/course/edit" element={<EditCoursePage/>}/>

                // ************************************** PAYMENT ROUTES **************************************

                <Route path="/hocho/payment/history" element={<PaymentHistoryPage/>}/>
                <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn/>}/>

                // ************************************** LESSON ROUTES **************************************

                <Route path="/hocho/lesson-content/edit/:contentId" element={<EditLessonContentPage/>}/>
                <Route path="/hocho/lesson-content/:contentId" element={<LessonContentPlayer/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson" element={<LessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/add" element={<AddLessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content" element={<LessonContentPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/edit" element={<EditLessonPage/>}/>
                <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content/add"  element={<AddLessonContentPage/>}/>

                // ************************************** VIDEO ROUTES **************************************

                <Route path="/hocho/video" element={<VideoPage/>}/>
                <Route path="/hocho/teacher/video" element={<TeacherVideoListPage/>}/>
                <Route path="/hocho/teacher/video/add" element={<AddVideoPage/>}/>
                <Route path="/hocho/teacher/video/edit/:videoId" element={<EditVideoPage/>}/>
                <Route path="/hocho/video/:videoId" element={<VideoPlayer/>}/>
                <Route path="/hocho/teacher/video/:videoId" element={<TeacherVideoDetail/>}/>

                // ************************************** QUIZ ROUTES **************************************

                <Route path="/hocho/quizzes" element={<QuizList/>}/>
                <Route path="/hocho/quizzes/create" element={<QuizForm/>}/>
                <Route path="/hocho/quizzes/:id" element={<QuizDetailTeacher/>}/>
                <Route path="/hocho/quizzes/:id/do" element={<QuizDetail/>}/>
                <Route path="/hocho/quizzes/:id/edit" element={<QuizEdit/>}/>
                <Route path="/hocho/quizzes/:id/result" element={<QuizResult/>}/>
                <Route path="/hocho/quizzes/:id/review" element={<QuizReview/>}/>
            
                // ************************************** TIME RESTRICTION ROUTES **************************************


                // ************************************** GAME ROUTES **************************************

                <Route path="/hocho/child/games/dinoRun" element={<PlayDinoRun />} />
                <Route path="/hocho/child/games/clumsyBird" element={<PlayClumsyBird />} />
                <Route path="/hocho/games" element={<GamesPage />} />

            </Routes>
        </Router>);
};

export default App;
