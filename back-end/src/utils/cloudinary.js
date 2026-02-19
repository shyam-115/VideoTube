import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
        });

        console.log("file uploaded successfully", response.secure_url);

        // Clean up the temporary file after successful upload
        fs.unlinkSync(localFilePath);

        // ✅ normalize the return object for your controller
        return {
            url: response.secure_url,
            duration: response.duration || 0, // only available for video/audio
        };

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};


export { uploadOnCloudinary };