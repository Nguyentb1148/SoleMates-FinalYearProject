import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import { addOrder } from '../../utils/Api/OrderApi';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import './CheckoutPage.css'; // Import CheckoutPage CSS

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const [customerInfo, setCustomerInfo] = useState({
        userId: '',
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    const calculateTotalPrice = () =>
        cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData) {
            setCustomerInfo({
                userId: userData.Id || '',
                name: userData.UserName || '',
                email: userData.Email || '',
                phoneNumber: userData.PhoneNumber || '',
                address: userData.Address || ''
            });
        }
    }, []);

    const handlePlaceOrder = async (orderId) => {
        const totalPrice = calculateTotalPrice();
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        const orderInfo = {
            orderId,
            userId: userData.Id ,
            name: userData.UserName ,
            email: userData.Email,
            phoneNumber: userData.PhoneNumber,
            address: userData.Address ,
            cartItems: cartItems.map(item => ({
                productSizeId: `${item.size}-${item.product.productId}`,
                productId: item.product.productId,
                quantity: item.quantity,
                size: item.size,
                totalPrice:item.product.price * item.quantity
            })),
            totalPrice
        };

        try {
            await addOrder(orderInfo);
            navigate('/paymentSuccess');
        } catch (error) {
            console.error('Error placing order:', error);
            navigate('/paymentFailure');
        }
    };

    return (
        <div className="checkout-container">
            <div className="user-info-section">
                <h2>User Information</h2>
                <form>
                    {['name', 'email', 'phoneNumber', 'address'].map(field => (
                        <div key={field} className="input-field">
                            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                            <input
                                type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
                                value={customerInfo[field]}
                                onChange={handleInputChange}
                                name={field}
                            />
                        </div>
                    ))}
                </form>
                <PayPalScriptProvider options={{ 'client-id': 'AXA4WPpo8c9JinRBBe3a-OAPC0INyxT9eD5iAU5VI2DXX2dolTrIrKG7PdTT6k-2QDG2T2ZwzgIK02IC' }}>
                    <PayPalButtons
                        createOrder={(data, actions) => actions.order.create({
                            purchase_units: [{
                                amount: { value: calculateTotalPrice().toFixed(2) }
                            }]
                        })}
                        onApprove={async (data, actions) => {
                            const order = await actions.order.capture();
                            console.log('paypal detail: ',order)
                            await handlePlaceOrder(order.id);
                        }}
                        onError={err => console.error('PayPal error: ', err)}
                    />
                </PayPalScriptProvider>

            </div>
            <div className="order-summary-section">
                <h2>Order Summary</h2>
                <div className="cart-items">
                    {cartItems.map((item, index) => (
                        <div key={index} className="cart-item">
                            <img src={item.product.imageUrls[0]} alt={item.product.name} className="cart-item-image" />
                            <div className="cart-item-info">
                                <p>{item.product.name}</p>
                                <p>Size: {item.size}</p>
                                <p>Quantity: {item.quantity}</p>
                                <p>Total Price: {(item.product.price * item.quantity).toLocaleString()} USD</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="total-price">Total Order Price: {calculateTotalPrice().toLocaleString()} USD</p>
            </div>
        </div>
    );
};

export default CheckoutPage;
