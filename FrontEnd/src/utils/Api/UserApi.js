import axios from 'axios';

const baseLink = 'https://localhost:7082';

const authApi = axios.create({
    baseURL: baseLink,
    headers: {
        'Content-Type': 'application/json'
    }
});
const userApi = axios.create({
    baseURL: baseLink,
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
let refreshingTokenPromise = null;
userApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            if (!refreshingTokenPromise) {
                originalRequest._retry = true;
                refreshingTokenPromise = authApi.post('/Account/refresh-token', { Token: localStorage.getItem('refreshToken') })
                    .then(tokenResponse => {
                        if (tokenResponse.data && tokenResponse.data.accessToken) {
                            localStorage.setItem('accessToken', tokenResponse.data.accessToken);
                            console.log('New access token received: ', tokenResponse.data.accessToken);
                            userApi.defaults.headers['Authorization'] = `Bearer ${tokenResponse.data.accessToken}`;
                            originalRequest.headers['Authorization'] = `Bearer ${tokenResponse.data.accessToken}`;
                            return userApi(originalRequest);
                        }
                    }).finally(() => {
                        refreshingTokenPromise = null;
                    });
            }
            return refreshingTokenPromise;
        }
        return Promise.reject(error);
    }
);

const getUserData = async (userId) => {
    try {
        console.log("get user data", userId);
        const response = await userApi.get(`/User/getUserData/${userId}`,userId);
        console.log("User data: ",response.data)
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
const updateUserProfile = async (userId, formData) => {
    try {
        const response = await userApi.post(`/User/updateUserProfile/${userId}`, formData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}



export {getUserData,updateUserProfile};