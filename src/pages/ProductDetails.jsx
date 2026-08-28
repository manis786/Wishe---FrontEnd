import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [quantity, setQuantity] = useState(1);
  const [isFetching, setIsFetching] = useState(true);
  const [addedMessage, setAddedMessage] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Cart count state for Navbar

  useEffect(() => {
    // LocalStorage se cart count load karna
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = existingCart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalCount);

    document.documentElement.style.scrollBehavior = 'smooth';
    axios.get(`https://wishebackendserver.vercel.app/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setIsFetching(false);
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        setIsFetching(false);
      });
  }, [id]);

  if (isFetching) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Loading product details...</div>;
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Product not found!</div>;
  }

  const is100ml = selectedSize === '100ml';
  const regularPrice = is100ml ? product.price100ml : product.price50ml;
  const discountPrice = is100ml ? product.discountPrice100ml : product.discountPrice50ml;
  const isOnSale = discountPrice && String(discountPrice).trim() !== '';
  const finalPrice = isOnSale ? Number(discountPrice) : Number(regularPrice);

  // Add to Cart Handler
  const handleAddToCart = () => {
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      image: product.image,
      size: selectedSize,
      price: finalPrice,
      quantity: quantity,
    };

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = existingCart.findIndex(
      item => item.id === cartItem.id && item.size === cartItem.size
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));

    // Cart count update karein taake Navbar ka bubble foran update ho jaye
    const newTotalCount = existingCart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(newTotalCount);

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Navbar ko cartCount prop pass kar di hai */}
      <Navbar cartCount={cartCount} toggleCart={() => {}} />

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '25px', color: '#111' }}
        >
          ← Back to Products
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', background: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>

          {/* Product Image */}
          <div style={{ width: '100%', height: '380px', backgroundColor: '#f4f4f4', borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Product Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {product.categoryLabel && (
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#777', marginBottom: '8px' }}>
                {product.categoryLabel}
              </span>
            )}

            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111', marginBottom: '12px' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#777', marginBottom: '15px' }}>
              <span style={{ color: '#f59e0b' }}>★ ★ ★ ★ ★</span>
              <span><b>{product.rating || 5}</b> ({product.reviewsCount || 0} reviews)</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Select Size:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedSize('50ml')}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', background: selectedSize === '50ml' ? '#111' : '#fff', color: selectedSize === '50ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}
                >
                  50ml
                </button>
                <button
                  onClick={() => setSelectedSize('100ml')}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', background: selectedSize === '100ml' ? '#111' : '#fff', color: selectedSize === '100ml' ? '#fff' : '#111', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}
                >
                  100ml
                </button>
              </div>
            </div>

            {/* Price Area */}
            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isOnSale ? (
                <>
                  <span style={{ color: '#888', fontSize: '1rem' }}><del>Rs. {regularPrice}</del></span>
                  <span style={{ color: '#d4af37' }}>Rs. {discountPrice}</span>
                </>
              ) : (
                <span>Rs. {regularPrice}</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Quantity:</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ padding: '8px 14px', background: '#f4f4f4', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ padding: '0 18px', fontWeight: '600' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ padding: '8px 14px', background: '#f4f4f4', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '14px', width: '100%', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#111'}
            >
              {addedMessage ? '✓ Added to Cart!' : `Add to Cart (Rs. ${finalPrice * quantity})`}
            </button>

            {addedMessage && (
              <p style={{ color: '#25d366', fontSize: '0.85rem', textAlign: 'center', marginTop: '8px', fontWeight: '600' }}>
                Item successfully added to your cart!
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;