import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/Header';
import Sidebar from './components/Sidebar';
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
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import { AuthProvider } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';

function AppContent() {
  return (
    <div className="App">
      <TopBar />
      <Sidebar />
      <main className="main-content sidebar-open">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/foryou" element={<ForYouPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
