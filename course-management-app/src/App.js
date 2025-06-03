import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AddCoursePage from "./components/AddCoursePage";
import CoursesPage from "./components/CoursesPage";
import TeachersPage from "./components/TeachersPage";

function App() {
  return (
    <Router>
        <Routes>
            <Route exact path="/teachers/:teacherId/courses/add" element={<AddCoursePage/>} />
            <Route exact path="/teachers/:teacherId/courses" element={<CoursesPage/>} />
            <Route exact path="/" element={<TeachersPage/>} />
        </Routes>
    </Router>
  );
}

export default App;
