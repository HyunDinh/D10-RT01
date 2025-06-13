import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import Login from './pages/Login.jsx';
import Welcome from './pages/Welcome.jsx';
import Dashboard from './pages/Dashboard.jsx';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="hocho/register" element={<Register />} />
                <Route path="hocho/verify" element={<Verify />} />
                <Route path="hocho/login" element={<Login />} />
                <Route path="hocho/welcome" element={<Welcome />} />
                <Route path="hocho/dashboard" element={<Dashboard />} />
                <Route path="hocho/" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;