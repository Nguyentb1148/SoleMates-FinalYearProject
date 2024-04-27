import React, { useContext, useEffect, useState } from 'react';
import { SearchContext } from "../Layout/SearchContext";
import { Link } from "react-router-dom";
import favoriteFilled from '../Favorite/favorite-filled.svg';
import favorite from '../Favorite/favorite.svg';

const ProductList = () => {
    const { searchResults } = useContext(SearchContext);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(storedFavorites);
    }, []);
    const toggleFavorite = (product) => {
        const isFavorite = favorites.some((favProduct) => favProduct.productId === product.productId);
        const updatedFavorites = isFavorite ?
            favorites.filter((favProduct) => favProduct.productId !== product.productId) :
            [...favorites, product];
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    return (
        <div style={{ marginTop: '20px', maxWidth: '950px' }}>
            {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    {searchResults.map((product, index) => (
                        <div key={index} style={{ position: 'relative', width: '300px', marginBottom: '10px',marginRight:'2px', padding: '5px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <Link to={`/products/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img src={product.imageUrls[0]} alt={product.name} style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ paddingTop: '10px' }}>
                                    <p style={{ fontWeight: 'bold' }}>{product.name}</p>
                                    <p style={{ color: '#F15E2C',  fontWeight: 'bold', marginLeft: '20px' }}>{product.price} USD</p>
                                </div>
                            </Link>
                            <button onClick={() => toggleFavorite(product)} style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
                                {favorites.some((favProduct) => favProduct.productId === product.productId) ? (
                                    <img src={favoriteFilled} alt="Favorite" style={{ width: '24px', height: '24px' }} />
                                ) : (
                                    <img src={favorite} alt="Not Favorite" style={{ width: '24px', height: '24px' }} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div>No products found</div>
            )}
        </div>
    );
};

export default ProductList;
