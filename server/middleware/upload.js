const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const ATTENDANCE_DIR = path.join(UPLOAD_DIR, 'attendance');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');

[UPLOAD_DIR, ATTENDANCE_DIR, AVATAR_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration for attendance selfies
const attendanceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const monthDir = path.join(ATTENDANCE_DIR, String(year), month);

        if (!fs.existsSync(monthDir)) {
            fs.mkdirSync(monthDir, { recursive: true });
        }

        cb(null, monthDir);
    },
    filename: (req, file, cb) => {
        const employeeId = req.body.employeeId || 'unknown';
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const type = req.body.type || 'checkin'; // checkin or checkout
        const timestamp = Date.now();

        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${employeeId}_${dateStr}_${type}_${timestamp}${ext}`;

        cb(null, filename);
    }
});

// Storage configuration for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
        const employeeId = req.params.id || req.body.employeeId;
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${employeeId}${ext}`);
    }
});

// File filter - only images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('ອັບໂຫຼດໄດ້ສະເພາະຮູບພາບເທົ່ານັ້ນ (JPG, PNG, WEBP)'));
    }
};

// Limits
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
};

// Upload middlewares
const uploadAttendancePhoto = multer({
    storage: attendanceStorage,
    fileFilter: imageFilter,
    limits
}).single('photo');

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits
}).single('avatar');

// Helper function to delete old files
function cleanupOldFiles(olderThanMonths = 12) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - olderThanMonths);

    // TODO: Implement cleanup logic
    // Traverse attendance folders and delete files older than cutoffDate
}

module.exports = {
    uploadAttendancePhoto,
    uploadAvatar,
    cleanupOldFiles,
    UPLOAD_DIR,
    ATTENDANCE_DIR,
    AVATAR_DIR
};
