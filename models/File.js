const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // ارتباط با بیمار
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true }, // ارتباط با کلینیک

    // فیلدهای اضافه‌شده
    childrenInfo: { type: String, required: true }, // تعداد فرزندان خانواده و جنسیت آنها
    childOrder: { type: Number, required: true }, // کودک چندم خانواده است
    parentsJob: { type: String, required: true }, // شغل والدین
    birthDiseases: { type: String }, // بیماری‌های کودک هنگام تولد
    associatedProblems: { type: String }, // مشکلات همراه کودک
    surgeryHistory: { type: String }, // سابقه جراحی
    medicationHistory: { type: String }, // سابقه مصرف دارویی
    assistiveDevices: { type: String }, // استفاده از وسایل کمکی
    rehabilitationHistory: { type: String }, // تاریخچه خدمات توانبخشی دریافت شده
    initialAssessmentResults: { type: String }, // نتایج ارزیابی اولیه
    treatmentGoals: { type: String }, // اهداف درمانی
});

module.exports = mongoose.model('File', fileSchema);
