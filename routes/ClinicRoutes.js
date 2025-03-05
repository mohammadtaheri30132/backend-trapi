const express = require('express');
const { authenticate,clinicOnly } = require('./../middlewares/authMiddleware');
const { createClinic, getClinicDetails,getYearlyIncomeReport,getClinicIncomeReport } = require('./../controllers/ClinicController');

const router = express.Router();

router.post('/clinic', createClinic);
router.get('/clinic/report/income/:clinicId', authenticate,clinicOnly,getYearlyIncomeReport);
router.get('/clinic/report/by-date/:clinicId', authenticate,clinicOnly,getClinicIncomeReport);
router.get('/clinic', authenticate,clinicOnly, getClinicDetails);

module.exports = router;
