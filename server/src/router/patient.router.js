const express = require('express');

const router = express.Router();

const {
    createPatient,
    getPatients
} = require('../controller/patient.controller');

const patientValidator = require('../validator/patient.validator');

const joiValidatorMiddleware = require('../middleware/joiValidator.middleware');

const authMiddleware = require('../middleware/auth.middleware');


// CREATE PATIENT
router.post(
    '/create',
    authMiddleware,
    joiValidatorMiddleware(patientValidator),
    createPatient
);


// GET MY PATIENTS
router.get(
    '/get',
    authMiddleware,
    getPatients
);

module.exports = router;