const Appointment = require('../model/appoinment');
const Patient = require('../model/patient');
const { getAvailableSlotsData } = require('../service/appointment.service');

// This legacy endpoint now only exists to protect the booking flow.
// Real appointment creation happens after Razorpay verification in /api/v1/payment/verify.
const createAppointment = async (req, res) => {
    return res.status(409).json({
        success: false,
        message: 'Use the payment checkout flow to book an appointment. Appointment creation is only allowed after payment verification.'
    });
};

// GET ALL APPOINTMENTS
const getAppointments = async (req, res) => {
    try {
        const patients = await Patient.find({ userId: req.user.id }).select('_id');
        const patientIds = patients.map((patient) => patient._id);

        const appointments = await Appointment.find({
            patientId: { $in: patientIds }
        })
            .populate('patientId')
            .populate('doctorId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            data: appointments,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
    try {
        const patients = await Patient.find({ userId: req.user.id }).select('_id');
        const patientIds = patients.map((patient) => patient._id);

        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: req.params.id,
                patientId: { $in: patientIds },
                status: 'booked'
            },
            {
                status: 'cancelled'
            },
            {
                returnDocument: 'after'
            }
        );

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found or already closed',
                success: false
            });
        }

        return res.status(200).json({
            message: 'Appointment cancelled successfully',
            data: appointment,
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

// GET AVAILABLE SLOTS
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { appointmentDate } = req.query;

        if (!appointmentDate) {
            return res.status(400).json({
                success: false,
                message: 'appointmentDate is required'
            });
        }

        const { allSlots, bookedSlots, availableSlots } = await getAvailableSlotsData(
            doctorId,
            appointmentDate
        );

        return res.status(200).json({
            success: true,
            data: {
                allSlots,
                bookedSlots,
                availableSlots
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    cancelAppointment,
    getAvailableSlots
};
