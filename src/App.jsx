import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;