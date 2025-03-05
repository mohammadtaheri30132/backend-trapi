const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticate ,clinicOrTherapist} = require('../middlewares/authMiddleware');

// 
router.post('/patients/:patientId/reports', authenticate,clinicOrTherapist, ReportController.createReport);
router.get('/patients/:patientId/reports',  authenticate,clinicOrTherapist, ReportController.getPatientReports);

module.exports = router;
