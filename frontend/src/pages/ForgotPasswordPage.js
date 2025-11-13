import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await requestPasswordReset({ email: email.trim() });
      setSuccessMessage('If an account exists for that email, a reset link has been sent.');
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to process your request.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-container">
      <div className="summary-card auth-card">
        <h2 style={{ marginBottom: '16px' }}>Forgot your password?</h2>
        <p style={{ marginBottom: '20px', color: '#586069' }}>
          Enter the email associated with your account and we'll send you reset instructions.
        </p>

        {successMessage && <div className="success">{successMessage}</div>}
        {errorMessage && <div className="error">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="button" disabled={submitting || !email.trim()}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="link">Back to sign in</Link>
        </div>

        <p className="form-hint">
          For demo purposes, reset tokens are logged on the backend server console.
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

