import { Video } from '../models/video.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import fs from 'fs';

const unlinkSafe = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (_) {}
    }
};

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!title || !description || !videoLocalPath) {
        throw new ApiError(400, 'All fields are required');
    }

    let uploadedVideo;
    let uploadedThumbnail;
    try {
        uploadedVideo = await uploadOnCloudinary(videoLocalPath, 'video');
        uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, 'image');
    } finally {
        unlinkSafe(videoLocalPath);
        unlinkSafe(thumbnailLocalPath);
    }

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
        throw new ApiError(500, 'Error uploading video or thumbnail');
    }

    const durationInSeconds = Math.floor(uploadedVideo.duration || 0);

    const video = await Video.create({
        title,
        description,
        video: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        duration: durationInSeconds,
        owner: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, video, 'Video uploaded successfully')
    );
});


// Get all published videos (supports search and sorting)
const getAllVideos = asyncHandler(async (req, res) => {
    // Use validated query if available (from Joi validation), otherwise use req.query
    const query = req.validated?.query || req.query;
    const {
        page = 1,
        limit = 10,
        query: searchQuery,
        sortBy,
        sortType = 'desc'
    } = query;

    const options = {
        page: typeof page === 'number' ? page : parseInt(page, 10),
        limit: typeof limit === 'number' ? limit : parseInt(limit, 10),
    };

    // Build match stage
    const matchStage = { isPublished: true };
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
        const safe = searchQuery.trim();
        matchStage.$or = [
            { title: { $regex: safe, $options: 'i' } },
            { description: { $regex: safe, $options: 'i' } }
        ];
    }

    // Build sort stage
    const sortStage = {};
    if (sortBy === 'views') {
        sortStage.views = sortType === 'asc' ? 1 : -1;
    } else if (sortBy === 'createdAt') {
        sortStage.createdAt = sortType === 'asc' ? 1 : -1;
    } else {
        // default latest first
        sortStage.createdAt = -1;
    }

    const aggregate = Video.aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $unwind: {
                path: '$owner',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                'owner.password': 0,
                'owner.refreshToken': 0,
                'owner.watchHistory': 0
            }
        }
    ]);

    const result = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "All videos fetched successfully")
    );
});

// Get a video by ID and increment view count
// Get a video by ID and increment view count
const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;   // ✅ match your route

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(id).populate('owner', 'username fullname avatar');

    if (!video || !video.isPublished) {
        throw new ApiError(404, "Video not found");
    }

    // Increment views
    video.views += 1;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});


// Get videos by a specific channel (user)
const getChannelVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const options = {
        page: typeof page === 'number' ? page : parseInt(page, 10),
        limit: typeof limit === 'number' ? limit : parseInt(limit, 10),
    };

    const aggregate = Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId), isPublished: true } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $unwind: {
                path: '$owner',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                'owner.password': 0,
                'owner.refreshToken': 0,
                'owner.watchHistory': 0
            }
        }
    ]);

    const result = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Channel videos fetched successfully")
    );
});

export {
    uploadVideo,
    getAllVideos,
    getVideoById,
    getChannelVideos
};
