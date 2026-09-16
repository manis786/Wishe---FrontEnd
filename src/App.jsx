import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';

function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch tab tak loader rakhega jab tak data pora na aa jaye
    fetch('https://wishebackendserver.vercel.app/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data); // Products pehle save honge
        setLoading(false);  // Phir loader khatam hoga taake aik sath page khule
      })
      .catch((err) => {
        console.error('Backend connection error:', err);
        setLoading(false); // Error ki surat mein bhi app stuck na ho
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'sans-serif'
      }}>
        {/* Bada Gola / Spinner */}
        <div style={{
          width: '90px',
          height: '90px',
          border: '8px solid #e0e0e0',
          borderTop: '8px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />

        {/* WISHÉ Brand Name */}
        <h1 style={{
          marginTop: '25px',
          marginBottom: '5px',
          fontSize: '32px',
          fontWeight: '900',
          letterSpacing: '2px',
          color: '#111',
          fontFamily: 'Arial, sans-serif'
        }}>
          WISHÉ
        </h1>

        <p style={{ margin: '0', color: '#666', fontSize: '15px', fontWeight: '500' }}>
          Loading products from server...
        </p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home products={products} />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;