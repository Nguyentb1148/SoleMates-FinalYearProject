import React, { useState, useEffect, useContext } from 'react';
import { filterProductApi } from '../../utils/Api/SearchProductApi';
import ProductList from "../Product/ProductList";
import { SearchContext } from "./SearchContext";

const AttributeLayout = () => {
    const [selectedOptions, setSelectedOptions] = useState({
        design: null,
        product: null,
        material: null,
        color: null,
        price: null
    });
    const { updateSearchResults } = useContext(SearchContext);
    const [initialLoad, setInitialLoad] = useState(true);

    const fetchFilteredProducts = async () => {
        try {
            const filteredData = await filterProductApi(selectedOptions);
            updateSearchResults(filteredData || []);
        } catch (error) {
            console.error('Error fetching filtered products:', error);
        }
    };

    // Effect to run only once on mount
    useEffect(() => {
        if (initialLoad) {
            fetchFilteredProducts();
            setInitialLoad(false);  // Ensures it doesn't run again after the initial trigger
        }
    }, [initialLoad]);  // Dependency on initialLoad to ensure it runs only once

    // Button click handler
    const handleFilterClick = () => {
        fetchFilteredProducts();  // Fetch data on button click
    };

    const sections = [
        {
            title: 'Design',
            options: ['Low Top', 'High Top', 'Mule']
        },
        {
            title: 'Product',
            options: ['Basas', 'Vintas', 'Urbas', 'Pattas', 'Socks', 'Shoelaces']
        },
        {
            title: 'Material',
            options: ['Canvas', 'Suede', 'Leather', 'Flannel', 'Corduroy']
        },
        {
            title: 'Color',
            options: [
                { color: '#808080', name: 'Gray' },
                { color: '#ffffff', name: 'White' },
                { color: '#ffffcc', name: 'Cream' },
                { color: '#36454f', name: 'Charcoal' },
                { color: '#008080', name: 'Teal' },
                { color: '#f5f5dc', name: 'Beige' },
                { color: '#c0c0c0', name: 'Silver' },
                { color: '#000080', name: 'NavyBlue' },
                { color: '#808000', name: 'OliveGreen' },
                { color: '#e6e6fa', name: 'Lavender' },
                { color: '#ff7f50', name: 'Coral' },
                { color: '#ed9121', name: 'CarrotOrange' },
                { color: '#dc143c', name: 'CrimsonRed' }
            ]
        },
        {
            title: 'Price',
            options: ['Under 200', '200 - 299', '300 - 399', '400 - 499', '500 - 599', '> 600']
        }
    ];

    const handleOptionSelection = (section, option, index) => {
        setSelectedOptions(prevOptions => {
            const selectedValue = prevOptions[section.toLowerCase()] === index ? null : index;
            return {
                ...prevOptions,
                [section.toLowerCase()]: selectedValue
            };
        });
    };

    return (
        <div style={{ display: 'flex', padding: '10px',overflow: 'hidden', margin: 'auto', maxWidth: '1400px' }}>
            {/* Filter section */}
            <div style={{ display: 'flex', maxWidth: '400px', marginRight: '15px',position: 'fixed', overflowY: 'auto',  }}>
                {/* Left section filter */}
                <div style={{ padding: '2px', maxWidth: '200px' }}>
                    {sections.slice(0, 3).map((section, index) => (
                        <div className="section" key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ marginBottom: '5px', fontSize: '18px' }}>{section.title}</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {section.options.map((option, optionIndex) => {
                                    const isSelected = selectedOptions[section.title.toLowerCase()] === optionIndex;
                                    return (
                                        <li
                                            key={optionIndex}
                                            onClick={() => handleOptionSelection(section.title.toLowerCase(), option, optionIndex)}
                                            className={isSelected ? 'selected' : ''}
                                            style={{
                                                padding: '5px',
                                                marginBottom: '2px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                backgroundColor: isSelected ? '#e0e0e0' : 'inherit',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {option}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                    <button onClick={handleFilterClick}>Filter Products</button>
                </div>
                {/* Right section filter */}
                <div style={{ padding: '2px', maxWidth: '200px' }}>
                    {sections.slice(3).map((section, index) => (
                        <div className="section" key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ marginBottom: '5px', fontSize: '18px' }}>{section.title}</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {section.options.map((option, optionIndex) => {
                                    const isColorSection = section.title === 'Color';
                                    const isSelected = selectedOptions[section.title.toLowerCase()] === optionIndex;
                                    return (
                                        <li
                                            key={optionIndex}
                                            onClick={() => handleOptionSelection(section.title.toLowerCase(), option, optionIndex)}
                                            className={isSelected ? 'selected' : ''}
                                            style={{
                                                padding: '5px',
                                                marginBottom: '2px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                backgroundColor: isSelected ? '#e0e0e0' : 'inherit',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center' // Align items vertically
                                            }}>
                                            {isColorSection && (
                                                <>
                                                    <span style={{ width: '23px', height: '23px', borderRadius: '5px', backgroundColor: option.color, marginRight: '10px', border: '1px solid #ccc' }}></span>
                                                    <span style={{ fontSize: '14px' }}>{option.name}</span>
                                                </>
                                            )}
                                            {!isColorSection && option}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            {/* Product list */}
            <div style={{ flex: '1',marginLeft: '350px', overflowY: 'auto' }}>
                <ProductList />
            </div>
        </div>
    );
};

export default AttributeLayout;
