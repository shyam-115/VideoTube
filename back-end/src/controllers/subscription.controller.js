import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Subscription } from '../models/subscriptions.model.js';

// POST /api/v1/subscriptions/:channelId — Subscribe to a channel
export const subscribeChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (req.user._id.toString() === channelId)
        throw new ApiError(400, 'You cannot subscribe to yourself');

    const exists = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });
    if (exists) throw new ApiError(400, 'Already subscribed to this channel');

    const subscription = await Subscription.create({ subscriber: req.user._id, channel: channelId });

    return res.status(201).json(new ApiResponse(201, subscription, 'Subscribed successfully'));
});

// DELETE /api/v1/subscriptions/:channelId — Unsubscribe from a channel
export const unsubscribeChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const deleted = await Subscription.findOneAndDelete({ subscriber: req.user._id, channel: channelId });
    if (!deleted) throw new ApiError(400, 'You are not subscribed to this channel');

    return res.status(200).json(new ApiResponse(200, {}, 'Unsubscribed successfully'));
});

// GET /api/v1/subscriptions/count/:channelId — Get subscriber count of a channel
export const getSubscriberCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const count = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(new ApiResponse(200, { channelId, count }, 'Subscriber count fetched'));
});

// GET /api/v1/subscriptions/status/:channelId — Check if current user is subscribed
export const isSubscribedToChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const exists = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });

    return res.status(200).json(new ApiResponse(200, { isSubscribed: !!exists }, 'Status fetched'));
});

// GET /api/v1/subscriptions/list — Get all channels the current user is subscribed to
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({ subscriber: req.user._id })
        .populate('channel', 'fullname username avatar coverImage');

    const channels = subscriptions.map((s) => s.channel).filter(Boolean);

    return res.status(200).json(new ApiResponse(200, channels, 'Subscribed channels fetched'));
});
