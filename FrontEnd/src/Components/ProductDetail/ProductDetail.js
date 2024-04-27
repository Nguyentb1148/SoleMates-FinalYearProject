import {useNavigate, useParams} from 'react-router-dom';
import { useEffect, useState } from "react";
import { getProductById } from "../../utils/Api/ProductApi";
import nextSvg from "./next.svg";
import backSvg from "./back.svg";
import SizeChart from'../../Img/SizeChart.png'
import {getProductSizesByProductId} from "../../utils/Api/ProductSizeApi";
import {useCart} from "../Cart/CartContext";
import './ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [productSizes, setProductSizes] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [startImageIndex, setStartImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(""); // State for selected size
    const Size = ['35', '36', '36,5', '37', '38', '38,5', '39', '40', '40,5', '41', '42', '42,5', '43', '44', '44,5', '45', '46'];
    const { addToCart } = useCart();
    const [selectedQuantity, setSelectedQuantity] = useState(1); // State for selected quantity
    const navigate=useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await getProductById(productId);
                console.log('product data: ',productData)
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        const fetchProductSizes = async () => {
            try {
                const sizesData = await getProductSizesByProductId(productId);
                console.log('product size: ', sizesData);
                if (Array.isArray(sizesData)) {
                    setProductSizes(sizesData);
                } else {
                    console.error('Product sizes data is not an array:', sizesData);
                }
            } catch (error) {
                console.error('Error fetching product sizes:', error);
            }
        };

        if (productId) {
            fetchProduct();
            fetchProductSizes();
        }
    }, [productId]);

    if (!product) {
        return <div>Loading...</div>;
    }
    const handleImageClick = (index) => {
        setMainImageIndex(index);
        setShowModal(true);
    };

    const handleNextInListClick = () => {
        const newStartIndex = startImageIndex + 5;
        if (newStartIndex < product.imageUrls.length) {
            setStartImageIndex(Math.min(newStartIndex, product.imageUrls.length - 5));
        }
    };
    const handleBackInListClick = () => {
        const newStartIndex = Math.max(startImageIndex - 5, 0);
        setStartImageIndex(newStartIndex);
        setMainImageIndex(newStartIndex);
    };

    const handleAddToCart = (size, quantity) => {
        addToCart(product, size, quantity);
    };
    const checkout=()=>{
        navigate('/checkout');
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <div style={{ maxWidth: '700px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', maxWidth: '600px', maxHeight: '600px',margin:'auto' }}>
                    <img src={product.imageUrls[mainImageIndex]} alt={product.name} style={{ maxWidth: '100%', cursor: 'pointer' }} onClick={() => handleImageClick(mainImageIndex)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }} className="slide-images">
                    {product.imageUrls.slice(startImageIndex, Math.min(startImageIndex + 5, product.imageUrls.length)).map((imageUrl, index) => {
                        const imageIndex = startImageIndex + index;
                        return (
                            <div key={index} className="slide-transition" style={{ position: 'relative', marginRight: '5px', marginBottom: '10px' }}>
                                {index === 0 && startImageIndex > 0 && (
                                    <img src={backSvg} alt="Back" style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '50px', cursor: 'pointer' }} onClick={handleBackInListClick} />
                                )}
                                {index === 4 && startImageIndex + 5 < product.imageUrls.length && (
                                    <img src={nextSvg} alt="Next" style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '50px', cursor: 'pointer' }} onClick={handleNextInListClick} />
                                )}
                                <img src={imageUrl} alt={product.name} style={{ width: '100px', cursor: 'pointer' }} onClick={() => handleImageClick(imageIndex)} />
                            </div>
                        );
                    })}
                </div>

            </div>

            <div style={{ flex: 1, paddingLeft: '15px', display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'left' }}>{product.name}</h2>
                <p style={{ textAlign: 'left', fontWeight: 'bold', color: '#F15E2C', fontSize: '1.5rem' }}>{product.price} USD</p>
                <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <div style={{ marginRight: '10px', flex: 1, maxWidth: '30%' }}>
                        <p style={{ textAlign: 'left', fontWeight: 'bold' }}>Size:</p>
                        <select onChange={(e) => setSelectedSize(e.target.value)}>
                            <option value="">Select Size</option>
                            {Size.map((size, index) => (
                                <option key={index} value={size} disabled={!productSizes.some(ps => ps.size === index)}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedSize && (
                        <div style={{ flex: 1, maxWidth: '30%' }}>
                            <p style={{ textAlign: 'left', fontWeight: 'bold' }}>Quantity:</p>
                            <select onChange={(e) => setSelectedQuantity(e.target.value)}>
                                {[...Array(12).keys()].map((quantity) => (
                                    <option key={quantity} value={quantity + 1}>
                                        {quantity + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => handleAddToCart(selectedSize, selectedQuantity)}>Add to Cart</button>
                    <button style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => checkout()}>Checkout</button>
                </div>
                <div>
                    <p style={{ textAlign: 'left' }}>{product.description}</p>
                </div>
                <div>
                    <p> Size chart</p>
                    <img src={SizeChart} alt="size chart" style={{width:'400px'}}/>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;