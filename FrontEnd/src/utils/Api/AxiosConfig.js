// AxiosConfig.js
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
                            console.log('New access token received:', tokenResponse.data.accessToken);
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

export default authApi;
