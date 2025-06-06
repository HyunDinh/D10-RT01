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
import PaymentPage from './components/payment/PaymentPage';
import PaymentHistoryPage from './components/payment/PaymentHistoryPage';
import HandlePayosReturn from './components/payment/HandlePayosReturn';
import './App.css';
import CoursesPage from "./components/course/CoursesPage";
import AddCoursePage from "./components/course/AddCoursePage";
import EditCoursePage from "./components/course/EditCoursePage";
// import LessonsPage from "./components/course/LessonsPage";

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
            {/*<Route path="/hocho/teacher/course/:courseId" element={<LessonsPage />} />*/}
            <Route path="/hocho/teacher/course/edit" element={<EditCoursePage />} />

            {/* Payment Routes - Tương ứng với API của project thanh toán */}
            <Route path="/hocho/checkout/:courseId" element={<PaymentPage />} /> {/* Tương ứng với /create-payment-link */}
            <Route path="/hocho/order/:orderId" element={<PaymentPage />} /> {/* Tương ứng với /order/{orderId} */}
            <Route path="/hocho/payment/history" element={<PaymentHistoryPage />} /> {/* Hiển thị lịch sử thanh toán */}
            <Route path="/hocho/handle-payos-return/:orderCode" element={<HandlePayosReturn />} />
          </Routes>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
      </Router>
  );
}

export default App;