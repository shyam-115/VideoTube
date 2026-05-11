import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/likes/:id — Toggle like or dislike on a video
export const toggleLikeDislike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(400, 'Invalid video ID');

    if (!['like', 'dislike'].includes(type))
        throw new ApiError(400, "Type must be either 'like' or 'dislike'");

    const video = await Video.findById(id);
    if (!video || !video.isPublished) throw new ApiError(404, 'Video not found');

    const existing = await Like.findOne({ user: userId, video: id });

    if (existing) {
        if (existing.type === type) {
            // Same reaction clicked again — remove it
            await existing.deleteOne();
            return res.status(200).json(new ApiResponse(200, null, `${type} removed`));
        }
        // Switch from like to dislike or vice versa
        existing.type = type;
        await existing.save();
        return res.status(200).json(new ApiResponse(200, existing, `Changed to ${type}`));
    }

    // First reaction on this video
    const reaction = await Like.create({ user: userId, video: id, type });
    return res.status(201).json(new ApiResponse(201, reaction, `Video ${type}d`));
});

// GET /api/v1/likes/:id/count — Get like and dislike counts for a video
export const getLikesDislikesCount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(400, 'Invalid video ID');

    const video = await Video.findById(id);
    if (!video || !video.isPublished) throw new ApiError(404, 'Video not found');

    const likes    = await Like.countDocuments({ video: id, type: 'like' });
    const dislikes = await Like.countDocuments({ video: id, type: 'dislike' });

    return res.status(200).json(new ApiResponse(200, { likes, dislikes }, 'Counts fetched'));
});

// GET /api/v1/likes/status/:id — Get the current user's reaction on a video
export const getUserReaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(400, 'Invalid video ID');

    const video = await Video.findById(id);
    if (!video || !video.isPublished) throw new ApiError(404, 'Video not found');

    const reaction = await Like.findOne({ video: id, user: userId });

    return res.status(200).json(
        new ApiResponse(200, { reaction: reaction?.type ?? null }, 'Reaction fetched')
    );
});
