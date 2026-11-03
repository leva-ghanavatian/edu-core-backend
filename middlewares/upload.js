const path = require('path');
const createUploader = require('../helpers/createUploader');

const publicDir = path.join(__dirname, '..', 'public');

const imageTypes = Object.freeze({
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
});

const courseCoverUpload = createUploader({
    destination: path.join(publicDir, 'courses', 'covers'),
    allowedTypes: imageTypes,
    maxSizeMB: 5,
});

const userAvatarUpload = createUploader({
    destination: path.join(publicDir, 'users', 'avatars'),
    allowedTypes: imageTypes,
    maxSizeMB: 2,
    // deterministic name → a new avatar overwrites the old one
    filename: (req, file, cb) => {
        cb(null, `user-${req.user.id}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const courseVideoUpload = createUploader({
    destination: path.join(publicDir, 'courses', 'videos'),
    allowedTypes: { '.mp4': 'video/mp4', '.webm': 'video/webm' },
    maxSizeMB: 500,
});

module.exports = { courseCoverUpload, userAvatarUpload, courseVideoUpload };