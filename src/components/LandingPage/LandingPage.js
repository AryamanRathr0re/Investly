import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">PortfolioTrack</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <h1>Track Your Investments with Confidence</h1>
          <p>
            A modern, intuitive platform for managing your investment portfolio
          </p>
          <button className="cta-button">Get Started</button>
        </div>
        <div className="hero-image">
          {/* Placeholder for hero image */}
          <div className="dashboard-preview"></div>
        </div>
      </main>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Portfolio Overview</h3>
            <p>
              Get a real-time snapshot of your portfolio's performance with
              interactive charts
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Asset Management</h3>
            <p>
              Easily add, track, and manage all your investments in one place
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Analytics</h3>
            <p>Make informed decisions with detailed performance analytics</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>PortfolioTrack</h4>
            <p>Your trusted investment companion</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#github">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PortfolioTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
