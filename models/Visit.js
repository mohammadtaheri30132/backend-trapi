const mongoose = require('mongoose');

// مدل ویزیت
const visitSchema = new mongoose.Schema(
    {
        clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true }, // کلینیک
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true }, // دکتر
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // بیمار
        visitDate: { type: Date, required: true },
        percentage: { type: Number, required: true },
        startTime: { type: String, required: true }, 
        endTime: { type: String, required: true },
        fee: { type: Number, required: true }, 
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid'],
            required: true,
        },
        attendanceStatus: {
            type: String,
            enum: ['Present', 'Absent'], 
            required: true,
        },
    },
    { timestamps: true }
);

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
