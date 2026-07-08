const Appointment = require('../model/appoinment');
const Patient = require('../model/patient');
const Doctor = require('../model/doctor');
const User = require('../model/user');
const crypto = require('crypto');
const { dispatchAppointmentConfirmedEvent } = require('./appointmentEvents.service');

const DEFAULT_TIME_SLOTS = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM'
];

const getAvailableSlotsData = async (doctorId, appointmentDate) => {
    const bookedAppointments = await Appointment.find({
        doctorId,
        appointmentDate,
        status: 'booked'
    }).select('appointmentTime');

    const bookedSlots = bookedAppointments.map((item) => item.appointmentTime);
    const availableSlots = DEFAULT_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    return {
        allSlots: DEFAULT_TIME_SLOTS,
        bookedSlots,
        availableSlots
    };
};

const createAppointmentRecord = async ({
    userId,
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    paymentStatus = 'paid',
    razorpayOrderId = '',
    razorpayPaymentId = '',
    razorpaySignature = '',
    paymentMethod = 'razorpay'
}) => {
    const patient = await Patient.findOne({
        _id: patientId,
        userId
    });

    if (!patient) {
        const error = new Error('You can only book appointments for your own patients');
        error.statusCode = 403;
        throw error;
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        const error = new Error('Doctor not found');
        error.statusCode = 404;
        throw error;
    }

    const user = await User.findById(userId);
    const qrToken = crypto.randomUUID();

    const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate,
        appointmentTime,
        status: 'booked'
    });

    if (existingAppointment) {
        const error = new Error('Slot already booked');
        error.statusCode = 400;
        throw error;
    }

    const appointment = await Appointment.create({
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        paymentStatus,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod,
        qrToken,
        qrPayload: JSON.stringify({
            type: 'smartqueue-appointment',
            qrToken,
            patientId: String(patientId),
            doctorId: String(doctorId),
            appointmentDate,
            appointmentTime
        }),
        checkInStatus: 'pending',
        checkedInAt: null
    });

    const eventDispatched = await dispatchAppointmentConfirmedEvent({
        patient,
        doctor,
        user,
        appointment,
        qrToken
    });

    return {
        patient,
        doctor,
        user,
        appointment,
        qrToken,
        eventDispatched
    };
};

module.exports = {
    DEFAULT_TIME_SLOTS,
    getAvailableSlotsData,
    createAppointmentRecord
};
