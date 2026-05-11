import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Otp } from '../models/otp.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { sendRegistrationOTP } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Cookie options — always httpOnly + secure; sameSite relaxed for local dev
const cookieOptions = () => ({
    httpOnly: true,
    secure:   true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

// Generate access + refresh tokens and persist the refresh token on the user
const issueTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken  = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

// POST /auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    if (!email?.trim() || !username?.trim())
        throw new ApiError(400, 'Email and username are required');

    const existing = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (existing) {
        throw new ApiError(409, existing.email === email
            ? 'An account with this email already exists'
            : 'This username is already taken'
        );
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
        { email },
        { email, otp: hashedOtp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    await sendRegistrationOTP(email, otp);

    return res.status(200).json(new ApiResponse(200, {}, 'OTP sent to email'));
});

// POST /auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord)
        throw new ApiError(400, 'OTP expired or not requested. Please request a new OTP.');

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) throw new ApiError(400, 'Invalid OTP');

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) throw new ApiError(409, 'Username or email already exists');

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, 'Avatar image is required');

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(500, 'Failed to upload avatar');

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        fullname,
        email,
        password,
        username:   username.toLowerCase(),
        avatar:     avatar.url,
        coverImage: coverImage?.url || '',
    });

    const created = await User.findById(user._id).select('-password -refreshToken');
    if (!created) throw new ApiError(500, 'Something went wrong while registering user');

    await Otp.deleteOne({ email });

    return res.status(201).json(new ApiResponse(201, created, 'User registered successfully'));
});

// POST /auth/login
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) throw new ApiError(400, 'Username or email is required');

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new ApiError(404, 'No account found with these credentials');

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, 'Incorrect password');

    const { accessToken, refreshToken } = await issueTokens(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
    const opts = cookieOptions();

    return res
        .status(200)
        .cookie('accessToken', accessToken, opts)
        .cookie('refreshToken', refreshToken, opts)
        .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, 'Logged in successfully'));
});

// POST /auth/logout
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    const opts = cookieOptions();

    return res
        .status(200)
        .clearCookie('accessToken', opts)
        .clearCookie('refreshToken', opts)
        .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// POST /auth/refresh-token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incoming) throw new ApiError(401, 'Refresh token required');

    let decoded;
    try {
        decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded._id);
    if (!user || incoming !== user.refreshToken)
        throw new ApiError(401, 'Refresh token is expired or already used');

    const { accessToken, refreshToken } = await issueTokens(user._id);
    const opts = cookieOptions();

    return res
        .status(200)
        .cookie('accessToken', accessToken, opts)
        .cookie('refreshToken', refreshToken, opts)
        .json(new ApiResponse(200, { accessToken, refreshToken }, 'Token refreshed'));
});

// POST /auth/change-password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.isPasswordCorrect(oldPassword)))
        throw new ApiError(400, 'Current password is incorrect');

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// GET /users/current-user
const getCurrentUser = asyncHandler(async (req, res) =>
    res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'))
);

// PATCH /users/update-details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullname, email } },
        { new: true }
    ).select('-password -refreshToken');

    return res.status(200).json(new ApiResponse(200, user, 'Account details updated'));
});

// PATCH /users/avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    if (!localPath) throw new ApiError(400, 'Avatar file is required');

    const uploaded = await uploadOnCloudinary(localPath);
    if (!uploaded) throw new ApiError(500, 'Failed to upload avatar');

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: uploaded.url } },
        { new: true }
    ).select('-password -refreshToken');

    return res.status(200).json(new ApiResponse(200, user, 'Avatar updated'));
});

// PATCH /users/cover-image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    if (!localPath) throw new ApiError(400, 'Cover image file is required');

    const uploaded = await uploadOnCloudinary(localPath);
    if (!uploaded) throw new ApiError(500, 'Failed to upload cover image');

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: uploaded.url } },
        { new: true }
    ).select('-password -refreshToken');

    return res.status(200).json(new ApiResponse(200, user, 'Cover image updated'));
});

// GET /users/c/:username
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) throw new ApiError(400, 'Username is required');

    const [channel] = await User.aggregate([
        { $match: { username: username.toLowerCase() } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'channel',    as: 'subscribers'  } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'subscriber', as: 'subscribedTo' } },
        {
            $addFields: {
                subscribersCount:         { $size: '$subscribers' },
                channelsSubscribedToCount: { $size: '$subscribedTo' },
                isSubscribed: {
                    $cond: { if: { $in: [req.user?._id, '$subscribers.subscriber'] }, then: true, else: false },
                },
            },
        },
        { $project: { fullname: 1, username: 1, avatar: 1, coverImage: 1, email: 1, subscribersCount: 1, channelsSubscribedToCount: 1, isSubscribed: 1 } },
    ]);

    if (!channel) throw new ApiError(404, 'Channel not found');

    return res.status(200).json(new ApiResponse(200, channel, 'Channel fetched'));
});

// GET /users/search?query=
const searchChannels = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query?.trim()) throw new ApiError(400, 'Search query is required');

    const channels = await User.find({
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { fullname:  { $regex: query, $options: 'i' } },
        ],
    }).select('fullname username avatar coverImage');

    return res.status(200).json(new ApiResponse(200, channels, 'Channels found'));
});

// GET /users/watch-history
const getWatchHistory = asyncHandler(async (req, res) => {
    const [user] = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from:     'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as:       'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from:     'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as:       'owner',
                            pipeline: [{ $project: { fullname: 1, username: 1, avatar: 1 } }],
                        },
                    },
                    { $addFields: { owner: { $first: '$owner' } } },
                ],
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, user.watchHistory, 'Watch history fetched'));
});

export {
    sendOtp,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    searchChannels,
    getWatchHistory,
};
