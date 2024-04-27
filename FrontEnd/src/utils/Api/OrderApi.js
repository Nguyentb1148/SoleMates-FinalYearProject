import authApi from './AxiosConfig';
const addOrder = async (orderInfo) => {
    try {
        console.log('order detail before send back to Be: ',orderInfo)
        const response = await authApi.post(`/Order/CreateOrder`, orderInfo);
        console.log('OrderId: ', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding order:', error);
        throw error;
    }
};
const getOrderDetail = async (orderId) => {
    try {
        console.log('order id before send back to Be: ', orderId)
        const response = await authApi.get(`/Order/${orderId}`);
        console.log('Order detail: ', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching order detail:', error);
        throw error;
    }
};
const getAllOrders = async () => {
    try {
        const response = await authApi.get('/Order/AllOrders');
        return response.data;
    } catch (error) {
        console.error('Error getting all orders:', error);
        throw error;
    }
};
const confirmOrder = async (orderId) => {
    try {
        const response = await authApi.post(`/Order/ConfirmOrder/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error confirming order:', error);
        throw error;
    }
};
const cancelOrder = async (orderId) => {
    try {
        const response = await authApi.post(`/Order/CancelOrder/${orderId}`);
        console.log('cancel message: ', response.data)
        return response.data;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};
const deliverOrder = async (orderId) => {
    try {
        const response = await authApi.post(`/Order/DeliverOrder/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error delivering order:', error);
        throw error;
    }
};
const searchOrder = async (data) => {
    try {
        const response = await authApi.post(`/Order/SearchOrder`,data);
        return response.data;
    } catch (error) {
        console.error('Error delivering order:', error);
        throw error;
    }
};

export { addOrder, getAllOrders ,getOrderDetail,confirmOrder,cancelOrder,deliverOrder,searchOrder};