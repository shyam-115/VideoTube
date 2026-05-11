import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
    }
});

export const Otp = mongoose.model('Otp', otpSchema);
