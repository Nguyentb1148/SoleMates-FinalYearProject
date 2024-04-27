import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../../utils/Api/OrderApi';
import './OrderPage.css';
import {Link} from "react-router-dom"; // Import CSS for styling

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const orderStatusMapping = [
        "Processing",//blue
        "Shipping",//green
        "Delivered",//green
        "Cancelled"//red
    ];
    const getOrderStatusColor = (status) => {
        switch (status) {
            case 0:
                return '#8FE5EA';
            case 1:
            case 2:
                return '#95EA7F';
            case 3:
                return '#F7A181';
            default:
                return 'white';
        }
    };


    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const ordersData = await getAllOrders();
            setOrders(ordersData);
            console.log('order list: ',ordersData)
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };


    return (
        <div className="order-container">
            <h1>All Orders</h1>
            {orders.length === 0 ? (
                <p>No orders available</p>
            ) : (
                <table className="order-table">
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Total Price</th>
                        <th>Date</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(order => (
                        <tr key={order.orderId}>
                            <td>{order.email}</td>
                            <td>${order.totalPrice.toFixed(2)}</td>
                            <td>{new Date(order.dateTime).toLocaleString()}</td>
                            <td>{order.phoneNumber}</td>
                            <td style={{ backgroundColor: getOrderStatusColor(order.status), borderRadius: '15px',margin:'5px', padding: '1px',textAlign: 'center' }}>{orderStatusMapping[order.status]}</td>
                            <td>
                                <Link to={`/order/${order.orderId}`}>
                                    See Detail
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderPage;
