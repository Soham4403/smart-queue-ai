const express = require('express');
const router = express.Router();

const { createDoctor, getDoctors, updateDoctor, deleteDoctor, updateDoctorPhoto } = require('../controller/doctor.controller');
const doctorValidator = require('../validator/doctor.validator');
const joivalidatormiddleware = require('../middleware/joiValidator.middleware');
const { upload } = require('../config/multerConfig');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.post('/create', authMiddleware, adminMiddleware, joivalidatormiddleware(doctorValidator), createDoctor);
router.get('/get', getDoctors);
router.put('/update/:id', authMiddleware, adminMiddleware, joivalidatormiddleware(doctorValidator), updateDoctor);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deleteDoctor);
router.patch(
    '/upload-photo/:id',
    authMiddleware,
    adminMiddleware,
    upload.single('profilePhoto'),
    updateDoctorPhoto
);


module.exports = router;
