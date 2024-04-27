import authApi from './AxiosConfig';

 const confirmOrderItem = async (orderId) => {
    try {
        console.log('order item id before send back to Be: ', orderId)
        const response = await authApi.put(`/OrderItem/${orderId}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching order detail:', error);
        throw error;
    }
};

export  {confirmOrderItem}