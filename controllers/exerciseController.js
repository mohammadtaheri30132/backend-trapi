const Exercise = require('../models/Exercise');
const path = require('path');
const fs = require('fs');

const createExercise = async (req, res) => {
    try {
        const { title, duration, desc, repeat, shortDesc } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'فیلد عنوان اجباری می باشد' });
        }

        let videoPath = '';
        if (req.file) {
            videoPath = req.file.path;
        }

        const exercise = new Exercise({
            title,
            duration: duration ? parseInt(duration, 10) : 0,
            desc,
            repeat: repeat ? parseInt(repeat, 10) : 1,
            shortDesc,
            video: videoPath,
        });

        await exercise.save();

        res.status(201).json({ message: 'تمرین با موفقیت ایجاد شد', exercise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطا در سرور' });
    }
};

const getExercises = async (req, res) => {
    try {
        // دریافت تمامی تمرین‌ها
        const exercises = await Exercise.find().sort({ createdAt: -1 }); // مرتب‌سازی نزولی بر اساس تاریخ ایجاد

        // تعداد کل تمرین‌ها
        const totalExercises = await Exercise.countDocuments();

        res.status(200).json({
            exercises,
            totalExercises,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطا در دریافت تمرین‌ها' });
    }
};

const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params; // دریافت شناسه از پارامترهای مسیر

        // جستجوی تمرین بر اساس شناسه
        const exercise = await Exercise.findById(id);

        if (!exercise) {
            return res.status(404).json({ error: 'تمرین مورد نظر یافت نشد' });
        }

        res.status(200).json(exercise);
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ error: 'خطا در دریافت جزئیات تمرین' });
    }
};
const deleteExerciseById = async (req, res) => {
    try {
        const { id } = req.params; // دریافت شناسه از پارامترهای مسیر

        // جستجو و حذف تمرین
        const deletedExercise = await Exercise.findByIdAndDelete(id);

        if (!deletedExercise) {
            return res.status(404).json({ error: 'تمرین مورد نظر یافت نشد' });
        }

        res.status(200).json({ message: 'تمرین با موفقیت حذف شد' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'خطا در حذف تمرین' });
    }
};

module.exports = { deleteExerciseById };
module.exports = { createExercise,getExercises,getExerciseById,deleteExerciseById };
