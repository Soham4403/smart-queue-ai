const {
    DISCLAIMER,
    analyzeMessage,
    buildAssistantReply,
    buildSuggestedPrompts,
    bookFromMessage,
    recommendDoctorsForMessage
} = require('../service/ai.service');

const chatAssistant = async (req, res) => {
    try {
        const { message = '', history = [] } = req.body;
        const analysis = analyzeMessage(message);
        const recommended = await recommendDoctorsForMessage(message);
        const reply = await buildAssistantReply({
            message,
            history,
            specialty: analysis.specialty,
            doctors: recommended.doctors,
            appointmentDate: analysis.appointmentDate,
            appointmentTime: analysis.appointmentTime,
            emergency: analysis.emergency,
            emergencyWarning: analysis.emergencyWarning
        });

        return res.status(200).json({
            success: true,
            data: {
                reply,
                disclaimer: DISCLAIMER,
                suggestedPrompts: buildSuggestedPrompts(),
                history,
                analysis: {
                    specialty: analysis.specialty,
                    appointmentDate: analysis.appointmentDate,
                    appointmentTime: analysis.appointmentTime
                },
                doctors: recommended.doctors
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const recommendAssistant = async (req, res) => {
    try {
        const { message = '', symptoms = '' } = req.body;
        const sourceText = message || symptoms;
        const recommendation = await recommendDoctorsForMessage(sourceText);
        const reply = await buildAssistantReply({
            message: sourceText,
            history: [],
            specialty: recommendation.specialty,
            doctors: recommendation.doctors,
            appointmentDate: recommendation.appointmentDate,
            appointmentTime: recommendation.appointmentTime,
            emergency: recommendation.emergency,
            emergencyWarning: recommendation.emergencyWarning
        });

        return res.status(200).json({
            success: true,
            data: {
                reply,
                disclaimer: DISCLAIMER,
                specialty: recommendation.specialty,
                matchedKeyword: recommendation.matchedKeyword,
                analysis: {
                    appointmentDate: recommendation.appointmentDate,
                    appointmentTime: recommendation.appointmentTime
                },
                doctors: recommendation.doctors
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const bookAssistant = async (req, res) => {
    try {
        const {
            message = '',
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;
        const booking = await bookFromMessage({
            userId: req.user.id,
            message,
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        });

        if (!booking.success) {
            return res.status(200).json({
                success: true,
                data: {
                    ...booking,
                    disclaimer: DISCLAIMER
                }
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Appointment booked through SmartQueue AI.',
            data: {
                disclaimer: DISCLAIMER,
                doctor: booking.doctor,
                booking: booking.booking,
                slots: booking.slots,
                analysis: booking.analysis,
                paymentVerified: booking.paymentVerified,
                paymentAmount: booking.paymentAmount,
                appointmentDate: booking.appointmentDate,
                appointmentTime: booking.appointmentTime,
                doctorId: booking.doctorId,
                patientId: booking.patientId,
                paymentCurrency: booking.paymentCurrency,
                razorpayOrder: booking.razorpayOrder || null
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const voiceAssistant = async (req, res) => {
    try {
        const {
            transcript = '',
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;
        const recommendation = await recommendDoctorsForMessage(transcript);
        const shouldBook = /book|appointment|schedule|reserve/i.test(transcript) && req.user?.id;
        const booking = shouldBook
            ? await bookFromMessage({
                userId: req.user.id,
                message: transcript,
                patientId,
                doctorId,
                appointmentDate,
                appointmentTime,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            })
            : {
                success: false,
                needs: 'intent',
                message: 'Voice guidance ready. Say a booking request when you want me to complete the appointment.'
            };

        const reply = await buildAssistantReply({
            message: transcript,
            history: [],
            specialty: recommendation.specialty,
            doctors: recommendation.doctors,
            appointmentDate: recommendation.appointmentDate,
            appointmentTime: recommendation.appointmentTime,
            emergency: recommendation.emergency,
            emergencyWarning: recommendation.emergencyWarning
        });

        return res.status(200).json({
            success: true,
            data: {
                reply,
                disclaimer: DISCLAIMER,
                recommendation,
                booking
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
    chatAssistant,
    recommendAssistant,
    bookAssistant,
    voiceAssistant
};
