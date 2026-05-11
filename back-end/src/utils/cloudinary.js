import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const unlinkSafe = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
};

export const uploadOnCloudinary = async (localFilePath, resourceType = 'auto') => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
        });
        unlinkSafe(localFilePath);
        return { url: response.secure_url, duration: response.duration || 0 };
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        unlinkSafe(localFilePath);
        return null;
    }
};