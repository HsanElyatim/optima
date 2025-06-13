'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { assets } from '@/assets/assets';

const EditProduct = () => {
    const { products, getToken } = useAppContext();
    const router = useRouter();
    const { id } = useParams();

    const [files, setFiles] = useState([]);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Sunglasses');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [existingImages, setExistingImages] = useState([]);
    const [stock, setStock] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Run this when products or id change
    useEffect(() => {
        if (!products || products.length === 0) {
            // Products not loaded yet, wait
            return;
        }
        if (!id) {
            toast.error('Invalid product ID');
            setLoading(false);
            return;
        }

        const product = products.find((p) => p._id === id);
        if (product) {
            setProductData(product);
            setName(product.name || '');
            setDescription(product.description || '');
            setCategory(product.category || 'Sunglasses');
            setPrice(product.price || '');
            setOfferPrice(product.offerPrice || '');
            setExistingImages(product.image || []);
            setStock(product.stock || 0);
            setIsActive(product.isActive !== false);

        } else {
            toast.error('Product not found');
        }
        setLoading(false);
    }, [products, id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('offerPrice', offerPrice);
        formData.append("existingImages", JSON.stringify(existingImages));
        formData.append('stock', stock);
        formData.append('isActive', isActive);

        files.forEach((file) => formData.append('images', file));

        try {
            const token = await getToken();
            const { data } = await axios.patch(`/api/product/update/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                toast.success('Product updated!');

            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!productData) return <div>Product not found</div>;

    return (
        <form onSubmit={handleUpdate} className="md:p-10 p-4 space-y-5 max-w-lg">
            <div>
                <p className="text-base font-medium">Product Images</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Show existing images with remove button */}
                    {existingImages.map((img, index) => (
                        <div key={`existing-${index}`} className="relative group">
                            <Image
                                src={img}
                                alt={`Existing Product Image ${index}`}
                                width={100}
                                height={100}
                                className="rounded"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = existingImages.filter((_, i) => i !== index);
                                    setExistingImages(updated);
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs hidden group-hover:block"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Show new upload inputs only if total images < 4 */}
                    {Array.from({ length: 4 - existingImages.length }).map((_, index) => (
                        <label key={`new-${index}`} htmlFor={`image-${index}`}>
                            <input
                                type="file"
                                id={`image-${index}`}
                                hidden
                                onChange={(e) => {
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0];
                                    setFiles(updatedFiles);
                                }}
                            />
                            <Image
                                className="max-w-24 cursor-pointer"
                                src={
                                    files[index]
                                        ? URL.createObjectURL(files[index])
                                        : assets.upload_area
                                }
                                alt="Upload New"
                                width={100}
                                height={100}
                            />
                        </label>
                    ))}
                </div>

            </div>

            {/* Name */}
            <div className="flex flex-col gap-1 max-w-md">
                <label className="text-base font-medium" htmlFor="product-name">
                    Product Name
                </label>
                <input
                    id="product-name"
                    type="text"
                    placeholder="Type here"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 max-w-md">
                <label className="text-base font-medium" htmlFor="product-description">
                    Product Description
                </label>
                <textarea
                    id="product-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Type here"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    required
                ></textarea>
            </div>

            {/* Category, Price, Offer Price */}
            <div className="flex items-center gap-5 flex-wrap">
                <div className="flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="category">
                        Category
                    </label>
                    <select
                        id="category"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                    >
                        <option value="Sunglasses">Sunglasses</option>
                        <option value="Eyewear">Eyewear</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="product-price">
                        Price
                    </label>
                    <input
                        id="product-price"
                        type="number"
                        placeholder="0"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="offer-price">
                        Promotion Price
                    </label>
                    <input
                        id="offer-price"
                        type="number"
                        placeholder="0"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setOfferPrice(e.target.value)}
                        value={offerPrice}
                        required
                    />
                </div>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
                {/* Stock input */}
                <div className="flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="stock">
                        Stock
                    </label>
                    <input
                        id="stock"
                        type="number"
                        placeholder="0"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        onChange={(e) => setStock(e.target.value)}
                        value={stock}
                        required
                    />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 mt-2">
                    <label htmlFor="isActive" className="text-sm font-medium">
                        Active
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="sr-only peer"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                    </label>
                </div>
            </div>


            <button
                type="submit"
                className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded"
            >
                Update
            </button>
        </form>
    );
};

export default EditProduct;
