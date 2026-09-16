import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
    { id: 'ORD-101', customer: 'Ali Khan', items: 'Nuit de Oud (50ml) x 1', total: '1500', status: 'Pending' },
    { id: 'ORD-102', customer: 'Ahmed Raza', items: '9 to 5 Elite (100ml) x 2', total: '7600', status: 'Processing' },
    { id: 'ORD-103', customer: 'Zainab Bibi', items: 'Royal Amber (50ml) x 1', total: '2100', status: 'Delivered' },
    { id: 'ORD-104', customer: 'Usman Ghani', items: 'Velvet Oud (100ml) x 1', total: '3800', status: 'Delivered' }
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

  // Chart Data Configurations
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Monthly Revenue (PKR)',
        data: [45000, 52000, 48000, 61000, 75000, 88000, 95000, 110000, 125000],
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  const doughnutData = {
    labels: ['WISHÉ Original', 'Men Fragrances', 'Women Fragrances'],
    datasets: [
      {
        data: [
          products.filter(p => p.category === 'wishe-original').length || 5,
          products.filter(p => p.category === 'men').length || 8,
          products.filter(p => p.category === 'women').length || 6,
        ],
        backgroundColor: ['#111111', '#d4af37', '#e8c972'],
        borderWidth: 1,
      },
    ],
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total), 0);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090a0f', fontFamily: 'Inter, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#ffffff', padding: '45px 35px', borderRadius: '16px', width: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ marginBottom: '8px', letterSpacing: '2px', fontWeight: '900', color: '#111' }}>WISHÉ ADMIN</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '25px' }}>Secure Store Management Portal</p>

          <input
            type="text"
            placeholder="Admin Username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 15px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 15px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' }}
          />

          <button type="submit" style={{ width: '100%', background: '#111', color: '#fff', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}>Login Dashboard</button>

          <div style={{ marginTop: '20px' }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: '#666', textDecoration: 'none', fontWeight: '600' }}>← Return to Storefront</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f4f6f9' }}>
      {/* Sidebar */}
      <div style={{ width: '270px', background: '#111', color: '#fff', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.08)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '35px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
          <h2 style={{ fontSize: '1.25rem', letterSpacing: '2px', fontWeight: '900', color: '#fff', margin: 0 }}>WISHÉ <span style={{ color: '#d4af37' }}>ADMIN</span></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '13px 15px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }}>📊 Dashboard & Analytics</button>
          <button onClick={() => setActiveTab('products')} style={{ background: activeTab === 'products' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '13px 15px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }}>📦 Products Catalog</button>
          <button onClick={() => setActiveTab('orders')} style={{ background: activeTab === 'orders' ? '#d4af37' : 'transparent', color: '#fff', border: 'none', padding: '13px 15px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }}>🛒 Customer Orders</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #222', paddingTop: '20px' }}>
          <Link to="/" style={{ display: 'block', background: '#222', color: '#fff', textAlign: 'center', padding: '11px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>← View Storefront</Link>
          <button onClick={handleLogout} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Logout Account</button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flexGrow: '1', padding: '40px', overflowY: 'auto' }}>
        
        {/* Dashboard Tab with Metrics & Charts */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', margin: 0 }}>Dashboard Analytics</h2>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>Welcome back, here is your store performance overview.</p>
              </div>
              <span style={{ background: '#e6f4ea', color: '#137333', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>● System Online</span>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ color: '#777', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Revenue</span>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#111', marginTop: '8px' }}>Rs. {totalRevenue.toLocaleString()}</div>
              </div>
              <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ color: '#777', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Products</span>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#111', marginTop: '8px' }}>{products.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ color: '#777', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Active Orders</span>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#198754', marginTop: '8px' }}>{orders.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ color: '#777', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Conversion Rate</span>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#d4af37', marginTop: '8px' }}>4.8%</div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', color: '#111' }}>Revenue Growth Trend</h3>
                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', color: '#111' }}>Catalog Categories</h3>
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut data={doughnutData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111' }}>Product Catalog ({products.length})</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProductId(null);
                  setFormData({ name: '', category: 'wishe-original', categoryLabel: 'men', description: '', price50ml: '', discountPrice50ml: '', price100ml: '', discountPrice100ml: '', image: null });
                  setIsModalOpen(true);
                }}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                + Add New Fragrance
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map(product => (
                <div key={product._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '16px 20px', border: '1px solid #eaeaea', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px', background: '#f4f4f4', border: '1px solid #eee' }} />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '800', color: '#111' }}>{product.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        <b>50ml:</b> {product.discountPrice50ml ? <span><del>Rs. {product.price50ml}</del> <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Rs. {product.discountPrice50ml}</span></span> : `Rs. ${product.price50ml}`} | 
                        <b> 100ml:</b> {product.discountPrice100ml ? <span><del>Rs. {product.price100ml}</del> <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Rs. {product.discountPrice100ml}</span></span> : `Rs. ${product.price100ml}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEditClick(product)} style={{ background: '#d4af37', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                    <button onClick={() => handleDelete(product._id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '25px', fontSize: '1.8rem', fontWeight: '900', color: '#111' }}>Customer Orders Manager</h2>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea', color: '#444' }}>
                    <th style={{ padding: '16px 20px', fontWeight: '800' }}>Order ID</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800' }}>Customer</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800' }}>Items Ordered</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800' }}>Total Amount</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#111' }}>{order.id}</td>
                      <td style={{ padding: '16px 20px', color: '#333', fontWeight: '600' }}>{order.customer}</td>
                      <td style={{ padding: '16px 20px', color: '#555' }}>{order.items}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#111' }}>Rs. {order.total}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: '700', fontSize: '0.85rem', outline: 'none', background: '#fafafa' }}>
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

        {/* Modal for Product Add/Edit */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '35px', borderRadius: '16px', width: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111' }}>{isEditing ? 'Edit Fragrance Details' : 'Add New Fragrance'}</h3>
                <button onClick={() => { setIsModalOpen(false); setIsEditing(false); }} style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#666' }}>&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff' }}>
                      <option value="wishe-original">WISHÉ Original</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Category Label Tag (e.g. men, women, unisex)</label>
                  <input type="text" name="categoryLabel" value={formData.categoryLabel} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Regular Price (50ml)</label>
                    <input type="text" name="price50ml" value={formData.price50ml} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Discount Price (50ml - Optional)</label>
                    <input type="text" name="discountPrice50ml" value={formData.discountPrice50ml} onChange={handleChange} placeholder="e.g. 1200" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Regular Price (100ml)</label>
                    <input type="text" name="price100ml" value={formData.price100ml} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Discount Price (100ml - Optional)</label>
                    <input type="text" name="discountPrice100ml" value={formData.discountPrice100ml} onChange={handleChange} placeholder="e.g. 2200" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px', color: '#333' }}>Product Image</label>
                  <input type="file" name="image" onChange={handleChange} required={!isEditing} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); }} style={{ background: '#e0e0e0', color: '#333', border: 'none', padding: '11px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>Cancel</button>
                  <button type="submit" style={{ background: '#111', color: '#fff', border: 'none', padding: '11px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>{isEditing ? 'Update Product' : 'Save Product'}</button>
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