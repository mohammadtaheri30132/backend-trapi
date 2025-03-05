const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const Therapist = require('../models/Therapist');

// توکن JWT را تولید می‌کند
const generateToken = (user, role) => {
    return jwt.sign(
        { id: user._id, role },
        'lmfwwqionwoubou33u',
        { expiresIn: '7d' }
    );
};

// ورود مدیر کلینیک
const clinicLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // یافتن کلینیک بر اساس نام کاربری
        const clinic = await Clinic.findOne({ username });
        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        // بررسی رمز عبور
        const isPasswordValid = await bcrypt.compare(password, clinic.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // تولید توکن
        const token = generateToken(clinic, 'clinic');
        return res.json({
            token,
            clinic: {
                id: clinic._id,
                name: clinic.name,
                clinicName: clinic.clinicName,
                family: clinic.family,
                username: clinic.username,
                address: clinic.address
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error', error });
    }
};

// ورود درمانگر
const therapistLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // یافتن درمانگر بر اساس نام کاربری
        const therapist = await Therapist.findOne({ username });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        // بررسی رمز عبور
        const isPasswordValid = await bcrypt.compare(password, therapist.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // تولید توکن
        const token = generateToken(therapist, 'therapist');
        return res.json({
            token,
            therapist: {
                id: therapist._id,
                name: therapist.name,
                username: therapist.username,
                clinicId: therapist.clinicId
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    clinicLogin,
    therapistLogin
};
