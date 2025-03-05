const express = require('express');
const router = express.Router();
const {authenticate, clinicOnly} = require("../middlewares/authMiddleware");
const {
    createVisit,
    getClinicVisitsByDate,
    // getVisitsByDate,
    updateVisit,deleteVisit
} = require('../controllers/VisitController');


// ایجاد ویزیت جدید
router.post('/visit', authenticate, clinicOnly, createVisit);

// // دریافت لیست ویزیت‌های یک روز مشخص برای یک کلینیک
router.get('/visits/:clinicId/date/:date', authenticate, clinicOnly, getClinicVisitsByDate);

// // ویرایش ویزیت
router.put('/visit/:id', authenticate, clinicOnly, updateVisit);

// // حذف ویزیت
router.delete('/visit/:id', authenticate, clinicOnly, deleteVisit);

// // دریافت گزارش کلینیک بر اساس بازه زمانی
router.post('/report', authenticate, clinicOnly, getClinicVisitsByDate);

module.exports = router;
