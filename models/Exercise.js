const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, default: 0 },
    desc: { type: String, required: true },
    repeat: { type: Number, default: 1 },
    shortDesc: { type: String },
    video: { type: String }, // URL یا مسیر فایل ویدیو
}, {
    timestamps: true, // برای ایجاد فیلدهای createdAt و updatedAt
});

module.exports = mongoose.model('Exercise', exerciseSchema);
