import React, { useState, useEffect } from 'react';
import { confirmOrder, getOrderDetail, cancelOrder, deliverOrder } from '../../utils/Api/OrderApi';
import { useParams } from 'react-router-dom';
import { getProductById } from "../../utils/Api/ProductApi";
import { confirmOrderItem } from '../../utils/Api/OrderItemApi';
import checkOrderItemIcon from '../../Img/checkOrderItem.svg';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [orderDetail, setOrderDetail] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const [confirmedItems, setConfirmedItems] = useState({});
    const [errorMessages, setErrorMessages] = useState({});
    const [allItemsConfirmed, setAllItemsConfirmed] = useState(false);

    const orderStatusMapping = [
        "Processing",
        "Shipping",
        "Delivered",
        "Cancelled"
    ];

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail(orderId);
        }
    }, [orderId]);

    useEffect(() => {
        // Check if all order items are confirmed
        if (orderDetail && orderDetail.orderItems) {
            const allItemsConfirmed = orderDetail.orderItems.every(item => confirmedItems[item.orderItemId]);
            setAllItemsConfirmed(allItemsConfirmed);
        }
    }, [confirmedItems, orderDetail]);

    const fetchOrderDetail = async (orderId) => {
        try {
            const orderDetailData = await getOrderDetail(orderId);
            setOrderDetail(orderDetailData);

            const productDetailPromises = orderDetailData.orderItems.map(item =>
                getProductById(item.productId)
            );
            const products = await Promise.all(productDetailPromises);
            const productDetailsData = products.reduce((acc, product, index) => {
                acc[orderDetailData.orderItems[index].productId] = product;
                return acc;
            }, {});
            setProductDetails(productDetailsData);
        } catch (error) {
            console.error('Error fetching order detail:', error);
        }
    };

    const handleDoneClick = async (orderItemId) => {
        try {
            const response = await confirmOrderItem(orderItemId);
            if (response.message === "confirm order item") {
                setConfirmedItems(prev => ({ ...prev, [orderItemId]: true }));
                setErrorMessages(prev => ({ ...prev, [orderItemId]: null }));
            } else {
                setErrorMessages(prev => ({ ...prev, [orderItemId]: response.message || "Unknown error" }));
            }
        } catch (error) {
            console.error('Error confirming order item:', error);
            setErrorMessages(prev => ({ ...prev, [orderItemId]: error.message || "Error processing request" }));
        }
    };

    const handleConfirmOrder = async () => {
        try {
            const response = await confirmOrder(orderDetail.orderId);
            console.log('Confirm Order response:', response.message);
            alert(`Product is shipping, send email to ${orderDetail.email}`);

        } catch (error) {
            console.error('Error confirming order:', error);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await cancelOrder(orderDetail.orderId);
            console.log('Cancel Order response:', response.message);
            alert(`Order has been cancelled.`);
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    const handleDeliverOrder = async () => {
        try {
            const response = await deliverOrder(orderDetail.orderId);
            console.log('Deliver Order response:', response.message);
            alert(`Order has been marked as delivered.`);
        } catch (error) {
            console.error('Error delivering order:', error);
        }
    };

    if (!orderDetail) {
        return <p>Loading...</p>;
    }

    return (
        <div className="order-detail-container">
            <h1>Order Detail</h1>
            <div className="order-info">
                <p><strong>Email:</strong> {orderDetail.email}</p>
                <p><strong>Total Price:</strong> ${orderDetail.totalPrice.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(orderDetail.dateTime).toLocaleString()}</p>
                <p><strong>Phone Number:</strong> {orderDetail.phoneNumber}</p>
                <p><strong>Status:</strong> {orderStatusMapping[orderDetail.status]}</p>
                <div>
                    {allItemsConfirmed && (
                        <button onClick={handleConfirmOrder}>Confirm Order</button>
                    )}
                    <button onClick={handleCancelOrder}>Cancel Order</button>
                    <button onClick={handleDeliverOrder}>Mark as Delivered</button>
                </div>

            </div>

            <h2>Order Items</h2>
            <div className="order-items">
                {orderDetail.orderItems.map((orderItem, index) => {
                    const product = productDetails[orderItem.productId];
                    if (!product) return null;
                    return (
                        <div key={index} className="order-item">
                            <div className="product-image">
                                <img src={product.imageUrls[0]} alt={product.name} style={{
                                    width: '200px',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }} />
                            </div>
                            <div className="product-info">
                                <p><strong>Product Name:</strong> {product.name}</p>
                                <p><strong>Product size:</strong> {orderItem.size}</p>
                                <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                                <strong>Quantity:</strong> {orderItem.quantity}
                                <button onClick={() => handleDoneClick(orderItem.orderItemId)} disabled={confirmedItems[orderItem.orderItemId]}>
                                    Done
                                </button>
                                {confirmedItems[orderItem.orderItemId] && <img src={checkOrderItemIcon} alt="Confirmed" style={{ width: '30px', height: '30px' }} />}
                                {errorMessages[orderItem.orderItemId] && <p className="error-message">{errorMessages[orderItem.orderItemId]}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderDetailPage;
