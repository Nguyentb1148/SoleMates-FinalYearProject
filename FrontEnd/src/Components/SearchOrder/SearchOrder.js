import React, { useState } from 'react';
import { searchOrder } from "../../utils/Api/OrderApi";
import './SearchOrder.css';

const SearchOrder = () => {
    const [email, setEmail] = useState('');
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState('');
    const [loading, setLoading] = useState(false);
    const [message,setMessage]=useState('');
    const orderStatusMapping = [
        "Processing",//blue
        "Shipping",//green
        "Delivered",//green
        "Cancelled"//red
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading state to true while fetching data
        try {
            const data = { orderId, email };
            const order = await searchOrder(data);
            if (order.error) {
                setMessage(order.message);
                setOrderData('');
            } else {
                setOrderData(order);
                setMessage('');
            }
            console.log('Search result:', order);
        } catch (error) {
            console.error('Error searching for order:', error);
            setMessage('Invaild OrderId');
        } finally {
            setLoading(false); // Reset loading state after fetching data
        }
    };


    return (
        <div className="search-order-container">
            <h2>Search Order</h2>
            <form onSubmit={handleSubmit} className="search-order-form">
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Order ID:</label>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {message && !orderData && <p>{message}</p>}
            {orderData&&(
                <div className="order-details">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> {orderData.orderId}</p>
                    <p><strong>Email:</strong> {orderData.email}</p>
                    <p><strong>Name:</strong> {orderData.name}</p>
                    <p><strong>Phone Number:</strong> {orderData.phoneNumber}</p>
                    <p><strong>Address:</strong> {orderData.address}</p>
                    <p><strong>Status:</strong> {orderStatusMapping[orderData.status]}</p>
                    <p><strong>Total Price:</strong> {orderData.totalPrice} USD</p>
                    <p><strong>Date:</strong> {orderData.dateTime}</p>
                    <h4>Order Items:</h4>
                    <div className="order-items">
                        {orderData.orderItems.map(item => (
                            <div key={item.orderItemId} className="order-item">
                                <img src={item.imageUrl} alt={item.productName} className="product-image" />
                                <div className="product-info">
                                    <p><strong>Product Name:</strong> {item.productName}</p>
                                    <p><strong>Quantity:</strong> {item.quantity}</p>
                                    <p><strong>Size:</strong> {item.size}</p>
                                    <p><strong>Total Price:</strong> {item.totalPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchOrder;
