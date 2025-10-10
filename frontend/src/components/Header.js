import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>TLDR</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/submit">Submit</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
