import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587/2525
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
    },
    // Fail fast — don't hang for 2+ minutes on blocked ports
    connectionTimeout: 10_000,  // 10 seconds to connect
    greetingTimeout: 10_000,    // 10 seconds for SMTP greeting
    socketTimeout: 15_000,      // 15 seconds for socket inactivity
});

/**
 * Send an OTP email for registration verification
 * @param {string} email 
 * @param {string} otp 
 */
export const sendRegistrationOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"VideoTube Security" <${config.smtp.user || 'noreply@videotube.com'}>`,
            to: email,
            subject: 'Your VideoTube Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #6d28d9; text-align: center;">VideoTube Registration</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering with VideoTube! To complete your registration, please use the following verification code:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; ${new Date().getFullYear()} VideoTube. All rights reserved.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }
};
