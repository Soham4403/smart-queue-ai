const fs = require("fs");
const path = require("path");
const User = require("../model/user");
const Notification = require("../model/notification");
const sendEmail = require("../config/nodemailer");
const { publishAppointmentConfirmed, consumeFromQueue } = require("../config/rabbitmq");

const receiptDir = path.join(__dirname, "..", "uploads", "receipts");
const qrDir = path.join(__dirname, "..", "uploads", "qrcodes");

const ensureDir = (directory) => {
  fs.mkdirSync(directory, { recursive: true });
};

const buildAppointmentEmailHtml = ({ user, patient, doctor, appointment }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <h2 style="margin: 0 0 12px; color: #2563eb;">Appointment Confirmed</h2>
    <p>Hello ${user?.name || "User"},</p>
    <p>Your appointment has been booked successfully.</p>
    <p><strong>Patient:</strong> ${patient?.patientName || "Patient"}</p>
    <p><strong>Doctor:</strong> ${doctor?.name || "Doctor"}</p>
    <p><strong>Specialization:</strong> ${doctor?.specialized || "General"}</p>
    <p><strong>Date:</strong> ${appointment?.appointmentDate || "N/A"}</p>
    <p><strong>Time:</strong> ${appointment?.appointmentTime || "N/A"}</p>
    <p><strong>Fees:</strong> Rs. ${doctor?.fees || 0}</p>
    <p style="margin-top: 16px;">Thank you for using SmartQueue.</p>
  </div>
`;

const persistReceiptSnapshot = (event) => {
  ensureDir(receiptDir);
  const fileName = `${event.appointment._id}.json`;
  const filePath = path.join(receiptDir, fileName);
  const receipt = {
    appointmentId: event.appointment._id,
    patientName: event.patient?.patientName || "",
    doctorName: event.doctor?.name || "",
    date: event.appointment.appointmentDate,
    time: event.appointment.appointmentTime,
    amount: event.doctor?.fees || 0,
    paymentStatus: event.appointment.paymentStatus,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(receipt, null, 2), "utf8");
  return filePath;
};

const persistQrSnapshot = (event) => {
  ensureDir(qrDir);
  const fileName = `${event.appointment._id}.json`;
  const filePath = path.join(qrDir, fileName);
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        qrToken: event.qrToken,
        qrPayload: event.appointment.qrPayload,
        appointmentId: event.appointment._id
      },
      null,
      2
    ),
    "utf8"
  );
  return filePath;
};

const createNotifications = async (event) => {
  const admins = await User.find({ role: "admin" }).select("_id");
  const notifications = [
    {
      userId: event.user?._id,
      type: "appointment_confirmed",
      title: "Appointment confirmed",
      message: `Your appointment with ${event.doctor?.name || "Doctor"} is booked for ${event.appointment.appointmentDate} at ${event.appointment.appointmentTime}.`,
      payload: event
    }
  ];

  admins.forEach((admin) => {
    notifications.push({
      userId: admin._id,
      type: "admin_booking",
      title: "New appointment booked",
      message: `${event.patient?.patientName || "A patient"} booked ${event.doctor?.name || "a doctor"} for ${event.appointment.appointmentDate} at ${event.appointment.appointmentTime}.`,
      payload: event
    });
  });

  await Notification.insertMany(notifications);
};

const sendAppointmentEmail = async (event) => {
  if (!event.user?.email) {
    return false;
  }

  const html = buildAppointmentEmailHtml(event);
  await sendEmail(event.user.email, "SmartQueue Appointment Confirmation", html);
  return true;
};

const dispatchAppointmentConfirmedEvent = async (event) => {
  const payload = {
    type: "appointment.confirmed",
    ...event
  };

  const published = await publishAppointmentConfirmed(payload);

  if (!published) {
    await sendAppointmentEmail(event);
    await createNotifications(event).catch((error) =>
      console.error("Notification fallback failed:", error.message)
    );
    persistReceiptSnapshot(event);
    persistQrSnapshot(event);
  }

  return published;
};

const startRabbitConsumers = async () => {
  const handlers = [
    {
      queue: "smartqueue.email",
      handler: async (event) => {
        await sendAppointmentEmail(event);
      }
    },
    {
      queue: "smartqueue.notifications",
      handler: async (event) => {
        await createNotifications(event);
      }
    },
    {
      queue: "smartqueue.receipts",
      handler: async (event) => {
        persistReceiptSnapshot(event);
      }
    },
    {
      queue: "smartqueue.qr",
      handler: async (event) => {
        persistQrSnapshot(event);
      }
    }
  ];

  for (const item of handlers) {
    await consumeFromQueue(item.queue, item.handler);
  }
};

module.exports = {
  dispatchAppointmentConfirmedEvent,
  startRabbitConsumers
};
