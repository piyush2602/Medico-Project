import axios from 'axios';
import 'dotenv/config';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (slotDate) => {
    if (!slotDate) return '';
    const dateArray = slotDate.split('_');
    if (dateArray.length !== 3) return slotDate;
    return dateArray[0] + "/" + months[Number(dateArray[1]) - 1] + "/" + dateArray[2];
};

// Helper function to send email via Brevo HTTP API
const sendMail = async (to, subject, htmlContent) => {
    try {
        if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
            console.warn("⚠️ BREVO_API_KEY or EMAIL_USER is not set in .env. Skipping email to:", to);
            return false;
        }

        const data = {
            sender: {
                name: "Medico Notifications",
                email: process.env.EMAIL_USER
            },
            to: [
                { email: to }
            ],
            subject: subject,
            htmlContent: htmlContent
        };

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', data, {
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });

        console.log("Email sent via Brevo:", response.data.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email to", to, ":", error.response?.data || error.message);
        return false;
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const subject = "Welcome to Medico!";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #5F6FFF;">Welcome to Medico, ${name}!</h2>
            <p>We are thrilled to have you on board. Medico is your trusted platform for managing healthcare appointments effortlessly.</p>
            <p>You can now browse our network of top doctors, book appointments, and chat with your doctor directly through our platform.</p>
            <br>
            <p>Stay healthy!</p>
            <p><strong>The Medico Team</strong></p>
        </div>
    `;
    return sendMail(email, subject, html);
};

export const sendAppointmentConfirmation = async (patientEmail, doctorEmail, patientName, doctorName, date, time) => {
    const patientSubject = "Appointment Confirmed - Medico";
    const patientHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #22C55E;">Appointment Confirmed!</h2>
            <p>Hi ${patientName},</p>
            <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
            <p><strong>Date:</strong> ${formatDate(date)}</p>
            <p><strong>Time:</strong> ${time}</p>
            <br>
            <p>Thank you for choosing Medico.</p>
        </div>
    `;

    const doctorSubject = "New Appointment Scheduled - Medico";
    const doctorHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #5F6FFF;">New Appointment</h2>
            <p>Hi ${doctorName},</p>
            <p>You have a new appointment scheduled with <strong>${patientName}</strong>.</p>
            <p><strong>Date:</strong> ${formatDate(date)}</p>
            <p><strong>Time:</strong> ${time}</p>
            <br>
            <p>Please check your Medico Dashboard for details.</p>
        </div>
    `;

    // Send to both asynchronously
    await Promise.all([
        sendMail(patientEmail, patientSubject, patientHtml),
        sendMail(doctorEmail, doctorSubject, doctorHtml)
    ]);
};

export const sendAppointmentCancellation = async (patientEmail, doctorEmail, patientName, doctorName, date, time, cancelledBy) => {
    const subject = "Appointment Cancelled - Medico";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #EF4444;">Appointment Cancelled</h2>
            <p>The appointment between <strong>${patientName}</strong> and <strong>${doctorName}</strong> scheduled for ${formatDate(date)} at ${time} has been cancelled by ${cancelledBy}.</p>
            <br>
            <p>If you have any questions, please contact our support.</p>
        </div>
    `;

    await Promise.all([
        sendMail(patientEmail, subject, html),
        sendMail(doctorEmail, subject, html)
    ]);
};

export const sendReminderEmail = async (patientEmail, patientName, doctorName, date, time) => {
    const subject = "Reminder: Upcoming Appointment Tomorrow - Medico";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #F59E0B;">Appointment Reminder</h2>
            <p>Hi ${patientName},</p>
            <p>This is a friendly reminder that you have an appointment tomorrow with <strong>${doctorName}</strong>.</p>
            <p><strong>Date:</strong> ${formatDate(date)}</p>
            <p><strong>Time:</strong> ${time}</p>
            <br>
            <p>Please ensure you are ready a few minutes before the scheduled time.</p>
            <p>Best regards,</p>
            <p><strong>The Medico Team</strong></p>
        </div>
    `;
    return sendMail(patientEmail, subject, html);
};

export const sendSignInEmail = async (email, name, deviceName) => {
    const subject = "Welcome back to Medico!";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #5F6FFF;">Welcome back, ${name}!</h2>
            <p>You have successfully logged into your Medico account.</p>
            <br>
            <p>If you need to book an appointment or manage your profile, you can do so directly from your dashboard.</p>
            <br>
            <p>Stay healthy!</p>
            <p><strong>The Medico Team</strong></p>
        </div>
    `;
    return sendMail(email, subject, html);
};

export const sendDoctorCustomEmail = async (patientEmail, patientName, doctorName, customSubject, customMessage) => {
    const subject = customSubject || `Message from ${doctorName} - Medico`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #5F6FFF; margin-top: 0;">Message from your Doctor</h2>
            <p>Hi ${patientName},</p>
            <p><strong>${doctorName}</strong> has sent you a direct message regarding your appointment:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #5F6FFF; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; line-height: 1.5;">${customMessage}</div>
            
            <p style="color: #6b7280; font-size: 0.9em;">If you need to reply, please use the chat feature in your Medico dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>The Medico Team</strong></p>
        </div>
    `;
    return sendMail(patientEmail, subject, html);
};

export const sendPrescriptionAddedEmail = async (patientEmail, patientName, doctorName) => {
    const subject = "Prescription Added - Medico";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #5F6FFF; margin-top: 0;">Prescription Added</h2>
            <p>Hi ${patientName},</p>
            <p>Your doctor, <strong>${doctorName}</strong>, has added a new prescription to your recent appointment.</p>
            <p>You can view and download your prescription by visiting the <strong>My Appointments</strong> section in your Medico dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>The Medico Team</strong></p>
        </div>
    `;
    return sendMail(patientEmail, subject, html);
};
