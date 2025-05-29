import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Clients from './components/Clients';
import AccessDenied from './components/AccessDenied';
import Profile from "./components/Profile";
import './App.css';


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
            <Route path="/hocho/teacher/course" element={<div>Course Page (To be implemented)</div>} />
          </Routes>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
      </Router>
  );
}

export default App;