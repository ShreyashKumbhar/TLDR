// src/App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import TrendingPage from './pages/TrendingPage';
import ProfilePage from './pages/ProfilePage';
import SubmitPage from './pages/SubmitPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import { AuthProvider } from './context/AuthContext';

/* ==========================================================
   PAGE TRANSITION ANIMATION SET
   ========================================================== */
const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.28, ease: "easeIn" }
  }
};

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="app-root">

        {/* Sticky Blurred Header */}
        <Header />

        {/* Animated Route Outlet */}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>

            {/* HOME */}
            <Route
              path="/"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <HomePage />
                </motion.div>
              }
            />

            {/* TRENDING */}
            <Route
              path="/trending"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <TrendingPage />
                </motion.div>
              }
            />

            {/* SUBMIT */}
            <Route
              path="/submit"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <SubmitPage />
                </motion.div>
              }
            />

            {/* PROFILE */}
            <Route
              path="/profile"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <ProfilePage />
                </motion.div>
              }
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <LoginPage />
                </motion.div>
              }
            />

            {/* SIGNUP */}
            <Route
              path="/signup"
              element={
                <motion.div
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fade-route"
                >
                  <SignupPage />
                </motion.div>
              }
            />

          </Routes>
        </AnimatePresence>

      </div>
    </AuthProvider>
  );
}
