// src/components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import StarsBackground from './StarsBackground';

export default function Header() {
  const loc = useLocation();

  return (
    <>
      <div className="header">
        <div className="flex items-center justify-between">

          {/* ------- LEFT: LOGO + NAV ------- */}
          <div className="flex items-center gap-10">

            {/* LOGO */}
            <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg,var(--muted), var(--indigo))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: 'var(--text)',
                    fontSize: 18,
                    boxShadow: '0 6px 12px rgba(80,80,129,0.3)'
                  }}
                >
                  TL
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>TLDR</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-text)' }}>Bite-sized News</div>
                </div>
              </div>
            </Link>

            {/* NAV LINKS */}
            <nav className="flex items-center gap-8 text-muted">
              <Link to="/" className={loc.pathname === '/' ? 'active-nav' : ''}>Home</Link>
              <Link to="/trending" className={loc.pathname === '/trending' ? 'active-nav' : ''}>Trending</Link>
              <Link to="/submit" className={loc.pathname === '/submit' ? 'active-nav' : ''}>Submit</Link>
            </nav>
          </div>

          {/* ------- RIGHT SIDE: NOTIFS + BUTTONS ------- */}
          <div className="flex items-center gap-8">

            {/* Notifications */}
            <div className="notif-wrap">
              <button className="btn btn-ghost" title="Notifications" style={{ position: 'relative' }}>
                🔔
                <span className="notif-badge">3</span>
              </button>
            </div>

            <Link to="/profile" className="btn">Profile</Link>
            <Link to="/login" className="btn btn-ghost">Login</Link>
          </div>

        </div>
      </div>

      {/* SUBTLE STAR BACKGROUND */}
      <StarsBackground intensity={30} />

      <div className="header-spacer" />
    </>
  );
}
