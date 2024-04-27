import React, {useEffect, useState} from 'react';
import {deleteObject, getDownloadURL, listAll, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../firebase";
import {addProduct, deleteProductById, GetAllProductNamesAndIds, getProductById, updateProductById} from "../../utils/Api/ProductApi";
import {addProductSize, getProductSizesByProductId, updateProductSize} from "../../utils/Api/ProductSizeApi";
import {Guid} from "guid-typescript";
import './ProductPage.css'
import { Dropdown } from 'react-bootstrap';

const ProductPage = () => {

    const [mainImage, setMainImage] = useState(null); // State to hold the main image
    let [listImages, setListImages] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [design, setDesign] = useState(0);
    const [productLine, setProductLine] = useState(0);
    const [material, setMaterial] = useState(0);
    const [color, setColor] = useState(0);
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [ProductSizes,setProductSizes]=useState([]);
    const [newSize, setNewSize] = useState('');
    const [newQuantity, setNewQuantity] = useState('');
    const [listImagesNull, setListImagesNull] = useState(false); // New state variable

    const Design = ['LowTop', 'HighTop', 'Mule'];
    const ProductLine = ['Basas', 'Vintas', 'Urbas', 'Pattas', 'Socks', 'Shoelaces'];
    const Material = ['Canvas', 'Suede', 'Leather', 'Flannel', 'Corduroy'];
    const Color = ['Gray', 'White', 'Cream', 'Charcoal', 'Teal', 'Beige', 'Silver', 'NavyBlue', 'OliveGreen', 'Lavender', 'Coral', 'CarrotOrange', 'CrimsonRed'];
    const Size = ['35', '36', '36,5', '37', '38', '38,5', '39', '40', '40,5', '41', '42', '42,5', '43', '44', '44,5', '45', '46'];

    const designMap = { LowTop: 0, HighTop: 1, Mule: 2 };
    const productLineMap = { Basas: 0, Vintas: 1, Urbas: 2, Pattas: 3, Socks: 4, Shoelaces: 5 };
    const materialMap = { Canvas: 0, Suede: 1, Leather: 2, Flannel: 3, Corduroy: 4 };
    const colorMap = {Gray: 0, White: 1, Cream: 2, Charcoal: 3, Teal: 4, Beige: 5, Silver: 6, NavyBlue: 7, OliveGreen: 8, Lavender: 9, Coral: 10, CarrotOrange: 11, CrimsonRed: 12};

    const [selectedProduct, setSelectedProduct] = useState(null);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsData = await GetAllProductNamesAndIds();
                console.log('product data list: ',productsData)
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);
    const handleMainImageClick = (index) => {
        if (listImages[index]) {
            setMainImage(listImages[index]);
        }
        else {
            setMainImage(listImages[0]);
        }
    };
    const handleDeleteAllImages = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete all images?');
        if (confirmDelete) {
            try {
                if (selectedProduct) {
                    const imagesFolderRef = ref(storage, `products/${selectedProduct.productId}`);
                    const items = await listAll(imagesFolderRef);
                    await Promise.all(items.items.map(async (item) => {
                        await deleteObject(item);
                        console.log('Deleted file:', item.name);
                    }));
                }
                setMainImage(null);
                setListImages([]);
                setListImagesNull(true);
                console.log('All images deleted successfully');
            } catch (error) {
                console.error('Error deleting images:', error);
            }
        }
    };
    const handleProductClick = async (productId) => {
        try {
            const productData = await getProductById(productId);
            console.log('Product details:', productData);
            setName(productData.name);
            setDescription(productData.description);
            setPrice(productData.price.toString());
            setDesign(Design[productData.design]);
            setProductLine(ProductLine[productData.productLine]);
            setMaterial(Material[productData.material]);
            setColor(Color[productData.color]);

            setMainImage(productData.imageUrls[0]);
            setListImages(productData.imageUrls);
            setSelectedProduct(productData);

            const productSizes = await getProductSizesByProductId(productId);
            console.log('Product sizes:', productSizes);
            setSizes(productSizes);
            setProductSizes(productSizes);

        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };
    const handleAddNewSize = () => {
        if (newSize && newQuantity) {
            if (Size.includes(newSize)) {
                const sizeIndex = Size.indexOf(newSize);
                const newSizeObject = { size: sizeIndex, quantity: parseInt(newQuantity), addQuantity: '' };
                const updatedSizes = [...sizes, newSizeObject];

                setSizes(updatedSizes);
                setNewSize('');
                setNewQuantity('');

            } else {
                console.error('Invalid size selected');
            }
        } else {
            console.error('Please provide both size and quantity');
        }
    };
    const handleAddQuantity = (index) => {
        if (sizes[index].addQuantity) {
            const updatedSizes = [...sizes];
            updatedSizes[index].quantity += parseInt(sizes[index].addQuantity);
            updatedSizes[index].addQuantity = ''; // Reset addQuantity
            setSizes(updatedSizes);
        } else {
            console.error('Please provide a quantity to add');
        }
    };
    const handleSizeChange = (index, field, value) => {
        const updatedSizes = [...sizes];
        if (field === 'addQuantity') {
            updatedSizes[index] = {
                ...updatedSizes[index],
                [field]: isNaN(value) ? '' : parseInt(value)
            };
        } else if (field === 'size') {
            const sanitizedValue = value.replace(',', '');
            updatedSizes[index] = {
                ...updatedSizes[index],
                [field]: sanitizedValue
            };
        } else {
            updatedSizes[index] = {
                ...updatedSizes[index],
                [field]: value
            };
        }
        setSizes(updatedSizes);
    };
    const handleImageUpload = (event) => {
        const files = event.target.files;
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;
        const listImagePreviews = fileArray.map(file => URL.createObjectURL(file));
        setListImages([...listImages, ...listImagePreviews]);
        if (!mainImage && listImagePreviews.length > 0) {
            setMainImage(listImagePreviews[0]);
        }
    };
    const handleDeleteImage = async (productId, index) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (confirmDelete) {
            try {
                const imageRef = ref(storage, `products/${productId}/image_${index}`);
                await deleteObject(imageRef);
                console.log('Deleted image:', imageRef.fullPath);
                const updatedImageUrls = selectedProduct.imageUrls.filter((_, idx) => idx !== index);
                setSelectedProduct(prevProduct => ({
                    ...prevProduct,
                    imageUrls: updatedImageUrls,
                }));
                if (mainImage === listImages[index]) {
                    if (listImages.length > 1) {
                        setMainImage(listImages[0]);
                    } else {
                        setMainImage(null);
                    }
                }
                const updatedListImages = listImages.filter((_, idx) => idx !== index);
                setListImages(updatedListImages);
                if (updatedListImages.length === 0) {
                    setListImagesNull(true);
                }
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    };
    const handleSaveProduct = async () => {
        if (listImages.length === 0) {
            console.error('No images to upload');
            return;
        }
        const newProductId = Guid.create().toString();
        const imageUrls = [];
        try {
            await Promise.all(listImages.map(async (image, index) => {
                const imageRef = ref(storage, `products/${newProductId}/image_${index}`);
                try {
                    const blob = await fetch(image).then(res => res.blob());
                    const snapshot = await uploadBytes(imageRef, blob);
                    const imageUrl = await getDownloadURL(snapshot.ref);
                    imageUrls.push(imageUrl);
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }));
            const sortedImageUrls = imageUrls.sort((a, b) => {
                const indexA = parseInt(a.match(/image_(\d+)/)[1]);
                const indexB = parseInt(b.match(/image_(\d+)/)[1]);
                return indexA - indexB;
            });
            const numericDesign = designMap[design];
            const numericProductLine = productLineMap[productLine];
            const numericMaterial = materialMap[material];
            const numericColor = colorMap[color];
            const updatedSizes = sizes.map((sizeObj) => {
                const sizeValue = Size[sizeObj.size];
                console.log('size value:', sizeValue);

                if (sizeObj.size !== -1) {
                    return {
                        size: sizeObj.size,
                        quantity: (parseInt(sizeObj.quantity) || 0) + (parseInt(sizeObj.addQuantity) || 0),
                        productSizeId: `${sizeValue}-${newProductId}`,
                        productId: newProductId
                    };
                } else {
                    console.error('Invalid size index:', sizeObj.size);
                    return null;
                }
            }).filter(size => size !== null);
            const productToSave = {
                name,
                description,
                design: numericDesign,
                productLine: numericProductLine,
                material: numericMaterial,
                color: numericColor,
                price: parseFloat(price),
                sizes: updatedSizes,
                productId: newProductId,
                imageUrls: sortedImageUrls,
            };
            const response = await addProduct(productToSave);
            await Promise.all(updatedSizes.map(async (size) => {
                const productSizeData = {
                    ProductSizeId: size.productSizeId,
                    Size: size.size,
                    Quantity: size.quantity,
                    ProductId: newProductId
                };
                await addProductSize(productSizeData);
            }));
            alert('Product added successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };
    const handleEditProduct = async (productId) => {
        try {
            if (!selectedProduct) {
                console.error('No product selected for editing');
                return;
            }
            const newImageFiles = listImages.filter(image => !selectedProduct.imageUrls.includes(image));
            const updatedImageUrls = await Promise.all(newImageFiles.map(async (imageFile, index) => {
                const imageRef = ref(storage, `products/${productId}/image_${selectedProduct.imageUrls.length + index}`);
                try {
                    const blob = await fetch(imageFile).then(res => res.blob());
                    await uploadBytes(imageRef, blob);
                    return await getDownloadURL(imageRef);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return null;
                }
            }));
            let imageUrls;
            if (listImagesNull) {
                imageUrls = updatedImageUrls;
            } else {
                const remainingImageUrls = selectedProduct.imageUrls.filter(url => !newImageFiles.includes(url));
                imageUrls = [...remainingImageUrls, ...updatedImageUrls];
            }
            let numericDesign = designMap[selectedProduct.design];
            let numericProductLine = productLineMap[selectedProduct.productLine];
            let numericMaterial = materialMap[selectedProduct.material];
            let numericColor = colorMap[selectedProduct.color];
            if (design !== selectedProduct.design) {
                numericDesign = designMap[design];
            }
            if (productLine !== selectedProduct.productLine) {
                numericProductLine = productLineMap[productLine];
            }
            if (material !== selectedProduct.material) {
                numericMaterial = materialMap[material];
            }
            if (color !== selectedProduct.color) {
                numericColor = colorMap[color];
            }
            console.log('ProductSizes: ', ProductSizes);
            for (const item of sizes) {
                const index = sizes.indexOf(item);
                let productOfSizeId = item.productId;
                let sizeValue = Size[item.size];
                let productSizeId = item.productSizeId;
                if (!productOfSizeId) {
                    productOfSizeId = productId;
                }
                if (!productSizeId) {
                    productSizeId = `${sizeValue}-${productId}`;
                }
                if (!ProductSizes.find(size => size.size === item.size)) {
                    console.log('New size detected:', sizeValue);
                    sizes[index].productId = productOfSizeId;
                    sizes[index].productSizeId = productSizeId;
                    try {
                        await addProductSize({
                            productId: productOfSizeId,
                            productSizeId: productSizeId,
                            size: item.size,
                            quantity:item.quantity
                        });
                        console.log('New size added successfully:', sizeValue);
                    } catch (error) {
                        console.error('Error adding new size:', error);
                    }
                }
            }
            const updatedProduct = {
                productId,
                name,
                description,
                design: numericDesign,
                productLine: numericProductLine,
                material: numericMaterial,
                color: numericColor,
                price: parseFloat(price),
                sizes: sizes.map(size => ({
                    ...size,
                    productSizeId: `${Size[size.size]}-${productId}`,
                })),
                imageUrls: imageUrls,
            };
            const productSizeUpdatePromises = sizes.map(async (size) => {
                try {
                    await updateProductSize(size.productSizeId, {
                        Size: size.size,
                        Quantity: size.quantity,
                        ProductId:productId,
                        ProductSizeId:size.productSizeId
                    });
                    console.log('Product size updated successfully for size:', size.productSizeId);
                } catch (error) {
                    console.error('Error updating product size:', error);
                }
            });
            await Promise.all(productSizeUpdatePromises);
            setSelectedProduct(prevProduct => ({
                ...prevProduct,
                imageUrls: imageUrls,
            }));
            const response = await updateProductById(productId, updatedProduct);
            console.log('Product updated successfully:', response);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };
    const handleDeleteProduct = async (productId) => {
        try {
            const response = await deleteProductById(productId);
            const imagesFolderRef = ref(storage, `products/${productId}`);
            const items = await listAll(imagesFolderRef);
            await Promise.all(items.items.map(async (item) => {
                await deleteObject(item);
                console.log('Deleted file:', item.name);
            }));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };
    return (
        <div className="productpage-container">
            {/* Product List */}
            <div className="product-list">
                <h1>Product List</h1>
                <table className="table-productlist">
                    <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '5px', textAlign: 'left' }}>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.item1} onClick={() => handleProductClick(product.item1)}>
                            <td key={product.item1} className="product-list-item">{product.item2}</td>
                        </tr>
                    ))}

                    </tbody>
                </table>
            </div>
            {/* Product Details */}
            <div className="product-detail">
                {/* Left Section */}
                <div className="left-section">
                    {/*Top information*/}
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        {/* Main image */}
                        <div className="main-image">
                            <div style={{ position: 'relative', marginBottom: '2px',padding:'3px' }}>
                                {mainImage && (
                                    <img
                                        src={mainImage}
                                        alt="image"
                                        style={{ display:'flex',justifyContent: 'space-between' }}
                                    />
                                )}

                            </div>
                        </div>
                        {/* List images */}
                        <div className="list-image">
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ marginBottom: '3px' }} />
                            {listImages.map((image, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img src={image} alt={`Image ${index}`} style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => handleMainImageClick(index)} />
                                    <button onClick={() => handleDeleteImage(selectedProduct.productId, index)} style={{ position: 'absolute', top: '1px', right: '1px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>X</button>
                                </div>
                            ))}
                        </div>
                        {/* Product Information */}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '50%', height: '350px', border: '1px solid #ccc', marginRight: '10px', boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', padding: '4px' }}>
                                <div>
                                    <h3>Name:</h3>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '90%',height:'20px' }} />
                                </div>
                                <div>
                                    <h3>Description:</h3>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '95%', height: '100px' }} />
                                </div>
                                <div>
                                    <h3>Price:</h3>
                                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '20%',height:'20px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*Buttons*/}
                    <div>
                        {listImages.length > 0 && (
                            <button onClick={handleDeleteAllImages} style={{ backgroundColor: 'red', color: 'white', padding: '10px', fontSize: '15px', fontWeight: 'bold' }}>Delete All</button>
                        )}
                        {selectedProduct ? (
                            <div>
                                <button onClick={() => handleEditProduct(selectedProduct.productId)} style={{ backgroundColor: 'green', color: 'white', padding: '10px', fontSize: '15px', fontWeight: 'bold' }}>Update</button>
                                <button onClick={() => handleDeleteProduct(selectedProduct.productId)} style={{ backgroundColor: 'red', color: 'white', padding: '10px', fontSize: '15px', fontWeight: 'bold' }}>Delete</button>
                            </div>
                        ) :
                            <button onClick={handleSaveProduct} style={{ backgroundColor: 'blue', color: 'white', padding: '10px', fontSize: '15px', fontWeight: 'bold' }}>Add</button>
                        }
                    </div>

                    {/*design,line,material,color*/}
                    <div className="dropdown-container">
                        <div>
                            <h3>Design</h3>
                            <select value={design} onChange={(e) => setDesign(e.target.value)}>
                                {Design.map((designOption, index) => (
                                    <option key={designOption} value={designOption}>{designOption}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <h3>Product Line</h3>
                            <select value={productLine} onChange={(e) => setProductLine(e.target.value)}>
                                {ProductLine.map((productLine, index) => (
                                    <option key={index} value={productLine}>{productLine}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <h3>Material</h3>
                            <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                                {Material.map((material, index) => (
                                    <option key={index} value={material}>{material}</option>
                                ))}
                            </select>
                        </div>

                        {/* Color */}
                        <div>
                            <h3>Color</h3>
                            <select value={color} onChange={(e) => setColor(e.target.value)}>
                                {Color.map((color, index) => (
                                    <option key={index} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                    {/* Product size */}
                    <div style={{ display: 'flex', width: '800px', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px' }}>
                        <div style={{ flex: 1, marginRight: '10px', overflowY: 'auto', maxHeight: '400px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Size</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Quantity</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Add Quantity</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sizes.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>No sizes added yet</td>
                                    </tr>
                                ) : (
                                    sizes.map((size, index) => (
                                        <tr key={index} style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                                            <td style={{ padding: '10px', textAlign: 'left' }}>{Size[size.size]}</td>
                                            <td style={{ padding: '10px', textAlign: 'left' }}>{size.quantity}</td>
                                            <td style={{ padding: '10px', textAlign: 'left' }}>
                                                <input type="number" value={size.addQuantity} onChange={(e) => handleSizeChange(index, 'addQuantity', e.target.value)} />
                                            </td>
                                            <td style={{ padding: '5px', textAlign: 'left' }}>
                                                <button onClick={() => handleAddQuantity(index)}>Add</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                <tr style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                                    <td>
                                        <select value={newSize} onChange={(e) => setNewSize(e.target.value)}>
                                            <option value="">Size</option>
                                            {Size.map((size, index) => (
                                                <option key={index} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="text" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
                                    </td>
                                    <td>
                                        <button onClick={handleAddNewSize}>Add</button>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;