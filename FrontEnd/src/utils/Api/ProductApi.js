import authApi from './AxiosConfig';
const addProduct = async (formData) => {
    try {
        const response = await authApi.post(`/Product`, formData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
const getAllProducts = async () => {
    try {
        const response = await authApi.get(`/Product`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
const getProductById = async (id) => {
    try {
        const response = await authApi.get(`/Product/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching product details:', error);
    }
}
const deleteProductById = async (id) => {
    try {
        const response = await authApi.delete(`/Product/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching product details:', error);
    }
}
const GetAllProductNamesAndIds = async () => {
    try {
        const response = await authApi.get(`/Product/ProductList`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
const updateProductById = async (id, formData) => {
    try {
        const response = await authApi.put(`/Product/${id}`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}
export {addProduct,getAllProducts,GetAllProductNamesAndIds,getProductById,deleteProductById,updateProductById};