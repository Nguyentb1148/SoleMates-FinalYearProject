import React, { useState } from 'react';
import { login, loginViaGg } from '../../utils/Api/AuthApi';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Login.css';
import eyeIcon from '../../Img/eye.svg';
import eyeSlashIcon from '../../Img/eyeSlash.svg';
const clientId = "862905097670-678pkbir60a8v0jk4v75ua6nsu4j3k40.apps.googleusercontent.com";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordInputType, setPasswordInputType] = useState('password'); // New state
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const credentials = { email, password, rememberMe };

        try {
            const data = await login(credentials);
            if (data && data.accessToken) {
                setLoggedIn(true);
            } else {
                setErrorMessage('Login was successful but no token was received.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'An error occurred during login.';
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = async (response) => {
        const decoded = jwtDecode(response.credential);
        const { email } = decoded;

        try {
            const responseLogin = await loginViaGg(email);
            if (responseLogin && responseLogin.accessToken) {
                setLoggedIn(true);
            } else {
                setErrorMessage('Failed to log in via Google.');
            }
        } catch (error) {
            setErrorMessage('An error occurred during login via Google.');
        }
    };

    const handleLoginFailure = (response) => {
        console.log('Login failed:', response);
    };

    if (loggedIn) {
        navigate('/');
        window.location.reload();
    }
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        setPasswordInputType(showPassword ? 'password' : 'text'); // Update input type
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <div className="password-field">
                            <input
                                type={passwordInputType}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                <img src={showPassword ? eyeSlashIcon : eyeIcon} alt="Show/Hide Password" />
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="google-login-container">
                    <h2>Login with Google</h2>
                    <GoogleOAuthProvider clientId={clientId}>
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={handleLoginFailure}
                            scope="profile email"
                            disabled={loading}
                        />
                    </GoogleOAuthProvider>
                </div>
            </div>
        </div>
    );
};

export default Login;
