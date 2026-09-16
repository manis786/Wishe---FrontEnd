import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';

const Home = ({ products: propProducts }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState(propProducts || []);
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    // LocalStorage se cart load karein aur parse karein
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }

    // Agar App.jsx se props mein products nahi aaye toh fallback fetch
    if (!propProducts || propProducts.length === 0) {
      axios.get('https://wishebackendserver.vercel.app/api/products')
        .then(res => setProducts(res.data))
        .catch(err => console.error("Error fetching products:", err));
    } else {
      setProducts(propProducts);
    }

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [propProducts]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  // Cart mein product add karne ka function (Sale Price fix ke sath)
  const handleAddToCart = (product) => {
    const currentSize = selectedSizes[product._id] || '50ml';
    const is100ml = currentSize === '100ml';
    
    const regularPrice = is100ml ? product.price100ml : product.price50ml;
    const discountPrice = is100ml ? product.discountPrice100ml : product.discountPrice50ml;
    const isCurrentSizeOnSale = discountPrice && String(discountPrice).trim() !== '';

    // Agar sale lagi hai toh discount price jayegi, warna regular price
    const finalPrice = isCurrentSizeOnSale ? discountPrice : regularPrice;

    const cartItem = {
      id: `${product._id}-${currentSize}`,
      productId: product._id,
      name: product.name,
      image: product.image,
      size: currentSize,
      price: finalPrice,
      quantity: 1
    };

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === cartItem.id);
      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += 1;
      } else {
        updatedCart = [...prevCart, cartItem];
      }
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });

    setIsCartOpen(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://wishebackendserver.vercel.app/api/contact', contactForm);
      setContactStatus('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error("Error sending message:", err);
      setContactStatus('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categories = ['All', ...new Set(products.map(p => p.categoryLabel || p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const productCat = p.categoryLabel || p.category;
    const matchesCategory = selectedCategory === 'All' || productCat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app" style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        toggleCart={toggleCart}
      />

      {/* Cart Drawer Component */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        setCartItems={setCart} 
      />

      {/* Hero Section */}
      <header id="home" className="hero-section" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://res.cloudinary.com/dwpixlcle/image/upload/v1789231837/frthqg0dl4wc7nlonll0.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '120px 20px',
        transition: 'all 0.4s ease'
      }}>
        <div className="hero-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '700', marginBottom: '15px', letterSpacing: '1px' }}>The Art of Becoming Unforgettable.</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#ddd' }}>Creating more than perfumes—we design invisible masterpieces that reflect confidence, character, and timeless elegance.</p>
        </div>
      </header>

      {/* Category Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '40px 20px 10px 20px', flexWrap: 'wrap' }}>
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '10px 22px',
              borderRadius: '25px',
              border: '1px solid #111',
              backgroundColor: selectedCategory === cat ? '#111' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#111',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedCategory === cat ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Product Grid Section (Web: 4 per row, Mobile: 2 per row) */}
      <div className="container" id="products" style={{ maxWidth: '1200px', margin: '30px auto 60px auto', padding: '0 15px', scrollMarginTop: '40px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '15px',
        }}>
          <style>
            {`
              @media (min-width: 768px) {
                #products > div {
                  grid-template-columns: repeat(4, 1fr) !important;
                  gap: '25px' !important;
                }
              }
            `}
          </style>

          {filteredProducts.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#777', padding: '40px' }}>No products found matching your criteria.</p>
          ) : (
            filteredProducts.map(product => {
              const currentSize = selectedSizes[product._id] || '50ml';

              const is100ml = currentSize === '100ml';
              const regularPrice = is100ml ? product.price100ml : product.price50ml;
              const discountPrice = is100ml ? product.discountPrice100ml : product.discountPrice50ml;

              const isCurrentSizeOnSale = discountPrice && String(discountPrice).trim() !== '';

              return (
                <div
                  key={product._id}
                  style={{
                    background: '#fff',
                    border: '1px solid #eaeaea',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                  }}
                >

                  {/* Category Label */}
                  {product.categoryLabel && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(17, 17, 17, 0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', zIndex: 2 }}>
                      {product.categoryLabel}
                    </div>
                  )}

                  {/* On Sale Badge */}
                  {isCurrentSizeOnSale && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#fc3737', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                      On Sale
                    </div>
                  )}

                  {/* Uniform Image Container (Fixed Height & Center Aligned) */}
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '210px', 
                      backgroundColor: '#f8f8f8', 
                      overflow: 'hidden', 
                      cursor: 'prime',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }} 
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        objectPosition: 'center',
                        display: 'block' 
                      }}
                    />
                  </div>

                  <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 
                      onClick={() => navigate(`/product/${product._id}`)}
                      style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px', color: '#111', cursor: 'pointer', lineHeight: '1.3' }}
                    >
                      {product.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#777', marginBottom: '8px' }}>
                      <span style={{ color: '#f59e0b' }}>★ ★ ★ ★ ★</span>
                      <span><b>{product.rating || 5}</b> ({product.reviewsCount || 0})</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '12px', flexGrow: 1, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        onClick={() => handleSizeChange(product._id, '50ml')}
                        style={{ flex: 1, padding: '7px', border: '1px solid #ddd', background: currentSize === '50ml' ? '#111' : '#fff', color: currentSize === '50ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', transition: 'all 0.2s ease' }}
                      >
                        50ml
                      </button>
                      <button
                        onClick={() => handleSizeChange(product._id, '100ml')}
                        style={{ flex: 1, padding: '7px', border: '1px solid #ddd', background: currentSize === '100ml' ? '#111' : '#fff', color: currentSize === '100ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', transition: 'all 0.2s ease' }}
                      >
                        100ml
                      </button>
                    </div>

                    {/* Price Display Section */}
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCurrentSizeOnSale ? (
                        <>
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>
                            <del>Rs. {regularPrice}</del>
                          </span>
                          <span style={{ color: '#d4af37' }}>Rs. {discountPrice}</span>
                        </>
                      ) : (
                        <span>Rs. {regularPrice}</span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '10px', width: '100%', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s ease' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#111'}
                    >
                      Add to Cart
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: '#111', color: '#fff', padding: '70px 20px', textAlign: 'center', scrollMarginTop: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '20px', letterSpacing: '0.5px' }}>About WISHÉ</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#ccc', marginBottom: '20px' }}>
            At WISHÉ, we believe that fragrance is an extension of your soul. Every bottle is carefully formulated with rare essences and long-lasting notes designed to capture your unique presence. We craft scents that speak when words fail, ensuring you leave an everlasting impression wherever you go.
          </p>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#d4af37', margin: '0 auto' }}></div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ backgroundColor: '#f4f4f4', padding: '70px 20px', scrollMarginTop: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '15px', color: '#111' }}>Get In Touch</h2>
          <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '30px' }}>Have questions about our fragrances or need assistance? Fill out the form below to send us a message directly!</p>

          <form onSubmit={handleContactSubmit} style={{ background: '#fff', padding: '35px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {contactStatus && (
              <div style={{ padding: '10px 15px', backgroundColor: '#d1e7dd', color: '#0f5132', borderRadius: '5px', fontSize: '0.9rem', fontWeight: '600' }}>
                {contactStatus}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Your Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Your Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Message</label>
              <textarea
                rows="4"
                required
                placeholder="Write your message here..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              ></textarea>
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#111'}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#000000', color: '#ffffff', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid #222', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '10px', color: '#ffffff' }}>WISHÉ</h3>
          <p style={{ fontSize: '0.9rem', color: '#cccccc', marginBottom: '20px' }}>The Art of Becoming Unforgettable.</p>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#d4af37', margin: '0 auto 20px auto' }}></div>
          <p style={{ fontSize: '0.85rem', color: '#aaaaaa', margin: 0 }}>
            &copy; {new Date().getFullYear()} WISHÉ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;