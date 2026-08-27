import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});

  // Backend se products fetch karna
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const addToCart = (product) => {
    const size = selectedSizes[product._id] || '50ml';
    const price = size === '100ml' ? Number(product.price100ml) : Number(product.price50ml);
    const cartKey = `${product._id}-${size}`;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.cartKey === cartKey);
      if (existing) {
        return prevCart.map(item => 
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { cartKey, productId: product._id, name: product.name, size, price, quantity: 1 }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const handleReviewSubmit = async (productId) => {
    const comment = reviewInputs[productId];
    if (!comment) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/products/${productId}/review`, {
        name: "Customer",
        comment
      });
      // Update local products state with new review
      setProducts(prev => prev.map(p => p._id === productId ? res.data : p));
      setReviewInputs(prev => ({ ...prev, [productId]: '' }));
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        cartCount={totalCartCount} 
        toggleCart={toggleCart} 
      />

      <header className="hero-section" style={{ background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), #111', color: '#fff', textAlign: 'center', padding: '80px 20px' }}>
        <div className="hero-content">
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '15px' }}>The Art of Becoming Unforgettable.</h2>
          <p style={{ fontSize: '1rem', maxWidth: '600px', margin: '0 auto', color: '#ddd' }}>creates more than perfumes—it creates invisible masterpieces that reflect confidence, character, and timeless elegance.</p>
        </div>
      </header>

      {/* Product Grid */}
      <div className="container" id="products" style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {filteredProducts.map(product => {
            const currentSize = selectedSizes[product._id] || '50ml';
            const currentPrice = currentSize === '100ml' ? product.price100ml : product.price50ml;

            return (
              <div key={product._id} style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(17, 17, 17, 0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {product.categoryLabel}
                </div>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '280px', objectFit: 'cover', backgroundColor: '#f4f4f4' }} />
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '5px' }}>{product.name}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>
                    <span style={{ color: '#f59e0b' }}>★ ★ ★ ★ ★</span>
                    <span><b>{product.rating}</b> ({product.reviewsCount} reviews)</span>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px', flexGrow: 1 }}>{product.description}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button 
                      onClick={() => handleSizeChange(product._id, '50ml')}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', background: currentSize === '50ml' ? '#111' : '#fff', color: currentSize === '50ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      50ml
                    </button>
                    <button 
                      onClick={() => handleSizeChange(product._id, '100ml')}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', background: currentSize === '100ml' ? '#111' : '#fff', color: currentSize === '100ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      100ml
                    </button>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Rs. {currentPrice}</div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px', width: '100%', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Add to Bag
                  </button>

                  {/* Reviews Section */}
                  <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '5px' }}>Customer Reviews:</div>
                    <div style={{ maxHeight: '80px', overflowY: 'auto', marginBottom: '8px' }}>
                      {product.userReviews && product.userReviews.map((rev, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: '#555', background: '#f9f9f9', padding: '4px 8px', marginTop: '4px', borderRadius: '3px', borderLeft: '2px solid #d4af37' }}>
                          💬 <b>{rev.name}:</b> {rev.comment}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input 
                        type="text" 
                        placeholder="Write a review..." 
                        value={reviewInputs[product._id] || ''}
                        onChange={(e) => setReviewInputs({ ...reviewInputs, [product._id]: e.target.value })}
                        style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: '3px', outline: 'none' }}
                      />
                      <button 
                        onClick={() => handleReviewSubmit(product._id)}
                        style={{ background: '#111', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '0.75rem', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        Post
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Sidebar Drawer */}
      <div style={{ position: 'fixed', top: 0, right: isCartOpen ? 0 : '-400px', width: '380px', height: '100%', background: '#fff', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 2000, transition: 'right 0.4s ease-in-out', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Your Shopping Bag</h3>
          <button onClick={toggleCart} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777' }}>Your bag is empty.</p>
          ) : (
            cart.map(item => (
              <div key={item.cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f2f2f2', paddingBottom: '10px' }}>
                <div>
                  <strong>{item.name} ({item.size})</strong>
                  <div>Rs. {item.price} x {item.quantity}</div>
                </div>
                <button onClick={() => removeFromCart(item.cartKey)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #eee', background: '#f9f9f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginBottom: '15px' }}>
            <span>Total:</span>
            <span>Rs. {totalCartPrice.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => {
              if (cart.length === 0) return alert("Bag is empty!");
              let msg = "Hello WISHÉ, I want to place an order:%0A";
              cart.forEach(i => { msg += `- ${i.name} (${i.size}) x ${i.quantity} = Rs. ${i.price * i.quantity}%0A`; });
              msg += `%0A*Total:* Rs. ${totalCartPrice}`;
              window.open(`https://wa.me/923354935544?text=${msg}`, '_blank');
            }} 
            style={{ backgroundColor: '#25d366', color: '#fff', border: 'none', padding: '12px', width: '100%', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}
          >
            Proceed to WhatsApp Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;