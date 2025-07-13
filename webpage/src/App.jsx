import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Verify from './pages/auth/Verify';
import VerifyChild from './pages/auth/VerifyChild';

import Auth from './pages/auth/Auth';
import Home from './pages/main/Home';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/auth/Profile';
import Admin from "./pages/admin/Admin";
import AdminHome from "./pages/admin/AdminHome";

// tutor routes
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

// messaging routes
import MessagingPage from './pages/messaging/MessagingPage';

// payment routes
import PaymentHistoryPage from './pages/payment/PaymentHistoryPage';
import HandlePayosReturn from './pages/payment/HandlePayosReturn';

// course routes
import CourseDetailPage from "./pages/course/CourseDetailPage";
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

// video routes
import VideoPage from './pages/video/VideoPage';
import TeacherVideoListPage from './pages/video/TeacherVideoListPage';
import AddVideoPage from './pages/video/AddVideoPage';
import EditVideoPage from './pages/video/EditVideoPage';
import VideoApprovalPage from './pages/video/VideoApprovalPage';
import VideoPlayer from './pages/video/VideoPlayer';

// quiz routes
import QuizList from './pages/quiz/QuizList';
import QuizDetail from './pages/quiz/QuizDetail';
import QuizResult from './pages/quiz/QuizResult';
import QuizEdit from './pages/quiz/QuizEdit';
import QuizForm from './pages/quiz/QuizForm';
import QuizReview from './pages/quiz/QuizReview';
import QuizDetailTeacher from './pages/quiz/QuizDetailTeacher';

// Time Restriction Routes
import TimeRestrictionPage from "./pages/parent/TimeRestrictionPage";
import PublicCoursePage from "./pages/course/PublicCoursePage";

// Learning Progress Routes
import LearningProgress from "./pages/parent/LearningProgress";
import ParentLearningMonitor from "./pages/parent/./ParentLearningMonitor.jsx";

// Game Routes
import PlayDinoRun from "./pages/game/PlayDinoRun";
import PlayClumsyBird from "./pages/game/PlayClumsyBird";
import GamesPage from "./pages/game/GamesPage";
import LeaderboardPage from "./pages/game/GameLeaderBoard";

// Approval Routes
import CourseApproval from "./pages/course/CensorCourse";
import GameApproval from "./pages/game/GameApproval";


import TeacherVideoDetail from "./pages/video/TeacherVideoDetail";
import TrackRevenue from "./pages/course/TrackRevenue";

import LessonContentStudentPage from "./pages/course/LessonContentStudentPage";
import ChildCoursePage from "./pages/learning/ChildCoursePage.jsx";
import CourseLearningPage from "./pages/learning/CourseLearningPage.jsx";

// feedback routes
import FeedbackForm from './pages/feedback/FeedbackForm';
import MyFeedbacks from './pages/feedback/MyFeedbacks';
import AdminFeedback from './pages/admin/AdminFeedback';

import ChildLearningHistory from "./pages/learning/ChildLearningHistory.jsx";

import NotificationPage from './pages/notification/NotificationPage';

