// src/pages/LoginPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StarsBackground from '../components/StarsBackground';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="login-wrapper">

      {/* Floating Stars */}
      <StarsBackground intensity={22} />

      {/* Doodle Decorations */}
      <div className="login-doodle-left"></div>
      <div className="login-doodle-right"></div>

      {/* Glass Login Card */}
      <motion.div
        className="login-card glass-login soft-rise"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >

        <h1 className="login-title">Welcome Back</h1>

        <form className="login-form" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            className="btn login-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Sign In
          </motion.button>

          {/* Error */}
          {status === "error" && (
            <motion.div
              className="error-msg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Invalid credentials 😕
            </motion.div>
          )}

          {/* Links */}
          <div className="muted-links">
            <a href="/signup">Create account</a>
            <a href="/forgot">Forgot password?</a>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
