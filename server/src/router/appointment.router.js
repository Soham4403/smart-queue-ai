const express = require('express');

const router = express.Router();

const {
    createAppointment,
    getAppointments,
    cancelAppointment,
    getAvailableSlots
} = require('../controller/appoinment.controller');

const appointmentValidator = require('../validator/appointment.validator');

const joiValidatorMiddleware = require('../middleware/joiValidator.middleware');

const authMiddleware = require('../middleware/auth.middleware');


// CREATE APPOINTMENT
router.post(
    '/create',
    authMiddleware,
    joiValidatorMiddleware(appointmentValidator),
    createAppointment
);


// GET APPOINTMENTS
router.get(
    '/get',
    authMiddleware,
    getAppointments
);


// CANCEL APPOINTMENT
router.patch(
    '/cancel/:id',
    authMiddleware,
    cancelAppointment
);

router.get(
    '/slots/:doctorId',
    authMiddleware,
    getAvailableSlots
);

module.exports = router;
