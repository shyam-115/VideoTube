import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        username: {
            type: String, required: true, unique: true,
            lowercase: true, trim: true, index: true,
        },
        email: {
            type: String, required: true, unique: true,
            lowercase: true, trim: true,
        },
        fullname: {
            type: String, required: true, trim: true, index: true,
        },
        avatar:     { type: String, required: true },
        coverImage: { type: String },
        password:   { type: String, required: [true, 'Password is required'] },
        refreshToken: { type: String },
        watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    },
    { timestamps: true }
);

// Hash the password before saving if it has been changed
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare a plain-text password against the stored hash
userSchema.methods.isPasswordCorrect = function (password) {
    return bcrypt.compare(password, this.password);
};

// Generate a short-lived JWT access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username, fullname: this.fullname },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate a long-lived JWT refresh token used to issue new access tokens
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username, fullname: this.fullname },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model('User', userSchema);