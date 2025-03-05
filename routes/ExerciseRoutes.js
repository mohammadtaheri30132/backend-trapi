const express = require('express');
const multer = require('multer');
const { createExercise,getExercises ,getExerciseById,deleteExerciseById} = require('../controllers/exerciseController');
const {extname} = require("path");

const router = express.Router();

// تنظیم Multer برای آپلود فایل
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + extname(file.originalname));
    },
});

const upload = multer({ storage });

// مسیر POST برای ایجاد تمرین
router.post('/exercises', upload.single('video'), createExercise);
router.get('/exercises',getExercises);
router.get('/exercises/:id', getExerciseById);
router.delete('/exercises/:id', deleteExerciseById);

module.exports = router;
