const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const TherapistSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        percentage: { type: Number, required: true },
        phone: { type: String, required: true },
        specialization: { type: String, required: true },
        clinicId: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// هش کردن رمز عبور قبل از ذخیره
TherapistSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Therapist = mongoose.model('Therapist', TherapistSchema);

module.exports = Therapist;
