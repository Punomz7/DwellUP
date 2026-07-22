import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminPage from './AdminPage';
import UserPage from './UserPage';
import AgentPage from './AgentPage';
import Home from './Home';
import Appointments from './Appointments';
import PropertyPage from './PropertyPage';

import AccountPage from './AccountPage';

import Users from './Users';
import Conversations from './Conversations';

import Sell from './Sell';


import Footer from './Footer'
import PrivateRoute from './PrivateRoute';
import ClickSpark from './ClickSpark';
import heroImage from './11_3.jpg';  
import heroImage2 from './9.jpg'

const AppContent: React.FC<{
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}> = ({ darkMode, toggleDarkMode, user, setUser }) => {
  const location = useLocation();
  
  const excludedFooterPaths = ['/', '/admin', '/user', '/agent'];
  const shouldShowFooter = !excludedFooterPaths.includes(location.pathname);
  // Define paths that need top padding
  const paddedPaths = [
    '/admin', '/user', '/agent', '/account', '/home', '/buy',
    '/property', '/listing', '/userlist', '/conversations',
    '/reports', '/appointments', '/sell', '/sellreq', '/listing2'
  ];

  // Check if the current path should have padding
  const needsPadding = paddedPaths.some((path) => location.pathname.startsWith(path));

  return (
    
    <div className={needsPadding ? 'pt-[82px] w-full overflow-x-hidden' : ''} >
      <div
  className="fixed inset-0 -z-0 h-full flex items-start justify-center text-center bg-cover bg-center blur-sm"
  style={{ backgroundImage: `url(${darkMode ? heroImage : heroImage2})`, }}
>
  {/* Black transparent overlay */}
  <div className="absolute inset-0 dark:bg-black/15 bg-white/15"></div>

</div>
      

      <Routes>
        <Route
          path="/"
          element={
            <div className="Main_page">
              
              <video autoPlay loop muted className="background-video">
                <source src="/grass.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="absolute inset-0 bg-black/10 z-0"></div>
              <div className="button_frame">
                <img src="/dwell.png" alt="dwell" className="logo-img" />
                <div className="Main_page_buttons mt-2">
                  <Link to="/admin"><button className="btn Admin">Admin Panel</button></Link>
                  <Link to="/user"><button className="btn User">User Panel</button></Link>
                  <Link to="/agent"><button className="btn Agent">Agent Panel</button></Link>
                </div>
              </div>
            </div>
          }
        />

        {/* Main routes */}
        <Route path="/admin" element={<AdminPage setUser={setUser} />} />
        <Route path="/user" element={<UserPage setUser={setUser} />} />
        <Route path="/agent" element={<AgentPage setUser={setUser} />} />

        {/* ✅ Protected routes */}
        <Route
          path="/account"
          element={
            <PrivateRoute user={user}>
              <AccountPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute user={user}>
              <Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />

         <Route
          path="/property/:id"
          element={
            <PrivateRoute user={user}>
              <PropertyPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />
      
        <Route
          path="/appointments"
          element={
            <PrivateRoute user={user}>
              <Appointments darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />
       
        <Route
          path="/userlist"
          element={
            <PrivateRoute user={user}>
              <Users darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <PrivateRoute user={user}>
              <Conversations darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />
      
        <Route
          path="/sell"
          element={
            <PrivateRoute user={user}>
              <Sell darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />
            </PrivateRoute>
          }
        />
      </Routes>
      {shouldShowFooter && <Footer />}

    </div>
  
  );
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="transition-colors duration-300 font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-white min-h-screen">
        <ClickSpark
  sparkColor={darkMode ? '#fff' : '#000'}
  sparkSize={10}
  sparkRadius={15}
  sparkCount={8}
  duration={400}
>
        <Router>
          <AppContent
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            user={user}
            setUser={setUser}
          />
        </Router>

        <div style={{ zoom: 1 / 1 }}>
          <ToastContainer theme="colored" style={{width:'100%'}}/>
        </div>
        </ClickSpark>
      </div>
    </div>
  );
};

export default App;
