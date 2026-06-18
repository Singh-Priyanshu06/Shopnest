import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/productCard.css';

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <img className="product-image" src={product.imageUrl} alt={product.name} />
            <div className='product-info'>
                <h3 className='product-name'>{product.name}</h3>
                <p className='product-price'>${product.price}</p>
                <Link to={`/product/${product._id}`} className="btn">View Details</Link>
            </div>
        </div>
    );
};

export default ProductCard;