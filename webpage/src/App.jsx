import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Verify from './pages/Verify';
import VerifyChild from './pages/VerifyChild';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';

import Auth from './pages2/Auth';
import Home from './pages2/Home.jsx';
import ForgotPassword from './pages2/ForgotPassword';
import ResetPassword from './pages2/ResetPassword';


const App = () => {
    return (
        <Router>
            <Routes>
                // new
                <Route path="hocho/login" element={<Auth />} />
                <Route path="hocho/home" element={<Home />} />
                <Route path="/hocho/forgot-password" element={<ForgotPassword />} />
                <Route path="/hocho/reset-password" element={<ResetPassword />} />

                // old
                <Route path="hocho/verify" element={<Verify />} />
                <Route path="hocho/verify-child" element={<VerifyChild />} />
                <Route path="hocho/welcome" element={<Welcome />} />
                <Route path="hocho/dashboard" element={<Dashboard />} />
                <Route path="hocho/" element={<Auth />} />
            </Routes>
        </Router>
    );
};

export default App;