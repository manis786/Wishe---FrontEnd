import React from 'react';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './Navbar.css';

const Navbar = ({ searchQuery, setSearchQuery, cartCount, toggleCart }) => {
    console.log("Navbar ko milne wala cartCount:", cartCount);
    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">WISHÉ</Link>
                
                {/* Search Bar */}
                {setSearchQuery && (
                    <div className="nav-search-box">
                        <input 
                            type="text" 
                            placeholder="Search fragrances..." 
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <i className="fas fa-search">🔍</i>
                    </div>
                )}

                <ul className="nav-menu">
                    <li><Link to="/" className="nav-link active">Home</Link></li>
                    <li><a href="/#products" className="nav-link">Fragrance</a></li>
                    <li><a href="/#about" className="nav-link">About</a></li>
                    <li><a href="/#contact" className="nav-link">Contact</a></li>
                </ul>

                {/* Direct Custom Cart with Bubble */}
                <div className="nav-cart" onClick={toggleCart} title="Open Cart" style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', background: '#f4f4f4', padding: '8px 12px', borderRadius: '50px' }}>
                    <ShoppingCartIcon sx={{ fontSize: '26px', color: '#111' }} />
                    
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            backgroundColor: '#ff4d4f',
                            color: '#fff',
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '50%',
                            fontWeight: '700',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;