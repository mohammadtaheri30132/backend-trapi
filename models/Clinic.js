const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clinicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    family: { type: String, required: true },
    clinicName: { type: String, required: true },
    address: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// هش کردن رمز عبور قبل از ذخیره
clinicSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Clinic', clinicSchema);
