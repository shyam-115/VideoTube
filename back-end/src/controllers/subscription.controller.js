import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscriptions.model.js";
import { User } from "../models/user.model.js";

// @desc Subscribe to a channel
// @route POST /api/v1/subscriptions/:channelId
export const subscribeChannel = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSubscription) {
        throw new ApiError(400, "Already subscribed to this channel");
    }

    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(200, subscription, "Subscribed successfully")
    );
});

// @desc Unsubscribe from a channel
// @route DELETE /api/v1/subscriptions/:channelId
export const unsubscribeChannel = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    const unsubscribed = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    });

    if (!unsubscribed) {
        throw new ApiError(400, "Not subscribed to this channel");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Unsubscribed successfully")
    );
});

// @desc Get subscriber count of a channel
// @route GET /api/v1/subscriptions/count/:channelId
export const getSubscriberCount = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    const count = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(
        new ApiResponse(200, { channelId, count }, "Subscriber count fetched")
    );
});

// @desc Check if current user is subscribed to a channel
// @route GET /api/v1/subscriptions/isSubscribed/:channelId
export const isSubscribedToChannel = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    const exists = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(200, { isSubscribed: !!exists }, "Subscription status fetched")
    );
});

// @desc Get channels the current user is subscribed to
// @route GET /api/v1/subscriptions/subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({ subscriber: req.user._id })
        .populate("channel", "fullname username avatar coverImage");

    const channels = subscriptions
        .map((s) => s.channel)
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched")
    );
});
