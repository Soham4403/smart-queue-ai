const crypto = require('crypto');
const Doctor = require('../model/doctor');
const Patient = require('../model/patient');
const { createAppointmentRecord, getAvailableSlotsData } = require('./appointment.service');

const SPECIALTY_RULES = [
    {
        specialty: 'Cardiologist',
        keywords: ['chest pain', 'heart', 'palpitation', 'bp', 'blood pressure', 'shortness of breath']
    },
    {
        specialty: 'Neurologist',
        keywords: ['headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'stroke', 'loss of consciousness']
    },
    {
        specialty: 'Orthopedic',
        keywords: ['bone', 'joint', 'fracture', 'back pain', 'knee pain', 'sprain', 'orthopedic']
    },
    {
        specialty: 'Gynecologist',
        keywords: ['pregnancy', 'period', 'menstrual', 'pcos', 'gynecology', 'woman health']
    },
    {
        specialty: 'Pediatrician',
        keywords: ['child', 'baby', 'infant', 'fever in child', 'pediatric']
    },
    {
        specialty: 'Dermatologist',
        keywords: ['skin', 'rash', 'acne', 'itching', 'allergy', 'dermatology']
    },
    {
        specialty: 'Dentist',
        keywords: ['tooth', 'teeth', 'gum', 'dental', 'mouth pain']
    }
];

const EMERGENCY_RULES = [
    ['chest pain', 'Chest pain can be serious and may need immediate medical attention.'],
    ['shortness of breath', 'Severe breathing difficulty may need emergency attention now.'],
    ['loss of consciousness', 'Loss of consciousness is an emergency.'],
    ['stroke', 'Stroke-like symptoms need urgent emergency care.'],
    ['face droop', 'Stroke-like symptoms need urgent emergency care.'],
    ['trouble speaking', 'Stroke-like symptoms need urgent emergency care.'],
    ['severe bleeding', 'Severe bleeding may need emergency attention now.']
];

const DISCLAIMER =
    'Medical note: I can help you find specialists and book care, but I do not diagnose conditions or prescribe medication.';

const normalizeText = (value = '') => value.toLowerCase().trim();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stripMarkdownFences = (value = '') => value
    .replace(/^```json/i, '```')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

const safeJsonParse = (value) => {
    if (!value) return null;

    const trimmed = stripMarkdownFences(String(value));
    try {
        return JSON.parse(trimmed);
    } catch {
        const first = trimmed.indexOf('{');
        const last = trimmed.lastIndexOf('}');
        if (first >= 0 && last > first) {
            try {
                return JSON.parse(trimmed.slice(first, last + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
};

const detectSpecialty = (message = '') => {
    const text = normalizeText(message);

    for (const rule of SPECIALTY_RULES) {
        const match = rule.keywords.find((keyword) => text.includes(keyword));
        if (match) {
            return {
                specialty: rule.specialty,
                matchedKeyword: match
            };
        }
    }

    return {
        specialty: null,
        matchedKeyword: null
    };
};

const detectEmergency = (message = '') => {
    const text = normalizeText(message);
    const matched = EMERGENCY_RULES.find(([keyword]) => text.includes(keyword));

    return matched
        ? {
            emergency: true,
            warning: matched[1],
            matchedKeyword: matched[0]
        }
        : {
            emergency: false,
            warning: null,
            matchedKeyword: null
        };
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const nextWeekday = (weekdayIndex) => {
    const now = new Date();
    const current = now.getDay();
    const delta = (weekdayIndex + 7 - current) % 7 || 7;
    const result = new Date(now);
    result.setDate(now.getDate() + delta);
    return formatDate(result);
};

const extractDate = (message = '') => {
    const text = normalizeText(message);
    const today = formatDate(new Date());

    if (text.includes('day after tomorrow')) {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return formatDate(date);
    }

    if (text.includes('tomorrow')) {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return formatDate(date);
    }

    if (text.includes('today')) {
        return today;
    }

    const weekdays = [
        ['sunday', 0],
        ['monday', 1],
        ['tuesday', 2],
        ['wednesday', 3],
        ['thursday', 4],
        ['friday', 5],
        ['saturday', 6]
    ];

    for (const [dayName, index] of weekdays) {
        if (text.includes(dayName)) {
            return nextWeekday(index);
        }
    }

    const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dateMatch) {
        return dateMatch[1];
    }

    return null;
};

const formatTime = (hours, minutes = '00', suffix = 'AM') => {
    const normalizedHours = String(hours).padStart(2, '0');
    const normalizedMinutes = String(minutes).padStart(2, '0');
    return `${normalizedHours}:${normalizedMinutes} ${suffix}`;
};

const extractTime = (message = '') => {
    const text = normalizeText(message);

    if (text.includes('morning')) {
        return '09:00 AM';
    }

    if (text.includes('afternoon')) {
        return '02:00 PM';
    }

    if (text.includes('evening') || text.includes('night')) {
        return '06:00 PM';
    }

    const afterMatch = text.match(/after\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (afterMatch) {
        const hour = Number(afterMatch[1]);
        const minute = afterMatch[2] || '00';
        const suffix = (afterMatch[3] || (hour < 12 ? 'PM' : 'AM')).toUpperCase();
        return formatTime(hour, minute, suffix);
    }

    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (timeMatch) {
        return formatTime(timeMatch[1], timeMatch[2] || '00', timeMatch[3].toUpperCase());
    }

    return null;
};

const searchDoctors = async ({ specialty, query, limit = 6 }) => {
    const filters = [];

    if (specialty) {
        filters.push(
            { specialized: new RegExp(escapeRegex(specialty), 'i') },
            { name: new RegExp(escapeRegex(specialty), 'i') }
        );
    }

    if (query) {
        filters.push(
            { specialized: new RegExp(escapeRegex(query), 'i') },
            { name: new RegExp(escapeRegex(query), 'i') }
        );
    }

    const queryBuilder = filters.length ? { $or: filters } : {};

    return Doctor.find(queryBuilder)
        .sort({ is_available: -1, experience: -1, createdAt: -1 })
        .limit(limit);
};

const buildPromptReply = ({
    specialty,
    emergency,
    emergencyWarning,
    doctors,
    appointmentDate,
    appointmentTime,
    paymentRequired,
    paymentAmount
}) => {
    const lines = [];

    if (emergency && emergencyWarning) {
        lines.push(`**Urgent:** ${emergencyWarning}`);
        lines.push('If the symptoms are severe or worsening, call emergency services or go to the nearest emergency department now.');
    }

    if (specialty) {
        lines.push(`The closest specialist I found is **${specialty}**.`);
    } else {
        lines.push('I can help you choose the right specialist if you share a symptom or body area.');
    }

    if (appointmentDate || appointmentTime) {
        lines.push(
            `I understood your schedule as ${appointmentDate || 'a selected date'}${
                appointmentTime ? ` at ${appointmentTime}` : ''
            }.`
        );
    }

    if (doctors?.length) {
        lines.push('Here are a few doctors from the clinic database:');
        doctors.slice(0, 4).forEach((doctor) => {
            lines.push(`- ${doctor.name} (${doctor.specialized || 'General'})`);
        });
    }

    if (paymentRequired) {
        lines.push(`A payment of Rs. ${paymentAmount} is required to confirm the booking.`);
    }

    lines.push('Tell me your symptom, preferred date, and time, and I will guide the next step.');

    return lines.join('\n');
};

const buildSuggestedPrompts = () => ([
    'I have chest pain',
    'Book tomorrow after 6 PM',
    'Find a dermatologist',
    'Show available cardiologists'
]);

const callGemini = async ({ systemPrompt, userMessage }) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        return null;
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${systemPrompt}\n\nUser request:\n${userMessage}\n\nReturn only valid JSON with keys: reply, specialty, emergency, emergencyWarning, bookingIntent, missingFields, appointmentDate, appointmentTime, doctorQuery, paymentRequired, paymentAmount, paymentHint.`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.25,
                responseMimeType: 'application/json'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gemini request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    return safeJsonParse(text);
};

const buildAssistantReply = async ({
    message,
    history = [],
    specialty,
    doctors,
    appointmentDate,
    appointmentTime,
    emergency,
    emergencyWarning,
    paymentRequired = false,
    paymentAmount = 0
}) => {
    const systemPrompt = `
You are SmartQueue AI, a healthcare appointment assistant.
Help users find specialists, search doctors, understand symptoms, and book appointments.
Always respond like a calm, professional clinic receptionist.
Never diagnose diseases, never prescribe medication, and never sound uncertain if the intent is clear.
Keep replies concise, warm, and actionable.
If the user describes severe symptoms, clearly flag an emergency and tell them to seek immediate care.
If a booking is incomplete, ask only for the single most important missing detail.
If payment is required, mention that booking will be confirmed only after payment verification.
If a doctor list is provided, recommend from that list first.
If the user asks to book, help them move toward checkout rather than giving generic advice.
`;

    try {
        const aiReply = await callGemini({
            systemPrompt,
            userMessage: JSON.stringify({
                message,
                history: history.slice(-8),
                specialty,
                doctors: doctors?.map((doctor) => ({
                    id: doctor._id,
                    name: doctor.name,
                    specialized: doctor.specialized,
                    fees: doctor.fees,
                    experience: doctor.experience,
                    is_available: doctor.is_available
                })),
                appointmentDate,
                appointmentTime,
                emergency,
                emergencyWarning,
                paymentRequired,
                paymentAmount,
                disclaimer: DISCLAIMER
            })
        });

        if (aiReply?.reply) {
            return `${aiReply.reply}\n\n${DISCLAIMER}`;
        }
        if (aiReply?.emergencyWarning && !aiReply.reply) {
            return `${aiReply.emergencyWarning}\n\n${DISCLAIMER}`;
        }
    } catch (error) {
        console.error('Gemini error:', error);
    }

    return buildPromptReply({
        specialty,
        emergency,
        emergencyWarning,
        doctors,
        appointmentDate,
        appointmentTime,
        paymentRequired,
        paymentAmount
    });
};

const analyzeMessage = (message = '') => {
    const specialtyMatch = detectSpecialty(message);
    const emergencyMatch = detectEmergency(message);
    const appointmentDate = extractDate(message);
    const appointmentTime = extractTime(message);

    return {
        specialty: specialtyMatch.specialty,
        matchedKeyword: specialtyMatch.matchedKeyword,
        emergency: emergencyMatch.emergency,
        emergencyWarning: emergencyMatch.warning,
        emergencyMatchedKeyword: emergencyMatch.matchedKeyword,
        appointmentDate,
        appointmentTime
    };
};

const recommendDoctorsForMessage = async (message = '') => {
    const analysis = analyzeMessage(message);
    const doctors = await searchDoctors({
        specialty: analysis.specialty,
        query: message
    });

    return {
        ...analysis,
        doctors
    };
};

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return null;
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
        },
        body: JSON.stringify({
            amount,
            currency,
            receipt,
            notes
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Razorpay order creation failed');
    }

    return response.json();
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !keySecret) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    return expectedSignature === razorpaySignature;
};

const bookFromMessage = async ({
    userId,
    message,
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) => {
    if (!userId) {
        return {
            success: false,
            needs: 'auth',
            message: 'Please login first so I can protect the booking and use your patient profiles.'
        };
    }

    const analysis = analyzeMessage(message || '');
    const candidateDoctors = doctorId
        ? await Doctor.find({ _id: doctorId })
        : await searchDoctors({
            specialty: analysis.specialty,
            query: message,
            limit: 1
        });

    const resolvedDoctor = candidateDoctors[0] || null;

    let resolvedPatientId = patientId;
    if (!resolvedPatientId) {
        const patient = await Patient.findOne({ userId }).sort({ createdAt: 1 });
        resolvedPatientId = patient?._id;
    }

    const resolvedDate = appointmentDate || analysis.appointmentDate;
    const resolvedTime = appointmentTime || analysis.appointmentTime;

    if (!resolvedDoctor) {
        return {
            success: false,
            needs: 'doctor',
            message: 'I could not find a matching doctor yet. Try telling me the specialty or doctor name.',
            analysis
        };
    }

    if (!resolvedPatientId) {
        return {
            success: false,
            needs: 'patient',
            message: 'Please create at least one patient profile before booking.',
            analysis,
            doctor: resolvedDoctor
        };
    }

    if (!resolvedDate || !resolvedTime) {
        const slots = await getAvailableSlotsData(resolvedDoctor._id, resolvedDate || formatDate(new Date()));
        return {
            success: false,
            needs: 'schedule',
            message: 'I need both a date and a time before I can finalize the booking.',
            analysis,
            doctor: resolvedDoctor,
            patientId: resolvedPatientId,
            slots
        };
    }

    const slotData = await getAvailableSlotsData(resolvedDoctor._id, resolvedDate);
    if (!slotData.availableSlots.includes(resolvedTime)) {
        return {
            success: false,
            needs: 'time',
            message: 'That time is already taken or not available. Choose one from the live slots list.',
            analysis,
            doctor: resolvedDoctor,
            patientId: resolvedPatientId,
            slots: slotData
        };
    }

    const paymentAmount = Number(resolvedDoctor.fees || 0) * 100;
    const paymentConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        if (!paymentConfigured) {
            return {
                success: false,
                needs: 'payment_config',
                message: 'Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payment-gated booking.',
                analysis,
                doctor: resolvedDoctor,
                patientId: resolvedPatientId,
                paymentRequired: true,
                paymentAmount: resolvedDoctor.fees || 0
            };
        }

        const order = await createRazorpayOrder({
            amount: paymentAmount,
            currency: process.env.RAZORPAY_CURRENCY || 'INR',
            receipt: `sq_${Date.now()}`,
            notes: {
                userId: String(userId),
                doctorId: String(resolvedDoctor._id),
                patientId: String(resolvedPatientId),
                appointmentDate: resolvedDate,
                appointmentTime: resolvedTime
            }
        });

        return {
            success: false,
            needs: 'payment',
            message: `A payment of Rs. ${resolvedDoctor.fees || 0} is required to confirm this appointment. Complete the Razorpay payment, then send the payment confirmation back to finalize the booking.`,
            analysis,
            doctor: resolvedDoctor,
            patientId: resolvedPatientId,
            appointmentDate: resolvedDate,
            appointmentTime: resolvedTime,
            doctorId: String(resolvedDoctor._id),
            paymentRequired: true,
            paymentAmount: resolvedDoctor.fees || 0,
            paymentCurrency: process.env.RAZORPAY_CURRENCY || 'INR',
            razorpayOrder: order ? {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status
            } : null
        };
    }

    if (!verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
        return {
            success: false,
            needs: 'payment_verification',
            message: 'The payment signature could not be verified. Please try again or contact support.',
            analysis,
            doctor: resolvedDoctor,
            patientId: resolvedPatientId,
            appointmentDate: resolvedDate,
            appointmentTime: resolvedTime,
            doctorId: String(resolvedDoctor._id),
            paymentRequired: true,
            paymentAmount: resolvedDoctor.fees || 0
        };
    }

    const booking = await createAppointmentRecord({
        userId,
        patientId: resolvedPatientId,
        doctorId: resolvedDoctor._id,
        appointmentDate: resolvedDate,
        appointmentTime: resolvedTime,
        paymentStatus: 'paid',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: 'razorpay'
    });

    return {
        success: true,
        analysis,
        doctor: resolvedDoctor,
        patientId: resolvedPatientId,
        appointmentDate: resolvedDate,
        appointmentTime: resolvedTime,
        doctorId: String(resolvedDoctor._id),
        booking,
        slots: slotData,
        paymentVerified: true,
        paymentAmount: resolvedDoctor.fees || 0,
        qrToken: booking.qrToken || '',
        qrPayload: booking.appointment?.qrPayload || ''
    };
};

module.exports = {
    DISCLAIMER,
    analyzeMessage,
    buildAssistantReply,
    buildSuggestedPrompts,
    bookFromMessage,
    recommendDoctorsForMessage,
    createRazorpayOrder,
    verifyRazorpaySignature
};
