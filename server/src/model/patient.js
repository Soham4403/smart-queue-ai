const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({

    // account holder
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // actual patient
    patientName: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },

    disease: {
        type: String,
        default: ''
    },

    medicalHistory: {
        type: String,
        default: ''
    },

    relation: {
        type: String,
        enum: [
            'self',
            'mother',
            'father',
            'child',
            'grandmother',
            'grandfather',
            'other'
        ],
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);