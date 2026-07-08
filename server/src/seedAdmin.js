require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/user');

const seedAdmin = async () => {
    const adminName = process.env.ADMIN_NAME || 'SmartQueue Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartqueue.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        console.log(`Admin ready: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    } catch (error) {
        console.error('Admin seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
