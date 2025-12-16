import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';
import TrendingPage from './pages/TrendingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ForYouPage from './pages/ForYouPage';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/foryou" element={<ForYouPage />} />
            </Routes>
          </div>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
