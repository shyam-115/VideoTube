import mongoose from "mongoose"; // + Add this import
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const toggleLikeDislike = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;
    const { type } = req.body; // "like" or "dislike"

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!["like", "dislike"].includes(type)) {
        throw new ApiError(400, "Invalid type. Must be either 'like' or 'dislike'.");
    }

    const video = await Video.findById(id);
    if (!video || !video.isPublished) {
        throw new ApiError(404, 'Video not found');
    }

    const existing = await Like.findOne({ user: userId, video: id });

    if (existing) {
        if (existing.type === type) {
            // Toggle off if same reaction
            await existing.deleteOne();
            return res
                .status(200)
                .json(new ApiResponse(200, null, `Removed ${type} from video`));
        } else {
            // Change from like ↔ dislike
            existing.type = type;
            await existing.save();
            return res
                .status(200)
                .json(new ApiResponse(200, existing, `Updated to ${type}`));
        }
    } else {
        // New like/dislike
        const newReaction = await Like.create({
            user: userId,
            video: id,
            type,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newReaction, `Video ${type}d successfully`));
    }
});

// ✅ Get Like/Dislike Count
export const getLikesDislikesCount = asyncHandler(async (req, res) => {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(id);
    if (!video || !video.isPublished) {
        throw new ApiError(404, 'Video not found');
    }

    const likes = await Like.countDocuments({ video: id, type: "like" });
    const dislikes = await Like.countDocuments({ video: id, type: "dislike" });

    res.status(200).json(
        new ApiResponse(200, { likes, dislikes }, "Counts fetched successfully")
    );
});

// ✅ Get logged-in user's reaction (like/dislike/none)
export const getUserReaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;



    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(id);
    if (!video || !video.isPublished) {
        throw new ApiError(404, 'Video not found');
    }

    const reaction = await Like.findOne({ video: id, user: userId });

    return res.status(200).json(
        new ApiResponse(200, { reaction: reaction ? reaction.type : null }, "User reaction fetched")
    );
});
