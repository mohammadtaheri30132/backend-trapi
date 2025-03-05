const express = require('express');
const {
    createTherapist,
    getTherapistsByClinic,
    updateTherapist,
    getDetailTherapistsByClinic,
    deleteTherapist,
    getPatientsByTherapistId
} = require('../controllers/TherapistController');
const {therapistLogin} =require('./../controllers/AuthController')
const {authenticate, clinicOnly,clinicOrTherapist} = require("../middlewares/authMiddleware");

const router = express.Router();

// مسیر برای ساخت تراپیست (با نام کاربری و رمز عبور)
router.post('/therapist',authenticate,clinicOnly, createTherapist);
router.post('/therapist/login', therapistLogin);

// سایر مسیرها بدون تغییر
router.get('/therapists/:id',authenticate,clinicOnly, getTherapistsByClinic);
router.get('/therapist/:id',authenticate,clinicOnly, getDetailTherapistsByClinic);
router.get('/therapists/:therapistId/patients',authenticate,clinicOrTherapist, getPatientsByTherapistId);
router.put('/edit/:therapistId',authenticate,clinicOnly, updateTherapist);
router.delete('/therapists/delete/:therapistId',authenticate,clinicOnly, deleteTherapist);

module.exports = router;
