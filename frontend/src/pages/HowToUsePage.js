import React from 'react';

function HowToUsePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>How to Use TLDR</h1>
      </div>
      <div className="page-content">
        <div className="guide-section">
          <h2>Getting Started</h2>
          <div className="step">
            <h3>1. Create an Account</h3>
            <p>Sign up for a free account to unlock personalized features and start contributing to the community.</p>
          </div>
          <div className="step">
            <h3>2. Explore Content</h3>
            <p>Browse through curated summaries on the Home page or use the Search feature to find specific topics.</p>
          </div>
        </div>

        <div className="guide-section">
          <h2>Reading & Interacting</h2>
          <div className="step">
            <h3>3. Read Summaries</h3>
            <p>Click on any summary card to read the full TLDR. Use the voting buttons to indicate your interest.</p>
          </div>
          <div className="step">
            <h3>4. Leave Comments</h3>
            <p>Engage with the community by commenting on summaries and joining discussions.</p>
          </div>
        </div>

        <div className="guide-section">
          <h2>Contributing Content</h2>
          <div className="step">
            <h3>5. Submit Articles</h3>
            <p>Found an interesting article? Submit it using the Submit page and our AI will generate a summary.</p>
          </div>
          <div className="step">
            <h3>6. Provide Feedback</h3>
            <p>Help improve recommendations by rating summaries as "Interested" or "Not Interested".</p>
          </div>
        </div>

        <div className="guide-section">
          <h2>Personalization</h2>
          <div className="step">
            <h3>7. For You Page</h3>
            <p>Visit the For You page to see personalized recommendations based on your reading history and preferences.</p>
          </div>
          <div className="step">
            <h3>8. Trending Content</h3>
            <p>Check out what's popular right now on the Trending page.</p>
          </div>
        </div>

        <div className="guide-section">
          <h2>Tips & Best Practices</h2>
          <ul>
            <li>Be specific when searching for content</li>
            <li>Vote on summaries to improve your recommendations</li>
            <li>Submit high-quality, original articles</li>
            <li>Engage respectfully in comment sections</li>
            <li>Regularly check your For You page for fresh content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HowToUsePage;