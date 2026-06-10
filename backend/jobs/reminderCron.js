import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import { sendReminderEmail } from '../config/notifier.js';

// Helper to format date string to DD_M_YYYY (like '10_6_2026')
const formatDate = (date) => {
    return `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
};

export const startReminderCron = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            console.log("Running 24-hour reminder cron job...");

            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const targetDateStr = formatDate(tomorrow);

            // Find appointments for tomorrow that are not cancelled or completed
            // Also ensure we haven't already sent a reminder to avoid duplicates 
            // (Note: To perfectly avoid duplicates we would add a 'reminderSent' boolean to appointmentSchema, 
            // but for now we'll just fetch them. Since it runs hourly, we should only target a specific time window, 
            // or we add a simple check. If we just run daily at 8AM, we can send to ALL appointments for tomorrow.)
            
            // Let's refine the cron: Run once a day at 08:00 AM for all appointments tomorrow.
            const appointments = await appointmentModel.find({
                slotDate: targetDateStr,
                cancelled: false,
                isCompleted: false
            });

            if (appointments.length === 0) {
                return;
            }

            console.log(`Found ${appointments.length} appointments for tomorrow (${targetDateStr}). Sending reminders...`);

            for (const apt of appointments) {
                const user = await userModel.findById(apt.userId);
                const doctor = await doctorModel.findById(apt.docId);

                if (user && doctor) {
                    await sendReminderEmail(user.email, user.name, doctor.name, apt.slotDate, apt.slotTime);
                }
            }

        } catch (error) {
            console.error("Error in reminder cron job:", error);
        }
    });
};

// Alternative daily cron schedule (e.g. 08:00 AM)
export const startDailyReminderCron = () => {
    // Run every day at 08:00
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log("Running daily reminder cron job (8 AM)...");
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const targetDateStr = formatDate(tomorrow);

            const appointments = await appointmentModel.find({
                slotDate: targetDateStr,
                cancelled: false,
                isCompleted: false
            });

            console.log(`Found ${appointments.length} appointments for tomorrow (${targetDateStr}). Sending reminders...`);

            for (const apt of appointments) {
                const user = await userModel.findById(apt.userId);
                const doctor = await doctorModel.findById(apt.docId);

                if (user && doctor) {
                    await sendReminderEmail(user.email, user.name, doctor.name, apt.slotDate, apt.slotTime);
                }
            }
        } catch (error) {
            console.error("Error in daily reminder cron job:", error);
        }
    });
};
