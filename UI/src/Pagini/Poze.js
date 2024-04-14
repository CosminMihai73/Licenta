import React, { useState, useEffect } from 'react';
import axios from "axios";
import "./poze.css"

function PozeHolland() {
    // State-uri
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [renamingImage, setRenamingImage] = useState(null);
    const [newFilename, setNewFilename] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Funcție pentru a prelua imaginile din backend
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/images/');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    // Funcție pentru ștergerea imaginii
    const handleDelete = async (filename) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/delete/?filename=${filename}`);
            setImages(images.filter(img => img.image_name !== filename));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    // Funcție pentru redenumirea imaginii
    const handleRename = async (oldFilename, newFilename) => {
        try {
            await axios.put(`http://127.0.0.1:8000/rename/?old_filename=${oldFilename}&new_filename=${newFilename}`);
            fetchImages(); // Reîmprospătare imaginilor după redenumire
            setRenamingImage(null); // Resetare stare pentru redenumire
            setNewFilename(""); // Resetare stare pentru noul nume de fișier
        } catch (error) {
            console.error('Error renaming image:', error);
        }
    };

    // Funcție pentru încărcarea imaginii
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploading(true);
            await axios.post('http://127.0.0.1:8000/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSelectedFile(null); // Clear the file input after successful upload
            fetchImages(); // Refresh images after uploading
            setShowUploadForm(false); // Hide the upload form after successful upload
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    // Funcție pentru schimbarea fișierului selectat
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Funcție pentru anularea redenumirii imaginii
    const cancelRename = () => {
        setRenamingImage(null);
        setNewFilename("");
    };

    // Returnul componentei
    return (
        <div className="poze-container">
        <button className="custom-button" onClick={() => window.location.href = '/'}>Homepage</button>
        <button className="custom-button" onClick={() => window.location.href = '/Grafice'}>Inapoi</button>
            <h1>Image Gallery</h1>
            <button className="upload-button" onClick={() => setShowUploadForm(!showUploadForm)}>Upload Photo</button>
            {showUploadForm && (
                <div className="upload-form">
                    <h2>Upload Image</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="file" className="file-input" onChange={handleFileChange} />
                        <button type="submit" className="upload-submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>
            )}
            <table className="gallery-container">
                <thead>
                    <tr>
                        
                    </tr>
                </thead>
                <tbody>
                    {images.map((image, index) => (
                        <tr key={index}>
                            <td>
                                <h3 className="image-name">{image.image_name}</h3>
                                <img src={image.image_url} alt={image.image_name} className="image-preview" />
                            </td>
                            <td>
                                <button className="delete-button" onClick={() => handleDelete(image.image_name)}>Delete</button>
                                {renamingImage === image.image_name ? (
                                    <div>
                                        <input type="text" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} className="rename-input" />
                                        <button onClick={() => handleRename(image.image_name, newFilename)} className="rename-button">Rename</button>
                                        <button onClick={cancelRename} className="cancel-button">X</button> {/* Butonul de "X" pentru anularea modificării */}
                                    </div>
                                ) : (
                                    <button onClick={() => setRenamingImage(image.image_name)} className="modify-button">Modify</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PozeHolland;
