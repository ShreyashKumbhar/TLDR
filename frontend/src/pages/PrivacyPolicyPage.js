import React from 'react';

function PrivacyPolicyPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Privacy Policy</h1>
      </div>
      <div className="page-content">
        <div className="policy-section">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            submit content, or contact us for support. This includes your email address, username,
            and any content you submit.
          </p>
        </div>

        <div className="policy-section">
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, send you technical notices and support messages, and respond
            to your comments and questions.
          </p>
        </div>

        <div className="policy-section">
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties
            without your consent, except as described in this policy or as required by law.
          </p>
        </div>

        <div className="policy-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>

        <div className="policy-section">
          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can
            manage your account settings or contact us to exercise these rights.
          </p>
        </div>

        <div className="policy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </p>
          <p><em>Last updated: December 19, 2025</em></p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;