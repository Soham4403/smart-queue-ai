const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Doctor = require('../model/doctor');
const Patient = require('../model/patient');
const Appointment = require('../model/appoinment');

const getAdminOverview = async (req, res) => {
    try {
        const [users, doctors, patients, appointments] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Doctor.countDocuments(),
            Patient.countDocuments(),
            Appointment.find()
                .populate('doctorId', 'fees name')
                .populate('patientId', 'patientName')
                .sort({ createdAt: -1 })
        ]);

        const totalRevenue = appointments.reduce((sum, appointment) => {
            if (appointment.paymentStatus === 'paid') {
                return sum + (appointment.doctorId?.fees || 0);
            }

            return sum;
        }, 0);

        const pendingRevenue = appointments.reduce((sum, appointment) => {
            if (appointment.paymentStatus === 'pending' && appointment.status === 'booked') {
                return sum + (appointment.doctorId?.fees || 0);
            }

            return sum;
        }, 0);

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    users,
                    doctors,
                    patients,
                    appointments: appointments.length,
                    totalRevenue,
                    pendingRevenue
                },
                recentAppointments: appointments.slice(0, 8)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdminDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createAdminDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateAdminDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after' }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteAdminDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createAdminUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            contact,
            age,
            gender,
            role
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            contact,
            age,
            gender,
            role: role === 'admin' ? 'admin' : 'user'
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                contact: user.contact,
                age: user.age,
                gender: user.gender,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdminPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: patients
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createAdminPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Patient added successfully',
            data: patient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdminAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'patientName relation')
            .populate('doctorId', 'name specialized fees')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const cancelAdminAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { returnDocument: 'after' }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const collectAdminPayment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: 'paid' },
            { returnDocument: 'after' }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Payment marked as collected',
            data: appointment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAppointmentByQrToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'QR token is required'
            });
        }

        const appointment = await Appointment.findOne({ qrToken: token })
            .populate('patientId', 'patientName age gender relation')
            .populate('doctorId', 'name specialized fees profilePhoto');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found for this QR code'
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const checkInAppointmentByQrToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'QR token is required'
            });
        }

        const appointment = await Appointment.findOne({ qrToken: token });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found for this QR code'
            });
        }

        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This appointment is not payment verified yet'
            });
        }

        if (appointment.checkInStatus === 'checked_in') {
            return res.status(409).json({
                success: false,
                message: 'This appointment is already checked in'
            });
        }

        appointment.checkInStatus = 'checked_in';
        appointment.checkedInAt = new Date();
        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate('patientId', 'patientName age gender relation')
            .populate('doctorId', 'name specialized fees profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Appointment checked in successfully',
            data: populated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
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
};
