import authApi from './AxiosConfig';

const addProductSize = async (productSizeData) => {
    try {
        const response = await authApi.post(`/ProductSize`, productSizeData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getProductSizesByProductId = async (productId) => {
    try {
        const response = await authApi.get(`/ProductSize/ByProductId/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
const updateProductSize = async (productSizeId, productSizeData) => {
    try {
        const response = await authApi.put(`/ProductSize/${productSizeId}`, productSizeData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { addProductSize, getProductSizesByProductId,updateProductSize };
