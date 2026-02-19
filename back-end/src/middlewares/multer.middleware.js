import multer from 'multer';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(process.cwd(), 'public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
});

// MIME types we accept
const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/mkv', 'video/quicktime', 'video/x-matroska', 'video/webm',
    'application/octet-stream' // many clients send this for video/unknown type
];

// When client sends application/octet-stream, allow only if extension is safe
const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.webp',
    '.mp4', '.mov', '.mkv', '.webm'
];

function isAllowedByExtension(filename) {
    const ext = path.extname(filename || '').toLowerCase();
    return allowedExtensions.includes(ext);
}

export const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB for videos
    },
    fileFilter: (req, file, cb) => {
        if (allowedMimes.includes(file.mimetype)) {
            // If client sent generic type, still validate by extension
            if (file.mimetype === 'application/octet-stream' && !isAllowedByExtension(file.originalname)) {
                cb(new Error('Only image and video files are allowed!'), false);
                return;
            }
            cb(null, true);
            return;
        }
        cb(new Error('Only image and video files are allowed!'), false);
    }
});
