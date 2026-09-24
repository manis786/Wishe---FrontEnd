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

  // Contact form state updated for WhatsApp
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }

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

  const handleAddToCart = (product) => {
    const currentSize = selectedSizes[product._id] || '50ml';
    const is100ml = currentSize === '100ml';

    const regularPrice = is100ml ? product.price100ml : product.price50ml;
    const discountPrice = is100ml ? product.discountPrice100ml : product.discountPrice50ml;
    const isCurrentSizeOnSale = discountPrice && String(discountPrice).trim() !== '';

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

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const { name, phone, message } = contactForm;
    const whatsappNumber = '923354935544';
    const text = `Hello, my name is ${name}. Phone: ${phone}. Message: ${message}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper function to render a product card grid
  const renderProductCard = (product) => {
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
        {product.categoryLabel && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(17, 17, 17, 0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', zIndex: 2 }}>
            {product.categoryLabel}
          </div>
        )}

        {isCurrentSizeOnSale && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#fc3737', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            On Sale
          </div>
        )}

        <div
          style={{ width: '100%', height: '210px', backgroundColor: '#f8f8f8', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
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

          <div style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCurrentSizeOnSale ? (
              <>
                <span style={{ color: '#888', fontSize: '0.85rem' }}><del>Rs. {regularPrice}</del></span>
                <span style={{ color: '#d4af37' }}>Rs. {discountPrice}</span>
              </>
            ) : (
              <span>Rs. {regularPrice}</span>
            )}
          </div>

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
  };

  // Filter products based on search query globally
  const searchedProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Categorize products based on category labels / types
  const menProducts = searchedProducts.filter(p => (p.categoryLabel || p.category)?.toLowerCase() === 'men');
  const womenProducts = searchedProducts.filter(p => (p.categoryLabel || p.category)?.toLowerCase() === 'women');
  const wisheOriginalProducts = searchedProducts.filter(p => {
    const cat = (p.categoryLabel || p.category)?.toLowerCase();
    return cat === 'wishe original' || cat === 'original' || cat === 'wishé original';
  });

  return (
    <div className="app" style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        toggleCart={toggleCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        setCartItems={setCart}
      />

      {/* Hero Section */}
      <header id="home" className="hero-section" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://res.cloudinary.com/dwpixlcle/image/upload/v1790277597/wfwoggou8uwimqs0xeqk.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '160px 20px 100px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        boxSizing: 'border-box'
      }}>
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            The Art of Becoming Unforgettable.
          </h2> */}
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f0f0f0', maxWidth: '650px', margin: '0 auto', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
            Creating more than perfumes—we design invisible masterpieces that reflect confidence, character, and timeless elegance.
          </p>
        </div>
      </header>

      {/* Responsive Inline CSS for Grid System and Contact Form Split */}
      <style>
        {`
          .product-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .contact-wrapper {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
          }
          @media (min-width: 768px) {
            .product-grid {
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 25px !important;
            }
            .contact-wrapper {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}
      </style>

      {/* SECTION 1: WISHÉ ORIGINAL COLLECTION */}
      <div className="container" id="wishe-original" style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '0 15px', scrollMarginTop: '100px' }}>
        <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '25px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>WISHÉ ORIGINAL</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Our signature exclusive line crafted for unique identities.</p>
        </div>
        <div className="product-grid">
          {wisheOriginalProducts.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', color: '#777', padding: '20px 0', textAlign: 'center' }}>No products found in Wishé Original collection.</p>
          ) : (
            wisheOriginalProducts.map(product => renderProductCard(product))
          )}
        </div>
      </div>

      {/* SECTION 2: MEN COLLECTION */}
      <div className="container" id="men" style={{ maxWidth: '1200px', margin: '50px auto 20px auto', padding: '0 15px', scrollMarginTop: '100px' }}>
        <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '25px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>MEN COLLECTION</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Bold, charismatic, and long-lasting fragrances for men.</p>
        </div>
        <div className="product-grid">
          {menProducts.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', color: '#777', padding: '20px 0', textAlign: 'center' }}>No products found in Men collection.</p>
          ) : (
            menProducts.map(product => renderProductCard(product))
          )}
        </div>
      </div>

      {/* SECTION 3: WOMEN COLLECTION */}
      <div className="container" id="women" style={{ maxWidth: '1200px', margin: '50px auto 60px auto', padding: '0 15px', scrollMarginTop: '100px' }}>
        <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '25px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>WOMEN COLLECTION</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Graceful, floral, and captivating aromas designed for women.</p>
        </div>
        <div className="product-grid">
          {womenProducts.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', color: '#777', padding: '20px 0', textAlign: 'center' }}>No products found in Women collection.</p>
          ) : (
            womenProducts.map(product => renderProductCard(product))
          )}
        </div>
      </div>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: '#111', color: '#fff', padding: '70px 20px', textAlign: 'center', scrollMarginTop: '100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '20px', letterSpacing: '0.5px' }}>About WISHÉ</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#ccc', marginBottom: '20px' }}>
            Founded on the belief that a scent is the most powerful accessory one can wear, WISHÉ curates exceptional luxury fragrances designed to leave a mark. Our blends merge rare ingredients with modern sophistication, offering a signature presence for every individual milestone.

Whether you are stepping into a boardroom or an evening soirée, WISHÉ translates your persona into an invisible aura of absolute confidence and timeless allure.
          </p>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#d4af37', margin: '0 auto' }}></div>
        </div>
      </section>

      {/* Contact Section Matching Provided Reference Image */}
      <section id="contact" style={{ backgroundColor: '#fff', padding: '70px 20px', scrollMarginTop: '100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '10px', color: '#111' }}>Get in Touch</h2>
          <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '40px' }}>Have a query regarding custom blends or orders? Reach out or send us a message directly.</p>

          <div className="contact-wrapper">
            {/* Left Box: Contact & Info */}
            <div style={{ background: '#fff', border: '1px solid #eaeaea', padding: '40px 30px', borderRadius: '10px', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111', marginBottom: '25px' }}>Contact & Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#444', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <span>Karachi, Pakistan.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem' }}>📞</span>
                  <span>+92 335 4935544</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem' }}>✉️</span>
                  <span>wishefragrance@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Right Box: Form with Send via WhatsApp Button */}
            <form onSubmit={handleWhatsAppSubmit} style={{ background: '#fff', border: '1px solid #eaeaea', padding: '40px 30px', borderRadius: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', color: '#555' }}>YOUR NAME</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', color: '#555' }}>PHONE NUMBER</label>
                <input
                  type="text"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', color: '#555' }}>YOUR MESSAGE</label>
                <textarea
                  rows="4"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', backgroundColor: '#fff', boxSizing: 'border-box' }}
                ></textarea>
              </div>
              <button
                type="submit"
                style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '14px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', letterSpacing: '0.5px', transition: 'background 0.2s ease', textAlign: 'center' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
              >
                SEND VIA WHATSAPP
              </button>
            </form>
          </div>
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