const App = () => {
    return (<Router>
        <Routes>
            // ************************************** ADMIN ONLY ROUTES **************************************
            <Route path="hocho/admin"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminHome/></ProtectedRoute>}/>
            <Route path="hocho/admin/accounts"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><Admin/></ProtectedRoute>}/>
            <Route path="hocho/admin/tutors"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminTutorList/></ProtectedRoute>}/>
            <Route path="hocho/admin/course/approval"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><CourseApproval/></ProtectedRoute>}/>
            <Route path="hocho/admin/video/approval"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><VideoApprovalPage/></ProtectedRoute>}/>
            <Route path="hocho/admin/games/storage"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><GameApproval/></ProtectedRoute>}/>
            <Route path="hocho/admin/feedbacks"
                   element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminFeedback/></ProtectedRoute>}/>

            // ************************************** TEACHER ONLY ROUTES **************************************
            {/*done*/}
            <Route path="/hocho/teacher/tutors/form"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><TutorForm/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/tutors/form/:userId"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><TutorForm/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><CoursesPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/add"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><AddCoursePage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/edit"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><EditCoursePage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/lesson-content/edit/:contentId" element={<ProtectedRoute
                allowedRoles={['ROLE_TEACHER']}><EditLessonContentPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/:courseId/lesson"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><LessonPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/:courseId/lesson/add"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><AddLessonPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><LessonContentPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/edit"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><EditLessonPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/course/:courseId/lesson/:lessonId/content/add" element={<ProtectedRoute
                allowedRoles={['ROLE_TEACHER']}><AddLessonContentPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/video" element={<ProtectedRoute
                allowedRoles={['ROLE_TEACHER']}><TeacherVideoListPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/video/add"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><AddVideoPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/video/edit/:videoId"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><EditVideoPage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/video/:videoId" element={<ProtectedRoute
                allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}><TeacherVideoDetail/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/quizzes"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><QuizList/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/quizzes/create"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><QuizForm/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/quizzes/:id"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><QuizDetailTeacher/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/quizzes/:id/edit"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><QuizEdit/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/teacher/track-revenue"
                   element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']}><TrackRevenue/></ProtectedRoute>}/>

            // ************************************** PARENT ONLY ROUTES **************************************
            {/*done*/}
            <Route path="/hocho/parent/monitor" element={<ProtectedRoute
                allowedRoles={['ROLE_PARENT']}><ParentLearningMonitor/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/parent/cart"
                   element={<ProtectedRoute allowedRoles={['ROLE_PARENT']}><ParentCart/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/parent/learning-progress/:childId"
                   element={<ProtectedRoute allowedRoles={['ROLE_PARENT']}><LearningProgress/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/payment/history"
                   element={<ProtectedRoute allowedRoles={['ROLE_PARENT']}><PaymentHistoryPage/></ProtectedRoute>}/>

            // ************************************** CHILD ONLY ROUTES **************************************
            {/*done*/}
            <Route path="/hocho/child/cart"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><ChildCart/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/questions/new"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><QuestionForm/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/questions/:id/edit"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><QuestionEdit/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/quizzes/:id/do"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><QuizDetail/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/quizzes/:id/result"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><QuizResult/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/quizzes/:id/review"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><QuizReview/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/child/games/dinoRun"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><PlayDinoRun/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/child/games/clumsyBird"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><PlayClumsyBird/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/child/course"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><ChildCoursePage/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/child/course/:courseId/learning"
                   element={<ProtectedRoute allowedRoles={['ROLE_CHILD']}><CourseLearningPage/></ProtectedRoute>}/>

            <Route path="/hocho/lesson/:lessonId/content-student" element={<LessonContentStudentPage/>}/>

            <Route path="/hocho/child/learning-history" element={<ProtectedRoute
                allowedRoles={['ROLE_CHILD']}><ChildLearningHistory/></ProtectedRoute>}/>

            // ************************************** FEEDBACK ROUTES **************************************
            {/*done*/}
            <Route path="/hocho/feedback/submit" element={<ProtectedRoute
                allowedRoles={['ROLE_CHILD', 'ROLE_PARENT', 'ROLE_TEACHER']}><FeedbackForm/></ProtectedRoute>}/>
            {/*done*/}
            <Route path="/hocho/feedback" element={<ProtectedRoute
                allowedRoles={['ROLE_CHILD', 'ROLE_PARENT', 'ROLE_TEACHER']}><MyFeedbacks/></ProtectedRoute>}/>

            // ************************************** HOME PAGE ****************************************
            {/*done*/}
            <Route path="" element={<Home/>}/>
            {/*done*/}
            <Route path="hocho/home" element={<Home/>}/>

            // ************************************** AUTH ROUTES **************************************
            {/*done*/}
            <Route path="hocho/" element={<Auth/>}/>
            {/*done*/}
            <Route path="hocho/login" element={<Auth/>}/>
            {/*done*/}
            <Route path="hocho/forgot-password" element={<ForgotPassword/>}/>
            {/*done*/}
            <Route path="hocho/reset-password" element={<ResetPassword/>}/>
            {/*done*/}
            <Route path="hocho/profile" element={<Profile/>}/>
            {/*done*/}
            <Route path="hocho/verify" element={<Verify/>}/>
            {/*done*/}
            <Route path="hocho/verify-child" element={<VerifyChild/>}/>

            // ************************************** TUTOR ROUTES *************************************
            {/*done*/}
            <Route path="hocho/tutors" element={<PublicTutorList/>}/>
            {/*done*/}
            <Route path="hocho/tutors/profile/:userId" element={<TutorProfile/>}/>
            // ************************************** SHOPPING CART ROUTES *****************************

            // ************************************** QUESTION AND ANSWER ROUTES ***********************
            {/*done*/}
            <Route path="/hocho/questions" element={<QuestionList/>}/>
            {/*done*/}
            <Route path="/hocho/questions/:id/answer" element={<AnswerForm/>}/>

            // ************************************** COURSE ROUTES ************************************
            {/*done*/}
            <Route path="/hocho/course" element={<PublicCoursePage/>}/>
            {/*done*/}
            <Route path="/hocho/course-detail/:courseId" element={<CourseDetailPage/>}/>

            // ************************************** PAYMENT ROUTES ***********************************
            <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn/>}/>

            // ************************************** LESSON ROUTES ************************************
            {/*done*/}
            <Route path="/hocho/lesson-content/:contentId" element={<LessonContentPlayer/>}/>

            // ************************************** VIDEO ROUTES *************************************
            {/*done*/}
            <Route path="/hocho/video" element={<VideoPage/>}/>
            {/*done*/}
            <Route path="/hocho/video/:videoId" element={<VideoPlayer/>}/>

            // ************************************** QUIZ ROUTES **************************************
            // ************************************** TIME RESTRICTION ROUTES **************************
            {/*done*/}
            <Route path="/hocho/parent/time-restriction" element={<ProtectedRoute
                allowedRoles={['ROLE_PARENT']}><TimeRestrictionPage/></ProtectedRoute>}/>

            // ************************************** GAME ROUTES **************************************
            {/*done*/}
            <Route path="/hocho/child/games/dinoRun" element={<PlayDinoRun/>}/>
            {/*done*/}
            <Route path="/hocho/child/games/clumsyBird" element={<PlayClumsyBird/>}/>
            {/*done*/}
            <Route path="/hocho/games" element={<GamesPage/>}/>
            {/*done*/}
            <Route path="/hocho/games/leaderboard" element={<LeaderboardPage/>}/>

            // ************************************** MESSAGING ROUTES ***********************************
            {/*done*/}
            <Route path="/hocho/messaging" element={<MessagingPage/>}/>

            // ************************************** NOTIFICATION ROUTE **************************************
            {/*done*/}
            <Route path="/hocho/notifications" element={<ProtectedRoute
                allowedRoles={['ROLE_CHILD', 'ROLE_PARENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}><NotificationPage/></ProtectedRoute>}/>

        </Routes>
    </Router>);
};

export default App;
