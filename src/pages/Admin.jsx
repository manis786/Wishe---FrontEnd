import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_auth') === 'true'
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const [orders, setOrders] = useState([
    { id: 'ORD-101', customer: 'Ali Khan', items: 'Nuit de Oud (50ml) x 1', total: '1,500', status: 'Pending' },
    { id: 'ORD-102', customer: 'Ahmed Raza', items: '9 to 5 Elite (100ml) x 2', total: '7,600', status: 'Processing' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'wishe-original',
    categoryLabel: 'men',
    description: '',
    price50ml: '',
    discountPrice50ml: '',
    price100ml: '',
    discountPrice100ml: '',
    image: null
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://wishebackendserver.vercel.app/api/admin/login', {
        username: usernameInput,
        password: passwordInput
      });

      if (response.data.success) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || 'Invalid Username & Password!');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://wishebackendserver.vercel.app/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      categoryLabel: product.categoryLabel,
      description: product.description,
      price50ml: product.price50ml || '',
      discountPrice50ml: product.discountPrice50ml || '',
      price100ml: product.price100ml || '',
      discountPrice100ml: product.discountPrice100ml || '',
      image: null
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('categoryLabel', formData.categoryLabel);
    data.append('description', formData.description);
    data.append('price50ml', formData.price50ml);
    data.append('discountPrice50ml', formData.discountPrice50ml);
    data.append('price100ml', formData.price100ml);
    data.append('discountPrice100ml', formData.discountPrice100ml);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (isEditing) {
        await axios.put(`https://wishebackendserver.vercel.app/api/products/${currentProductId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Product updated successfully!');
      } else {
        await axios.post('https://wishebackendserver.vercel.app/api/products', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Product added successfully!');
      }

      setFormData({ name: '', category: 'wishe-original', categoryLabel: 'men', description: '', price50ml: '', discountPrice50ml: '', price100ml: '', discountPrice100ml: '', image: null });
      setIsEditing(false);
      setCurrentProductId(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`https://wishebackendserver.vercel.app/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord)
    );
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#111', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '8px', width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '20px', letterSpacing: '1px' }}>WISHÉ ADMIN</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>Enter credentials to access dashboard</p>

          <input
            type="text"
            placeholder="Username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
          />

          <button type="submit" style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Login</button>

          <div style={{ marginTop: '15px' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none' }}>← Back to Store</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f8' }}>
      <div style={{ width: '260px', background: '#111', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.2rem', letterSpacing: '2px', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>WISHÉ ADMIN</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '12px 15px', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>📊 Dashboard Overview</button>
          <button onClick={() => setActiveTab('products')} style={{ background: activeTab === 'products' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '12px 15px', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>📦 Manage Products</button>
          <button onClick={() => setActiveTab('orders')} style={{ background: activeTab === 'orders' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '12px 15px', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>🛒 Manage Orders</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={{ display: 'block', background: '#333', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>← Storefront</Link>
          <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h4 style={{ color: '#777', fontSize: '0.85rem', marginBottom: '8px' }}>Total Products</h4>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111' }}>{products.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h4 style={{ color: '#777', fontSize: '0.85rem', marginBottom: '8px' }}>Active Orders</h4>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#25d366' }}>{orders.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h4 style={{ color: '#777', fontSize: '0.85rem', marginBottom: '8px' }}>Store Status</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>Live 🟢</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Manage Products ({products.length})</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProductId(null);
                  setFormData({ name: '', category: 'wishe-original', categoryLabel: 'men', description: '', price50ml: '', discountPrice50ml: '', price100ml: '', discountPrice100ml: '', image: null });
                  setIsModalOpen(true);
                }}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Add New Product
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map(product => (
                <div key={product._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '15px', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', background: '#f9f9f9' }} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{product.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        50ml: {product.discountPrice50ml ? <span><del>Rs. {product.price50ml}</del> Rs. {product.discountPrice50ml}</span> : `Rs. ${product.price50ml}`} | 
                        100ml: {product.discountPrice100ml ? <span><del>Rs. {product.price100ml}</del> Rs. {product.discountPrice100ml}</span> : `Rs. ${product.price100ml}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(product)} style={{ background: '#d4af37', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                    <button onClick={() => handleDelete(product._id)} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Manage Customer Orders</h2>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '12px 15px' }}>Order ID</th>
                    <th style={{ padding: '12px 15px' }}>Customer</th>
                    <th style={{ padding: '12px 15px' }}>Items</th>
                    <th style={{ padding: '12px 15px' }}>Total</th>
                    <th style={{ padding: '12px 15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{order.id}</td>
                      <td style={{ padding: '12px 15px' }}>{order.customer}</td>
                      <td style={{ padding: '12px 15px' }}>{order.items}</td>
                      <td style={{ padding: '12px 15px' }}>Rs. {order.total}</td>
                      <td style={{ padding: '12px 15px' }}>
                        <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}>
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3>{isEditing ? 'Edit Fragrance' : 'Add New Fragrance'}</h3>
                <button onClick={() => { setIsModalOpen(false); setIsEditing(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                      <option value="wishe-original">WISHÉ Original</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Category Label</label>
                    <input type="text" name="categoryLabel" value={formData.categoryLabel} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Regular Price (50ml)</label>
                    <input type="text" name="price50ml" value={formData.price50ml} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Discount Price (50ml - Optional)</label>
                    <input type="text" name="discountPrice50ml" value={formData.discountPrice50ml} onChange={handleChange} placeholder="Khali chhor dein agar discount nahi hai" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Regular Price (100ml)</label>
                    <input type="text" name="price100ml" value={formData.price100ml} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Discount Price (100ml - Optional)</label>
                    <input type="text" name="discountPrice100ml" value={formData.discountPrice100ml} onChange={handleChange} placeholder="Khali chhor dein agar discount nahi hai" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Product Image</label>
                  <input type="file" name="image" onChange={handleChange} required={!isEditing} style={{ width: '100%', padding: '5px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); }} style={{ background: '#ccc', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                  <button type="submit" style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isEditing ? 'Update Product' : 'Save Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;