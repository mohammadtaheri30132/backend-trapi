const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تعیین مسیر ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = path.extname(file.originalname); // استخراج پسوند فایل
        cb(null, `${uniqueSuffix}${extname}`); // استفاده از پسوند فایل
    }
});

const upload = multer({ storage });

module.exports = upload;
