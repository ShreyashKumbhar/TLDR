import React from 'react';
import { useUI } from '../context/UIContext';

function AboutPage() {
  return (
    <div className="page-container sidebar-open">
      <div className="page-header">
        <img src="/logo.png" alt="TLDR" style={{height: '60px', marginBottom: '16px'}} />
        <h1>About TLDR</h1>
        <p className="tagline">Bite-sized news summaries</p>
      </div>
      <div className="page-content">
        <div className="about-section">
          <h2>What is TLDR?</h2>
          <p>
            TLDR is a modern platform designed to help you stay informed without information overload.
            We provide concise, high-quality summaries of articles, news, and content from across the web,
            allowing you to grasp key insights quickly and efficiently.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            In an era of endless scrolling and information abundance, our mission is to empower users
            with the ability to consume knowledge smarter, not harder. We believe that everyone deserves
            access to important information without sacrificing their time.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <p>
            Our platform leverages advanced AI and community curation to create bite-sized summaries
            of complex topics. Users can submit content, vote on quality, and receive personalized
            recommendations based on their interests and reading habits.
          </p>
        </div>

        <div className="about-section">
          <h2>Community Driven</h2>
          <p>
            TLDR thrives on community participation. Every summary, vote, and comment helps improve
            the platform and ensures that the most valuable content rises to the top.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;