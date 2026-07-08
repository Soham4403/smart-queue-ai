const Patient = require('../model/patient');
const Doctor = require('../model/doctor');
const {
    createAppointmentRecord
} = require('../service/appointment.service');
const {
    createRazorpayOrder,
    verifyRazorpaySignature
} = require('../service/ai.service');

const buildOrderNotes = ({ userId, doctorId, patientId, appointmentDate, appointmentTime }) => ({
    userId: String(userId),
    doctorId: String(doctorId),
    patientId: String(patientId),
    appointmentDate,
    appointmentTime
});

const createCheckoutOrder = async (req, res) => {
    try {
        const {
            doctorId,
            patientId,
            appointmentDate,
            appointmentTime
        } = req.body;

        if (!doctorId || !patientId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'doctorId, patientId, appointmentDate, and appointmentTime are required'
            });
        }

        const patient = await Patient.findOne({
            _id: patientId,
            userId: req.user.id
        });

        if (!patient) {
            return res.status(403).json({
                success: false,
                message: 'You can only pay for your own patient profiles'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const amount = Number(doctor.fees || 0) * 100;
        const order = await createRazorpayOrder({
            amount,
            currency: process.env.RAZORPAY_CURRENCY || 'INR',
            receipt: `sq_${Date.now()}`,
            notes: buildOrderNotes({
                userId: req.user.id,
                doctorId,
                patientId,
                appointmentDate,
                appointmentTime
            })
        });

        if (!order || !order.id) {
            return res.status(500).json({
                success: false,
                message: 'Razorpay order could not be created. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend .env file.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                order,
                amount: Number(doctor.fees || 0),
                currency: process.env.RAZORPAY_CURRENCY || 'INR',
                keyId: process.env.RAZORPAY_KEY_ID,
                doctor: {
                    _id: doctor._id,
                    name: doctor.name,
                    specialized: doctor.specialized,
                    fees: doctor.fees,
                    profilePhoto: doctor.profilePhoto || ''
                },
                patient: {
                    _id: patient._id,
                    patientName: patient.patientName
                },
                appointmentDate,
                appointmentTime
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const verifyAndBookAppointment = async (req, res) => {
    try {
        const {
            doctorId,
            patientId,
            appointmentDate,
            appointmentTime,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!doctorId || !patientId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Appointment details are incomplete'
            });
        }

        const validSignature = verifyRazorpaySignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        if (!validSignature) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay signature verification failed'
            });
        }

        const booking = await createAppointmentRecord({
            userId: req.user.id,
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        return res.status(201).json({
            success: true,
            message: 'Appointment booked successfully after payment verification',
            data: {
                appointment: booking.appointment,
                doctor: booking.doctor,
                patient: booking.patient,
                appointmentDate,
                appointmentTime,
                paymentVerified: true,
                paymentAmount: booking.doctor?.fees || 0,
                qrToken: booking.qrToken || booking.appointment?.qrToken || '',
                qrPayload: booking.appointment?.qrPayload || ''
            }
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCheckoutOrder,
    verifyAndBookAppointment
};
