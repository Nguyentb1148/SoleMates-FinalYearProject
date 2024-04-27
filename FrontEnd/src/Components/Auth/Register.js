import React, { useState } from 'react';
import { register } from '../../utils/Api/AuthApi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {jwtDecode} from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Register.css'
const clientId = "862905097670-678pkbir60a8v0jk4v75ua6nsu4j3k40.apps.googleusercontent.com";

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage('The password and confirmation password do not match.');
            return;
        }
        const newUser = {
            email,
            password,
            confirmPassword,
        };
        console.log(newUser);
        try {
            const response = await register(newUser);
            if (response && response.message) {
                console.log(response.message);
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setErrorMessage('Email is already registered.');
            } else {
                setErrorMessage('An error occurred while registering. Please try again.');
            }
        }
    };
    const handleRegisterSuccess = async (response) => {
        console.log('Register successful:', response);
        const decoded = jwtDecode(response.credential);
        console.log('Decoded JWT:', decoded);
        const {email} = decoded;

        const userData = {
            email,
            password: 'Password01@',
            confirmPassword: 'Password01@'
        };
        console.log("user data: ",userData)
        try {
            const responseRegister = await register(userData);
            console.log('responseRegister:', responseRegister.message);
            alert(responseRegister.message);
            navigate('/');
        } catch (error) {
            console.error('Error registering with Google:', error);
            setErrorMessage('An error occurred while registering with Google. Please try again.');
        }
    };
    const handleRegisterFailure = (response) => {
        console.log('Register failed:', response);
    };
    return (
        <div className="center-container">
            <div className="registration-container">
                <h2>Register</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="registration-button">Register</button>

                    <GoogleOAuthProvider clientId={clientId}>
                        <div className="register-container">
                            <h2>Login with Google</h2>
                            <GoogleLogin
                                onSuccess={handleRegisterSuccess}
                                onError={handleRegisterFailure}
                                scope="profile email"
                            />
                        </div>
                    </GoogleOAuthProvider>
                </form>
            </div>
        </div>
    );
};

export default Registration;
