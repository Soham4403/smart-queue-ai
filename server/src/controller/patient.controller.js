const Patient = require('../model/patient');


// CREATE PATIENT
const createPatient = async (req, res) => {

    try {

        // logged in user
        const userId = req.user.id;

        const patient = await Patient.create({
            ...req.body,
            userId
        });

        return res.status(201).json({
            message: 'Patient created successfully',
            data: patient,
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
            success: false
        });

    }

};


// GET ALL PATIENTS OF LOGGED IN USER
const getPatients = async (req, res) => {

    try {

        const userId = req.user.id;

        const patients = await Patient.find({ userId });

        return res.status(200).json({
            data: patients,
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
            success: false
        });

    }

};

module.exports = {
    createPatient,
    getPatients
};