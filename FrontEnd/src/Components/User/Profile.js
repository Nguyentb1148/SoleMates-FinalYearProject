import React, { useEffect, useState } from 'react';
import { getUserData, updateUserProfile } from "../../utils/Api/UserApi";
import defaultAvatar from '../../Img/DefaultAvatar.png';
import {ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";
import { storage } from "../../firebase";
const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const userId = storedUser?.Id;
            if (userId) {
                const userData = await getUserData(userId);
                setUser(userData);
                setNewUsername(userData.userName)
                setImagePreview(userData.imageFileName);
                setNewPhoneNumber(userData.phoneNumber || '');
                setNewAddress(userData.address || '');
            }
        };

        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl); // Update the image preview URL
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsEditing(true);
        const formData = new FormData();
        if (newUsername) {
            formData.append('Username', newUsername);
        }
        if (newPhoneNumber) {
            formData.append('PhoneNumber', newPhoneNumber);
        }
        if (newAddress) {
            formData.append('Address', newAddress);
        }
        if (newImage) {
            if (user.imageFileName) {
                const oldImageRef = ref(storage, `ProfileImage/${user.id}`);
                deleteObject(oldImageRef).then(() => {
                    console.log('Old profile image deleted successfully');
                }).catch((error) => {
                    console.error('Error deleting old profile image', error);
                });
            }
            const imageFileRef = ref(storage, `ProfileImage/${user.id}`);
            await uploadBytes(imageFileRef, newImage).then(async () => {
                const imageDownloadUrl = await getDownloadURL(imageFileRef);
                console.log('Profile image url: ', imageDownloadUrl);
                formData.append('ImageFile', imageDownloadUrl);
            });
        }
        try {
            const updateResponse = await updateUserProfile(user.id, formData);
            const userData = {
                Id: updateResponse.user.id,
                Address: updateResponse.user.address,
                Email: updateResponse.user.email,
                ImageFileName: updateResponse.user.imageFileName,
                PhoneNumber: updateResponse.user.phoneNumber,
                UserName: updateResponse.user.userName
            };
            setUser(updateResponse);
            localStorage.setItem('user', JSON.stringify(userData));
            const storedUser = JSON.parse(localStorage.getItem('user'));
            console.log('store user: ',storedUser)
            window.location.reload();

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Profile Page</h1>
            {!user ? (
                <div>No user information found.</div>
            ) : (
                <div style={{ maxWidth: '600px', margin: 'auto', border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
                    <h2>User Information</h2>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginRight: '20px' }}>
                            <h3>Profile Picture</h3>
                            <img
                                src={imagePreview || defaultAvatar}
                                alt="Profile"
                                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <p><strong>Username:</strong> {user.userName}</p>
                            <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
                            <p><strong>Address:</strong> {user.address}</p>
                            <button onClick={handleEdit} style={{ padding: '8px 16px', marginTop: '10px' }}>Edit Profile</button>
                        </div>
                    </div>

                    {isEditing && (
                        <div style={{ marginTop: '20px' }}>
                            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="New Username" />
                            <input type="text" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="New Phone Number" />
                            <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="New Address" />
                            <input type="file" onChange={handleImageChange} style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    )}
                </div>

            )}
        </div>
    );
};

export default ProfilePage;

