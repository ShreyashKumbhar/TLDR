// src/pages/SignupPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StarsBackground from '../components/StarsBackground';
import './SignupPage.css';

export default function SignupPage() {
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ email, username, password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="signup-wrapper">

      {/* Stars BG */}
      <StarsBackground intensity={22} />

      {/* Doodles */}
      <div className="signup-doodle-left"></div>
      <div className="signup-doodle-right"></div>

      <motion.div
        className="glass-signup signup-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="signup-title">Create an Account</h1>

        <form onSubmit={handleSubmit} className="signup-form">

          {/* Username */}
          <div className="form-group">
            <label>Username</label>
            <input
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn signup-btn">Create Account</button>

          {status === "error" && (
            <div className="error-msg">Could not create account 😕</div>
          )}

          <div className="muted-links">
            <a href="/login">Already have an account?</a>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
