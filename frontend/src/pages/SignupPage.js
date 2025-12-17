import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

function SignupPage() {
  const navigate = useNavigate();
  const { signup, authError } = useAuth();
  const [formData, setFormData] = useState(initialState);
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
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[A-Za-z0-9_\-.]{3,30}$/.test(formData.username.trim())) {
      errors.username = '3-30 chars; letters, numbers, dashes, underscores, dots only';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(formData.password)) {
      errors.password = 'Use 8-64 chars with upper, lower, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/', { replace: true });
    } catch (error) {
      const message = authError || error.response?.data?.message || 'Unable to create account.';
      setGeneralError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-container" style={{ backgroundImage: 'url("frontend\public\bg.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="summary-card auth-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h2 style={{ marginBottom: '16px' }}>Create your TLDR account</h2>
        <p style={{ marginBottom: '24px', color: '#586069' }}>
          Sign up to share summaries, vote on stories, and join the conversation.
        </p>

        {generalError && <div className="error">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.username && <span className="form-error">{formErrors.username}</span>}
          </div>

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
            <p className="form-hint">Use at least 8 characters with upper, lower, and numbers.</p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.confirmPassword && <span className="form-error">{formErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          <span>
            Already have an account?{' '}
            <Link to="/login" className="link">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;

