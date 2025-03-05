const jwt = require('jsonwebtoken');

// Middleware برای بررسی احراز هویت
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'lmfwwqionwoubou33u');
        req.user = decoded; // اطلاعات کاربر را به درخواست اضافه می‌کنیم
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware برای بررسی دسترسی کلینیک
const clinicOnly = (req, res, next) => {
    if (req.user.role !== 'clinic') {
        return res.status(403).json({ message: 'Access denied. Clinic only.' });
    }
    next();
};

// Middleware برای بررسی دسترسی کلینیک یا درمانگر
const clinicOrTherapist = (req, res, next) => {
    if (req.user.role !== 'clinic' && req.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Access denied. Clinic or Therapist only.' });
    }
    next();
};

module.exports = {
    authenticate,
    clinicOnly,
    clinicOrTherapist
};
