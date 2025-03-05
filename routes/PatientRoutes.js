const express = require('express');
const router = express.Router();
const { authenticate, clinicOnly } = require('../middlewares/authMiddleware');
const { createPatient, getPatients,addTherapistToPatient,updatePatient, upsertFile, getFileByPatient,getPatient } = require('../controllers/PatientController');

router.post('/patient', authenticate, clinicOnly, createPatient);
router.get('/patients/:id', authenticate, clinicOnly, getPatients);
router.get('/patient/:id', authenticate, clinicOnly, getPatient);
router.get('/therapist-to-patients', authenticate, clinicOnly, addTherapistToPatient);
router.put('/patients/:id', authenticate, clinicOnly, updatePatient);
router.post('/patients/file', authenticate, clinicOnly, upsertFile);
router.get('/patients/file/:patient', authenticate, clinicOnly, getFileByPatient);

module.exports = router;
