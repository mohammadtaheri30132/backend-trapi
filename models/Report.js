const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },  // درمانگر ثبت‌کننده
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    reportText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
