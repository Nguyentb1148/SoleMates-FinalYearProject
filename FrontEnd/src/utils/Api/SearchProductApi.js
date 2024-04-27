import authApi from './AxiosConfig';

const searchProductApi = async (productName) => {
    try {
        const response = await authApi.post(`/Search/product`, productName);
        console.log('Response from searchProductApi:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching for products:', error);
        throw error;
    }
};
const filterProductApi = async (selectedOptions) => {
    try {
        const response = await authApi.post(`/Search/filter`, selectedOptions);
        return response.data;
    } catch (error) {
        console.error('Error searching for products:', error);
        throw error;
    }
};

 export  {searchProductApi,filterProductApi};

