const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const {
    getAdminOverview,
    getAdminDoctors,
    createAdminDoctor,
    updateAdminDoctor,
    deleteAdminDoctor,
    getAdminUsers,
    createAdminUser,
    getAdminPatients,
    createAdminPatient,
    getAdminAppointments,
    cancelAdminAppointment,
    collectAdminPayment,
    getAppointmentByQrToken,
    checkInAppointmentByQrToken
} = require('../controller/admin.controller');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/overview', getAdminOverview);

router.get('/doctors', getAdminDoctors);
router.post('/doctors', createAdminDoctor);
router.put('/doctors/:id', updateAdminDoctor);
router.delete('/doctors/:id', deleteAdminDoctor);

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);

router.get('/patients', getAdminPatients);
router.post('/patients', createAdminPatient);

router.get('/appointments', getAdminAppointments);
router.patch('/appointments/:id/cancel', cancelAdminAppointment);
router.patch('/appointments/:id/payment', collectAdminPayment);
router.get('/qr/:token', getAppointmentByQrToken);
router.patch('/qr/:token/check-in', checkInAppointmentByQrToken);

module.exports = router;
