import React, { createContext, useState } from 'react';

const SearchContext = createContext();

const SearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);

    const updateSearchResults = (results) => {
        setSearchResults(results);
    };

    return (
        <SearchContext.Provider value={{ searchResults, updateSearchResults }}>
            {children}
        </SearchContext.Provider>
    );
};

export { SearchContext, SearchProvider };
