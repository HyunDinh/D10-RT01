import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Verify from './pages/Verify';
import VerifyChild from './pages/VerifyChild';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="hocho/verify" element={<Verify />} />
                <Route path="hocho/verify-child" element={<VerifyChild />} />
                <Route path="hocho/login" element={<Auth />} />
                <Route path="hocho/welcome" element={<Welcome />} />
                <Route path="hocho/dashboard" element={<Dashboard />} />
                <Route path="hocho/" element={<Auth />} />
            </Routes>
        </Router>
    );
};

export default App;