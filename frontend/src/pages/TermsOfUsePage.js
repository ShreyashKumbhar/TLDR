import React from 'react';

function TermsOfUsePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Terms of Use</h1>
      </div>
      <div className="page-content">
        <div className="terms-section">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using TLDR, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please
            do not use this service.
          </p>
        </div>

        <div className="terms-section">
          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily access the materials (information or software)
            on TLDR's website for personal, non-commercial transitory viewing only.
          </p>
        </div>

        <div className="terms-section">
          <h2>User Responsibilities</h2>
          <ul>
            <li>Provide accurate and complete information when creating an account</li>
            <li>Respect other users and engage in constructive discussions</li>
            <li>Not submit copyrighted material without permission</li>
            <li>Not use the service for any illegal or unauthorized purpose</li>
            <li>Not attempt to gain unauthorized access to our systems</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>Content Guidelines</h2>
          <p>
            Users are responsible for the content they submit. We reserve the right to remove
            any content that violates these terms or is deemed inappropriate by our moderation team.
          </p>
        </div>

        <div className="terms-section">
          <h2>Disclaimer</h2>
          <p>
            The information on TLDR is provided on an 'as is' basis. To the fullest extent permitted
            by law, we exclude all representations, warranties, conditions and terms whether express
            or implied, statutory or otherwise.
          </p>
        </div>

        <div className="terms-section">
          <h2>Limitations</h2>
          <p>
            In no event shall TLDR or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising
            out of the use or inability to use the materials on TLDR's website.
          </p>
        </div>

        <div className="terms-section">
          <h2>Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service
            after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUsePage;