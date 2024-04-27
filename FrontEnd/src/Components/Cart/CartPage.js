import React from 'react';
import { useCart } from './CartContext';
import {Link, useNavigate} from 'react-router-dom';

const CartPage = () => {
    const { cartItems, removeFromCart } = useCart();
    let totalPrice = 0;
    const navigate = useNavigate();

    const handleDeleteItem = (index) => {
        removeFromCart(index);
    };
    const handleCheckout = () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData || !userData.Id) {
            alert('You need to login to check out')
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            {/* Left section */}
            <div style={{  width: '60%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Your Cart</h2>
                {cartItems.map((item, index) => {
                    const itemTotalPrice = item.product.price * item.quantity;
                    totalPrice += itemTotalPrice;
                    const formattedPrice = item.product.price.toLocaleString();
                    const formattedItemTotalPrice = itemTotalPrice.toLocaleString();

                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '5px', border: '1px solid #ccc',borderRadius:'7px', borderBottom: '1px solid #ccc' }}>
                            <div style={{ marginRight: '20px' }}>
                                <img src={item.product.imageUrls[0]} alt={item.product.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                            </div>
                            <div>
                                <Link to={`/products/${item.product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3>{item.product.name}</h3>
                                </Link>
                                <p ><strong>Price:</strong> {formattedPrice} USD</p>
                                <p><strong>Size:</strong> {item.size}</p>
                                <p><strong>Quantity:</strong> {item.quantity}</p>
                                <p><strong>Total Price:</strong> {formattedItemTotalPrice} USD</p>
                                <button onClick={() => handleDeleteItem(index)} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Right section */}
            <div style={{ marginLeft: '20px', width: '20%', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
                <p><strong>Total Price:</strong> {totalPrice.toLocaleString()} USD</p>
                <button onClick={handleCheckout} style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Proceed to Checkout</button>
            </div>
        </div>
    );
};

export default CartPage;
