import React, {useState, useEffect, useRef, useContext} from 'react';
import { Link } from 'react-router-dom';
import {searchProductApi} from "../../utils/Api/SearchProductApi";
import {SearchContext} from "./SearchContext";
import SearchOrder from "../SearchOrder/SearchOrder";

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]); // State to hold search results
    const { updateSearchResults } = useContext(SearchContext);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (role && user) {
            setIsAuthenticated(true);
            setUserRole(role);
            setUser(user.UserName);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const onLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/';
    };

    const toggleDropdown = () => {
        setShowDropdown((prevShowDropdown) => !prevShowDropdown);
    };

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        try {
            console.log('search input: ', query)
            const searchData = await searchProductApi(query);
            console.log('Search results:', searchData);
            updateSearchResults(searchData);
        } catch (error) {
            console.error('Error searching for products:', error);
        }
    };

    return (
            <nav  style={styles.navbar}>
                <div className="navbar-container" style={styles.container}>
                    <div className="navbar-brand">
                        <Link to="/" style={styles.link}>Sole mates</Link>
                    </div>
                    <ul className="navbar-menu" style={styles.menu}>
                        <li><Link to="/" style={styles.link}>Product</Link></li>
                        <li><Link to="/favorite" style={styles.link}>Favorite</Link></li>
                        <li><Link to="/searchOrder" style={styles.link}>Search Order</Link></li>
                        <li>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={styles.searchInput}
                            />
                        </li>

                        {!isAuthenticated ? (
                            <>
                                <li><Link to="/cart" style={styles.link}>cart</Link> </li>
                                <li><Link to="/register" style={styles.link}>Register</Link></li>
                                <li><Link to="/login" style={styles.link}>Login</Link></li>
                            </>
                        ) : (
                            <>
                                {userRole==='User'&&(
                                    <li><Link to="/cart" style={styles.link}>cart</Link> </li>
                                )}
                                {userRole === 'StoreOwner' && (
                                    <>
                                        <li><Link to="/products" style={styles.link}>product</Link></li>
                                        <li><Link to="/orderPage" style={styles.link}>orderPage</Link></li>
                                    </>
                                )}
                                <li ref={dropdownRef} onClick={toggleDropdown} className="dropdown" style={styles.dropdown}>
                                    <span className="username" style={styles.username}>{user}</span>
                                    {showDropdown && (
                                        <div className="dropdown-content" style={styles.dropdownContent}>
                                            <Link to="/profile" style={styles.link}>Profile</Link>
                                            <span onClick={onLogout} style={styles.logoutButton}>Logout</span>
                                        </div>
                                    )}
                                </li>

                                {/*{userRole === 'Admin' && (*/}
                                {/*    <li><Link to="/admin" style={styles.link}>Admin</Link></li>*/}
                                {/*)}*/}
                            </>
                        )}
                    </ul>
                </div>
            </nav>

    );
};

const styles = {
    navbar: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menu: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        margin: '0 10px',
        textAlign:'center',
        marginBottom:'1px'
    },
    username: {
        marginRight: '20px',

    },
    dropdown: {
        position: 'relative',
        cursor: 'pointer',
        flexShrink:'0'
    },
    dropdownContent: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#333',
        minWidth: '120px',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
        zIndex: 1
    },
    logoutButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        marginLeft:'33px',
        padding: 0,
    },
    searchInput: {
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
};

export default Navbar;
