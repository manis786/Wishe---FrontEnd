import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 200 : 0; // Standard shipping fee
  const grandTotal = subtotal + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Aapka cart khali hai!");
      return;
    }

    // Yahan aap backend API call kar sakte hain order save karne ke liye
    // Misal ke taur par: axios.post('http://localhost:5000/api/orders', { formData, cartItems, grandTotal })

    // Order place hone ke baad cart clear kar dein
    localStorage.removeItem('cart');
    setCartItems([]);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        <Navbar cartCount={0} />
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', background: '#fff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#25d366', fontSize: '2rem', marginBottom: '15px' }}>🎉 Order Placed Successfully!</h2>
          <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
            Shukriya {formData.fullName}! Aapka order successfully place ho gaya hai aur jald hi aap tak pohncha diya jaye ga.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px 25px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Navbar cartCount={totalCartCount} />

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#111' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* Shipping Form */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#111' }}>Shipping Details</h3>
            
            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={handleChange}
                  placeholder="Muhammad Anis"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="03XXXXXXXXX"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Delivery Address</label>
                <textarea 
                  name="address" 
                  required 
                  rows="3"
                  value={formData.address} 
                  onChange={handleChange}
                  placeholder="House #, Street, Area..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>City</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleChange}
                  placeholder="Karachi"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </div>

              <button 
                type="submit"
                style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '14px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}
              >
                Place Order (Cash on Delivery)
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#111' }}>Order Summary</h3>
            
            {cartItems.length === 0 ? (
              <p style={{ color: '#777', fontSize: '0.9rem' }}>Aapka cart khali hai.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111', margin: 0 }}>{item.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#777' }}>{item.size} x {item.quantity}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111', marginLeft: 'auto' }}>Rs. {item.price * item.quantity}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                  <span>Shipping Fee</span>
                  <span>Rs. {shippingFee}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '5px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: '#111' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#d4af37' }}>Rs. {grandTotal}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;