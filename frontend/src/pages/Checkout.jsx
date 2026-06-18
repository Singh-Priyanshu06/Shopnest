import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cardSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = async () => {
    try {
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        // Razorpay unconfigured exception handler
        const fallback = window.confirm("Razorpay keys unconfigured on backend. Use Student Bypass Mode to place test order?");
        if (fallback) {
          return bypassPayment();
        } else {
          return alert("Payment failed to initialize");
        }
      }

      const options = {
        key: 'rzp_test_T2ENjbEzKIywuD', // Student dummy fallback
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Test Transaction',
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          if (verifyRes.ok) {
            const saveOrderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                items: cartItems.map(item => ({
                  product: item.productId || item.product || item._id,
                  quantity: item.qty || item.quantity || 1,
                  price: item.price
                })),
                totalAmount: totalPrice,
                address,
                paymentId: 'COD_' + Date.now()
              })
            });

            if (saveOrderRes.ok) {
              dispatch(clearCart());
              navigate('/ordersuccess');
            } else {
              alert('Order saving failed');
            }
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
    }
  };

  const bypassPayment = async () => {
    // Map cart items to backend schema
    const mappedItems = cartItems.map(item => ({
      product: item.productId || item.product || item._id,
      quantity: item.qty || item.quantity || 1,
      price: item.price
    }));

    const payload = {
      items: mappedItems,
      totalAmount: totalPrice,
      address,
      paymentId: 'COD_' + Date.now()
    };

    const headersWithAuth = {
      'Content-Type': 'application/json',
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
    };

    try {
      let saveOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: headersWithAuth,
        body: JSON.stringify(payload)
      });

      if (!saveOrderRes.ok) {
        // Retry once without Authorization for guest/local use
        console.warn('Bypass order failed with auth, retrying without auth');
        saveOrderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (saveOrderRes.ok) {
        dispatch(clearCart());
        navigate('/ordersuccess');
        return;
      }

      const text = await saveOrderRes.text().catch(() => 'No response body');
      alert('Failed to place test order: ' + (saveOrderRes.status ? saveOrderRes.status + ' ' : '') + text);
      console.error('Bypass order failed:', saveOrderRes.status, text);
    } catch (err) {
      console.error('Network error during bypassPayment', err);
      alert('Network error placing test order — see console for details.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      const ok = window.confirm('You are not logged in. Place order as guest (Cash on Delivery)?');
      if (!ok) {
        navigate('/login');
        return;
      }
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn">Pay Now</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;