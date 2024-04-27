import React from 'react';
import './ProductItem.css';

const ProductItem = ({ productName, price}) => {

    return (
        <div className="cart-item">
            <div className="product-info">
                <a className="product-name">{productName}</a>
                <p className="product-price">{price} USD</p>
            </div>
        </div>
    );
};

export default ProductItem;
