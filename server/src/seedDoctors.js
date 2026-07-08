require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./model/doctor');

const doctors = [
    {
        name: 'Dr. Ananya Sen',
        qualification: 'MBBS, MD',
        specialized: 'Cardiologist',
        experience: 8,
        fees: 700,
        is_available: true
    },
    {
        name: 'Dr. Rohan Mehta',
        qualification: 'MBBS, MS',
        specialized: 'Orthopedic',
        experience: 10,
        fees: 600,
        is_available: true
    },
    {
        name: 'Dr. Priya Sharma',
        qualification: 'MBBS, DGO',
        specialized: 'Gynecologist',
        experience: 7,
        fees: 650,
        is_available: true
    },
    {
        name: 'Dr. Arjun Roy',
        qualification: 'MBBS, MD',
        specialized: 'Dermatologist',
        experience: 6,
        fees: 500,
        is_available: true
    },
    {
        name: 'Dr. Nisha Kapoor',
        qualification: 'MBBS, DCH',
        specialized: 'Pediatrician',
        experience: 9,
        fees: 550,
        is_available: true
    }
];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const doctor of doctors) {
            await Doctor.findOneAndUpdate(
                { name: doctor.name },
                doctor,
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log('Sample doctors added successfully');
    } catch (error) {
        console.error('Doctor seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedDoctors();
