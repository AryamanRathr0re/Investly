import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="background-animation"></div>
      <div className="animated-background-image"></div>
      <nav className="navbar">
        <div className="logo">Investly</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="signup-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <h1>Track Your Investments with Confidence</h1>
          <p>
            A modern, intuitive platform for managing your investment portfolio
          </p>
          <button className="cta-button" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80"
            alt="Investment Dashboard Preview"
            className="floating-image"
          />
        </div>
      </main>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-image">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                alt="Portfolio Analytics"
              />
            </div>
            <h3>Portfolio Overview</h3>
            <p>
              Get a real-time snapshot of your portfolio's performance with
              interactive charts
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-image">
              <img
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80"
                alt="Asset Management"
              />
            </div>
            <h3>Asset Management</h3>
            <p>
              Easily add, track, and manage all your investments in one place
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-image">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                alt="Smart Analytics"
              />
            </div>
            <h3>Smart Analytics</h3>
            <p>Make informed decisions with detailed performance analytics</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>PortoTracker</h4>
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
          <p>&copy; 2024 PortoTracker. All rights reserved. Made by Aryaman Rathore</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
