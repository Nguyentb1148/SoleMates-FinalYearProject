import React from 'react';
import AttributeLayout from '../Layout/AttributeLayout'; // Adjust the path as necessary
import ProductList from '../Product/ProductList'; // Adjust the path as necessary
import './HomePage.css'; // Make sure the path to HomePage.css is correct

const HomePage = () => {
    return (
        <div className="home-container">
            <div className="attribute-container">
                <AttributeLayout />
            </div>
        </div>
    );
};

export default HomePage;
