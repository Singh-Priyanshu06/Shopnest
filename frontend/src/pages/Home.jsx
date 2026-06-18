import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load products');
        }

        if (!Array.isArray(data)) {
          throw new Error('Unexpected API response');
        }

        setProducts(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to ShopNest</h1>
        <p>Discover the best products at unbeatable prices.</p>
      </div>
      <h2>Featured Products</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : products.length === 0 ? (
        <div>No products available.</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;