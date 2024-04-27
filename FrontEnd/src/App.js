import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './Components/Cart/CartContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Login from './Components/Auth/Login';
import Registration from './Components/Auth/Register';
import Home from './Components/Home/Home';
import Navbar from './Components/Layout/Navbar';
import Profile from './Components/User/Profile';
import Product from './Components/StoreOwner/ProductPage';
import ProductDetail from './Components/ProductDetail/ProductDetail';
import CartPage from './Components/Cart/CartPage';
import CheckoutPage from './Components/Checkout/Checkout';
import PaymentSuccess from './Components/Checkout/PaymentSuccessPage';
import PaymentFailure from './Components/Checkout/PaymentFailurePage';
import {SearchProvider} from "./Components/Layout/SearchContext";
import FavoritePage from "./Components/Favorite/FavoritePage";
import OrderPage from "./Components/StoreOwner/OrderPage";
import OrderDetailPage from "./Components/StoreOwner/OrderDetailPage";
import SearchOrder from "./Components/SearchOrder/SearchOrder";

function App() {

    return (
        <BrowserRouter>
            <SearchProvider>
                <div style={{marginBottom:'90px'}}>
                    <Navbar />
                </div>
            <CartProvider>
                <PayPalScriptProvider options={{ 'client-id': 'AXA4WPpo8c9JinRBBe3a-OAPC0INyxT9eD5iAU5VI2DXX2dolTrIrKG7PdTT6k-2QDG2T2ZwzgIK02IC' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/favorite" element={<FavoritePage/>}/>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/products" element={<Product />} />
                        <Route path="/products/:productId" element={<ProductDetail />} />
                        <Route path="/order/:orderId" element={<OrderDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/paymentSuccess" element={<PaymentSuccess />} />
                        <Route path="/paymentFailure" element={<PaymentFailure />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orderPage" element={<OrderPage/>}/>
                        <Route path="/searchOrder" element={<SearchOrder/>}/>
                    </Routes>
                </PayPalScriptProvider>
            </CartProvider>
            </SearchProvider>

        </BrowserRouter>
    );
}

export default App;
