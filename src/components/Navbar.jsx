import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ searchQuery, setSearchQuery, cartCount, toggleCart }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar-container">
      {/* Brand Logo */}
      <div onClick={() => handleNavClick('home')} className="navbar-logo">
        WISHÉ
      </div>

      {/* Search Bar */}
      <div className="navbar-search-wrapper">
        <span className="navbar-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search fragrance..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="navbar-search-input"
        />
      </div>

      {/* Navigation Links Linked to Sections */}
      <div className="navbar-links">
        <button onClick={() => handleNavClick('home')} className="nav-link">
          HOME
        </button>
        <button onClick={() => handleNavClick('wishe-original')} className="nav-link">
          FRAGRANCE
        </button>
        <button onClick={() => handleNavClick('wishe-original')} className="nav-link">
          WISHÉ ORIGINAL
        </button>
        <button onClick={() => handleNavClick('men')} className="nav-link">
          MEN
        </button>
        <button onClick={() => handleNavClick('women')} className="nav-link">
          WOMEN
        </button>
        <button onClick={() => handleNavClick('about')} className="nav-link">
          ABOUT
        </button>
        <button onClick={() => handleNavClick('contact')} className="nav-link">
          CONTACT
        </button>
      </div>

      {/* Cart Icon with Counter */}
      <div onClick={toggleCart} className="navbar-cart-wrapper">
        <div className="navbar-cart-icon">🛒</div>
        <span className="navbar-cart-badge">{cartCount}</span>
      </div>
    </nav>
  );
};

export default Navbar;