const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createNotification = async (userEmail, title, message, type = 'general') => {
  const db = require('../db/connection');
  try {
    await db.query(
      'INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)',
      [userEmail, title, message, type]
    );
  } catch (err) {
    console.error('Notification error:', err);
  }
};

const sendBookingConfirmation = async (customerEmail, bookingDetails) => {
  const { courtName, date, timeSlot, amount } = bookingDetails;

  // Create in-app notification
  await createNotification(
    customerEmail,
    'Booking Confirmed 🏀',
    `Your booking at ${courtName} on ${date} at ${timeSlot} is confirmed!`,
    'booking'
  );

  // Email to customer
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'HoopRise - Booking Confirmation',
    html: `
      <h2>Booking Confirmed! 🏀</h2>
      <p>Your court booking has been confirmed.</p>
      <ul>
        <li><strong>Court:</strong> ${courtName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${timeSlot}</li>
        <li><strong>Amount Paid:</strong> ${amount} RWF</li>
      </ul>
      <p>Thank you for using HoopRise!</p>
    `
  });

  // Email to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'HoopRise - New Booking',
    html: `
      <h2>New Booking Received! 🏀</h2>
      <ul>
        <li><strong>Customer:</strong> ${customerEmail}</li>
        <li><strong>Court:</strong> ${courtName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${timeSlot}</li>
        <li><strong>Amount:</strong> ${amount} RWF</li>
      </ul>
    `
  });
};

const sendEquipmentRequestNotification = async (adminEmail, requestDetails) => {
  const { userName, userEmail, userPhone, equipmentName, message } = requestDetails;

  // Email to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'HoopRise - New Equipment Request',
    html: `
      <h2>New Equipment Request 🏀</h2>
      <p>A user has requested equipment from HoopRise.</p>
      <ul>
        <li><strong>Equipment:</strong> ${equipmentName}</li>
        <li><strong>Requested by:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Phone:</strong> ${userPhone || 'Not provided'}</li>
        <li><strong>Message:</strong> ${message || 'No message'}</li>
      </ul>
      <p>Please log in to the admin dashboard to approve or reject this request.</p>
    `
  });

  // Create in-app notification for admin
  await createNotification(
    adminEmail,
    'New Equipment Request 🏀',
    `${userName} requested ${equipmentName}.`,
    'equipment'
  );
};

const sendEquipmentStatusNotification = async (userEmail, requestDetails) => {
  const { userName, equipmentName, status } = requestDetails;

  // Create in-app notification for user
  await createNotification(
    userEmail,
    `Equipment Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    `Your request for ${equipmentName} has been ${status}.`,
    'equipment'
  );

  // Email to user
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `HoopRise - Equipment Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    html: `
      <h2>Equipment Request Update 🏀</h2>
      <p>Hi ${userName},</p>
      <p>Your request for <strong>${equipmentName}</strong> has been 
      <strong style="color: ${status === 'approved' ? '#22c55e' : '#f87171'}">${status}</strong>.</p>
      ${status === 'approved'
        ? '<p>Please visit HoopRise or contact us to arrange pickup. See you on the court!</p>'
        : '<p>Unfortunately your request was not approved. Please try again or contact us.</p>'
      }
      <p>Thank you for using HoopRise!</p>
    `
  });
};

const sendProgramRegistrationNotification = async (userEmail, details) => {
  const { userName, programTitle, location, startDate, startTime } = details;

  // Create in-app notification
  await createNotification(
    userEmail,
    'Program Registration Confirmed!',
    `You have successfully registered for ${programTitle}.`,
    'general'
  );

  // Email to user
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'HoopRise - Program Registration Confirmed!',
    html: `
      <h2>Registration Confirmed! 🏀</h2>
      <p>Hi ${userName},</p>
      <p>You have successfully registered for <strong>${programTitle}</strong>.</p>
      <ul>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Date:</strong> ${new Date(startDate).toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
        <li><strong>Time:</strong> ${startTime}</li>
      </ul>
      <p>See you there! 🏀</p>
      <p>Thank you for using HoopRise!</p>
    `
  });

  // Email to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'HoopRise - New Program Registration',
    html: `
      <h2>New Program Registration 🏀</h2>
      <ul>
        <li><strong>Program:</strong> ${programTitle}</li>
        <li><strong>User:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
      </ul>
    `
  });
};

module.exports = {
  sendBookingConfirmation,
  sendEquipmentRequestNotification,
  sendEquipmentStatusNotification,
  sendProgramRegistrationNotification
};