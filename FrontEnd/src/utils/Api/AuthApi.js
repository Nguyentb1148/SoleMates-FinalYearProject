import axios from 'axios';

const baseLink = 'https://localhost:7082';

const authApi = axios.create({
    baseURL: baseLink,
    headers: {
        'Content-Type': 'application/json'
    }
});

let refreshingTokenPromise = null;
authApi.interceptors.response.use(
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
                            authApi.defaults.headers['Authorization'] = `Bearer ${tokenResponse.data.accessToken}`;
                            originalRequest.headers['Authorization'] = `Bearer ${tokenResponse.data.accessToken}`;
                            return authApi(originalRequest);
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

const login = async (credentials) => {
    try {
        const response = await authApi.post('/Account/login', credentials);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user',response.data.user)
        localStorage.setItem('role',response.data.role)
        console.log('User logged in successfully.');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
const loginViaGg = async (email) => {
    try {
        const response = await authApi.post(`/Account/LoginViaGoogle?email=${email}`);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user',response.data.user)
        localStorage.setItem('role',response.data.role)
        console.log('User logged in successfully.');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const register = async (userData) => {
    try {
        console.log("Register data", userData);
        const response = await authApi.post('/Account/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};



export{login, register,loginViaGg };
