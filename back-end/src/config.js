import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REQUIRED_ENV = [
    'MONGODB_URI',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

export function validateEnv() {
    const missing = REQUIRED_ENV.filter((k) => !process.env[k]?.trim());
    if (missing.length) {
        console.error(`Missing required env vars: ${missing.join(', ')}`);
        process.exit(1);
    }
}

export const config = {
    port:       parseInt(process.env.PORT || '10000', 10),
    nodeEnv:    process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    dbName:     process.env.DB_NAME || 'youtube',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
};
