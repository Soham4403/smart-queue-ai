require('dotenv').config();
const express = require('express');
const ConnDb = require('./src/config/DbConfig');
const doctorRouter = require('./src/router/doctor.router');
const userRouter = require('./src/router/user.router');
const patientRouter = require('./src/router/patient.router');
const appointmentRouter = require('./src/router/appointment.router');
const paymentRouter = require('./src/router/payment.router');
const adminRouter = require('./src/router/admin.router');
const aiRouter = require('./src/router/ai.router');
const { startRabbitConsumers } = require('./src/service/appointmentEvents.service');
const cors = require('cors');


const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://smart-queue-booking.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'SmartQueue API is running',
        success: true
    });
});

app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/appointment', appointmentRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/ai', aiRouter);


const PORT = process.env.PORT || 4000;

ConnDb().then(() => {
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

startRabbitConsumers().catch((error) => {
    console.warn('RabbitMQ consumers could not start:', error.message);
});
});
