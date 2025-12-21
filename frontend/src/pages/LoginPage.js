import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setGeneralError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGeneralError('');
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = authError || error.response?.data?.message || 'Unable to sign in.';
      setGeneralError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-bg" style={{ backgroundImage: "url('/bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="container auth-container">
        <div className="summary-card auth-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h2 style={{ marginBottom: '20px' }}>Welcome Back</h2>
        <p style={{ marginBottom: '20px', color: '#586069' }}>
          Sign in to vote, comment, and submit summaries.
        </p>

        {generalError && <div className="error">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.password && <span className="form-error">{formErrors.password}</span>}
          </div>

          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <div>
            <Link to="/forgot-password" className="link">Forgot password?</Link>
          </div>
          <div>
            Need an account?{' '}
            <Link to="/signup" className="link">Create one</Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

