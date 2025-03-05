const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/clinic/login', AuthController.clinicLogin);
router.post('/therapist/login', AuthController.therapistLogin);

module.exports = router;
