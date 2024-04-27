import React, { useState, useEffect } from "react";

const CustomDropdown = ({ options, onSelect, productSizes }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");

    useEffect(() => {
        console.log('option size: ', options)
        const firstAvailableSizeIndex = options.findIndex((size, index) => isSizeAvailable(index));
        if (firstAvailableSizeIndex !== -1) {
            setSelectedOption(options[firstAvailableSizeIndex]);
        }
    }, [options, productSizes]);

    // Check if a size is available based on productSizes data
    const isSizeAvailable = (size) => {
        return productSizes && productSizes.some((productSize) => productSize.size === size);
    };

    const handleSelect = (option) => {
        setSelectedOption(option);
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    minWidth: '100px',
                }}
            >
                {selectedOption || "Select"}
            </div>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: 'auto',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: '#fff',
                        zIndex: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxWidth: '300px',
                    }}
                >
                    {options.map((option, index) => {
                        const isAvailable = isSizeAvailable(option);
                        return (
                            <div
                                key={index}
                                onClick={() => isAvailable && handleSelect(option)} // Only call handleSelect if the size is available
                                style={{
                                    padding: '3px',
                                    cursor: isAvailable ? 'pointer' : 'not-allowed', // Change cursor based on availability
                                    width: '20%',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: isAvailable ? '#000' : '#ccc', // Change color based on availability
                                }}
                            >
                                {option}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;