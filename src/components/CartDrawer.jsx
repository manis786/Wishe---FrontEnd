import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose, cartItems, setCartItems }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Quantity increase/decrease ya item remove karne ke functions
  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', backgroundColor: '#fff', height: '100%',
        padding: '25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111', margin: 0 }}>Your Cart</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 0' }}>
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777', marginTop: '50px' }}>Your cart is empty.</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f4f4f4', paddingBottom: '15px' }}>
                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#777', display: 'block', marginBottom: '6px' }}>Size: {item.size} | Rs. {item.price}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQuantity(index, -1)} style={{ padding: '2px 8px', background: '#eee', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>-</button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, 1)} style={{ padding: '2px 8px', background: '#eee', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary & Buttons */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>
              <span>Subtotal:</span>
              <span style={{ color: '#d4af37' }}>Rs. {subtotal}</span>
            </div>

            {/* 2 Buttons: Continue Shopping & Checkout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Checkout
              </button>
              
              <button 
                onClick={onClose}
                style={{ backgroundColor: '#f4f4f4', color: '#111', border: '1px solid #ddd', padding: '10px', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;