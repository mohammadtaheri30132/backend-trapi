const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    desc: { type: String, required: false },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },  // ارتباط با کلینیک
    therapists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' }],  // درمانگرهای مربوط به بیمار
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },  // پرونده بیمار
    birthDate: { type: Date, required: true },  // تاریخ تولد
    gender: { type: String, enum: ['Male', 'Female'], required: true },  // جنسیت: مذکر یا مونث
    initialDiagnosis: { type: String, required: true },  // تشخیص اولیه
    visitDate: { type: Date, required: true },  // تاریخ مراجعه
    address: { type: String, required: true },  // آدرس
    phoneNumber: { type: String, required: true },  // شماره همراه
});

module.exports = mongoose.model('Patient', patientSchema);
