const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },

    appointmentDate: {
        type: String,
        required: true
    },

    appointmentTime: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },

    razorpayOrderId: {
        type: String,
        default: ''
    },

    razorpayPaymentId: {
        type: String,
        default: ''
    },

    razorpaySignature: {
        type: String,
        default: ''
    },

    paymentMethod: {
        type: String,
        default: 'razorpay'
    },

    qrToken: {
        type: String,
        default: '',
        index: true
    },

    qrPayload: {
        type: String,
        default: ''
    },

    checkInStatus: {
        type: String,
        enum: ['pending', 'checked_in'],
        default: 'pending'
    },

    checkedInAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
