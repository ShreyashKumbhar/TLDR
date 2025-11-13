import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1>TLDR</h1>
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/submit">Submit</Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="welcome-text">Hi, {user.username}</span>
              <button className="button button-secondary logout-button" onClick={logout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-secondary">Log In</Link>
              <Link to="/signup" className="button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
