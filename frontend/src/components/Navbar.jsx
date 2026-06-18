import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import {useSelector} from 'react-redux';  // For accessing cart items from Redux store
import '../styles/navbar.css';


const Navbar =()=>{
    const {user, logout} = useContext(AuthContext);
    const cardItems = useSelector((state) => state.cart?.cartItems) || [];
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }
    return(
    <nav className="navbar">
               <div className="navbar-brand">
                <Link to="/">
                <img src="media/logo.png" alt="logo" className="navbar-logo" />
                ShopNest
                </Link>
               </div>
               <ul className="navbar-links">
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/cart">Cart ({cardItems.length})</Link></li>
              {user ? (
                <>
                <li><Link to="/profile">Hi, {user.name}</Link></li>
                {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
                <li><button onClick={handleLogout} className='btn-logout'>Logout</button></li>
                </>
              ):(
                <li><Link to="/login">Login</Link></li>
              )}
                </ul>
    </nav>
    );
}

export default Navbar;