import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AddCoursePage from "./components/AddCoursePage";
import CoursesPage from "./components/CoursesPage";
import TeachersPage from "./components/TeachersPage";
import EditCoursePage from "./components/EditCoursePage";

function App() {
  return (
    <Router>
        <Routes>
            <Route exact path="/teachers/:userId/courses/:courseId/edit" element={<EditCoursePage/>} />
            <Route exact path="/teachers/:userId/courses/add" element={<AddCoursePage/>} />
            <Route exact path="/teachers/:userId/courses" element={<CoursesPage/>} />
            <Route exact path="/" element={<TeachersPage/>} />
        </Routes>
    </Router>
  );
}

export default App;
