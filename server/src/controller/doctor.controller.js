const Doctor = require('../model/doctor');


// CREATE DOCTOR
const createDoctor = async (req, res) => {

    try {

        const isDataAdded = await Doctor.create(req.body);

        if (!isDataAdded) {

            return res.status(400).json({
                message: 'Data Add Failed',
                error: null,
                success: false
            });

        }

        return res.status(201).json({
            message: 'Data Added Successfully',
            error: null,
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


// GET DOCTORS
const getDoctors = async (req, res) => {

    try {

        const {
            search,
            specialized,
            is_available,
            minFees,
            maxFees
        } = req.query;

        let filter = {};

        if (search) {

            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialized: { $regex: search, $options: 'i' } },
                { qualification: { $regex: search, $options: 'i' } }
            ];

        }

        if (specialized) {

            filter.specialized = { $regex: specialized, $options: 'i' };

        }

        if (is_available !== undefined) {

            filter.is_available = is_available === 'true';

        }

        if (minFees || maxFees) {

            filter.fees = {};

            if (minFees) {
                filter.fees.$gte = Number(minFees);
            }

            if (maxFees) {
                filter.fees.$lte = Number(maxFees);
            }

        }

        const doctors = await Doctor.find(filter);

        return res.status(200).json({

            message: 'Doctors fetched successfully',

            data: doctors,

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


// UPDATE DOCTOR
const updateDoctor = async (req, res) => {

    try {

        const { id } = req.params;

        const updatedDoctor = await Doctor.findByIdAndUpdate(

            id,

            req.body,

            {
                returnDocument: 'after'
            }

        );

        if (!updatedDoctor) {

            return res.status(404).json({

                message: "Doctor not found",

                success: false

            });

        }

        return res.status(200).json({

            message: "Doctor updated successfully",

            data: updatedDoctor,

            success: true

        });

    } catch (error) {

        return res.status(500).json({

            message: "Internal Server Error",

            error: error.message,

            success: false

        });

    }

};


// DELETE DOCTOR
const deleteDoctor = async (req, res) => {

    try {

        const { id } = req.params;

        const deletedDoctor = await Doctor.findByIdAndDelete(id);

        if (!deletedDoctor) {

            return res.status(404).json({

                message: "Doctor not found",

                success: false

            });

        }

        return res.status(200).json({

            message: "Doctor deleted successfully",

            success: true

        });

    } catch (error) {

        return res.status(500).json({

            message: "Internal Server Error",

            error: error.message,

            success: false

        });

    }

};


// UPDATE DOCTOR PROFILE PHOTO
const updateDoctorPhoto = async (req, res) => {

    try {

        const doctorId = req.params.id;

        const profilePhoto = req.file
            ? req.file.path
            : "";

        const updatedDoctor = await Doctor.findByIdAndUpdate(

            doctorId,

            {
                profilePhoto
            },

            {
                returnDocument: 'after'
            }

        );

        if (!updatedDoctor) {

            return res.status(404).json({

                message: "Doctor not found",

                success: false

            });

        }

        return res.status(200).json({

            message: "Doctor photo updated successfully",

            data: updatedDoctor,

            success: true

        });

    } catch (error) {

        return res.status(500).json({

            message: "Internal Server Error",

            error: error.message,

            success: false

        });

    }

};


module.exports = {
    createDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor,
    updateDoctorPhoto
};
