import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: tokenFromUrl,
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setErrorMessage('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.token.trim()) {
      errors.token = 'Reset token is required';
    }
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(formData.newPassword)) {
      errors.newPassword = 'Use 8-64 chars with upper, lower, and number';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await resetPassword({
        token: formData.token.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setSuccessMessage('Password updated successfully. You can now sign in with your new password.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset password.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-container">
      <div className="summary-card auth-card">
        <h2 style={{ marginBottom: '16px' }}>Reset your password</h2>
        <p style={{ marginBottom: '20px', color: '#586069' }}>
          Enter the reset token you received along with your new password.
        </p>

        {successMessage && <div className="success">{successMessage}</div>}
        {errorMessage && <div className="error">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="token">Reset Token</label>
            <input
              id="token"
              name="token"
              type="text"
              className="form-control"
              value={formData.token}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.token && <span className="form-error">{formErrors.token}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="form-control"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            {formErrors.newPassword && <span className="form-error">{formErrors.newPassword}</span>}
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
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="link">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

