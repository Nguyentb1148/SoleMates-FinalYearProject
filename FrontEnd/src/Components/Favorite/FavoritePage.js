import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './FavoritePage.css';
import { getProductSizesByProductId } from '../../utils/Api/ProductSizeApi';
import { useCart } from "../Cart/CartContext";
import favoriteFilled from '../Favorite/favorite-filled.svg';
import cartShopping from '../Favorite/cartShopping.svg';
import product from '../../Img/product.svg'; // Move the import statement to the top

const Size = ['35', '36', '36,5', '37', '38', '38,5', '39', '40', '40,5', '41', '42', '42,5', '43', '44', '44,5', '45', '46'];
const FavoritePage = () => {
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
    const [availableSizes, setAvailableSizes] = useState({});
    const [selections, setSelections] = useState({});

    useEffect(() => {
        const initialSelections = favorites.reduce((acc, product) => {
            return {
                ...acc,
                [product.productId]: {
                    size: null,
                    quantity: 1,
                    totalPrice: product.price
                }
            };
        }, {});
        setSelections(initialSelections);

        const fetchAvailableSizes = async () => {
            for (const product of favorites) {
                const productSizes = await getProductSizesByProductId(product.productId);
                const availableSizeIndices = new Set(productSizes.map(sizeObj => sizeObj.size));
                setAvailableSizes(prevAvailableSizes => ({
                    ...prevAvailableSizes,
                    [product.productId]: availableSizeIndices
                }));
            }
        };
        fetchAvailableSizes();
    }, [favorites]);

    const handleSizeChange = (productId, selectedSize) => {
        setSelections(prevSelections => ({
            ...prevSelections,
            [productId]: { ...prevSelections[productId], size: selectedSize }
        }));
    };

    const handleQuantityChange = (productId, selectedQuantity) => {
        const productPrice = favorites.find(product => product.productId === productId).price;
        const totalPrice = productPrice * selectedQuantity;
        setSelections(prevSelections => ({
            ...prevSelections,
            [productId]: { ...prevSelections[productId], quantity: selectedQuantity, totalPrice }
        }));
    };

    const handleAddToCart = (product) => {
        const { size, quantity } = selections[product.productId];
        console.log('size: ', size);
        if (size === null || size === '') {
            alert('Please select a size.');
            return;
        }
        addToCart(product, size, quantity);
        const updatedFavorites = favorites.filter(favProduct => favProduct.productId !== product.productId);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };
    const toggleFavorite = (product) => {
        const updatedFavorites = favorites.filter(favProduct => favProduct.productId !== product.productId);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    return (
        <div>
            <h1 className="favorites-h1">Favorites</h1>
            {favorites.length === 0 ? (
                <div className="empty-favorites-message">
                    <img src={product} alt="product" style={{ width: '100px', height: '100px',opacity: '0.7' }} />
                    <h2 >You have no favorites.</h2>
                    <Link to="/" className="home-link">Go to Home</Link>
                </div>
            ) : (
                <div className="favorites-container">
                    {favorites.map((product, index) => (
                        <div key={index} className="favorite-item">
                            <Link to={`/products/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img src={product.imageUrls[0]} alt={product.name} className="product-image" />
                            </Link>
                            <div className="product-details">
                                <h3>
                                    <Link to={`/products/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {product.name}
                                    </Link>
                                </h3>
                                <h3 style={{ color: '#F93636' }}>Price: {product.price} USD</h3>
                                <div className="size-quantity">
                                    <div>
                                        <label htmlFor={`size-select-${index}`}>Size: </label>
                                        <select
                                            id={`size-select-${index}`}
                                            value={selections[product.productId]?.size || ''}
                                            onChange={(e) => handleSizeChange(product.productId, e.target.value)}
                                        >
                                            <option value="" disabled>Select Size</option>
                                            {Size.map((size, sizeIndex) => (
                                                <option
                                                    key={sizeIndex}
                                                    value={size}
                                                    disabled={!availableSizes[product.productId]?.has(sizeIndex)}
                                                >
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`quantity-select-${index}`}>Quantity: </label>
                                        <select
                                            id={`quantity-select-${index}`}
                                            value={selections[product.productId]?.quantity || 1}
                                            onChange={(e) => handleQuantityChange(product.productId, Number(e.target.value))}
                                        >
                                            {[...Array(10).keys()].map(num => (
                                                <option key={num} value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p>Total Price: {selections[product.productId]?.totalPrice || product.price} USD</p>
                                <div>
                                    <img src={favoriteFilled} onClick={() => toggleFavorite(product)} alt="Favorite" className="favorite-icon" />
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        // disabled={!selections[product.productId]?.size}
                                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                    >
                                        <img src={cartShopping} alt="Cart" className="favorite-icon" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritePage;