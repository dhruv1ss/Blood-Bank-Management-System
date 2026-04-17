import express from 'express';
import { Appointment, Camp, Donation, User, Notification } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { recalculateUserGamification } from '../utils/gamification.js';

const router = express.Router();

// Get available time slots for a camp
router.get('/camps/:campId/slots', async (req, res) => {
    try {
        const camp = await Camp.findByPk(req.params.campId);
        if (!camp) return res.status(404).json({ status: 'error', message: 'Camp not found' });

        // Generate time slots based on camp start/end time
        const slots = generateTimeSlots(camp.startTime, camp.endTime);
        
        // Get booked slots
        const bookedAppointments = await Appointment.findAll({
            where: { campId: camp.id, status: 'SCHEDULED' },
            attributes: ['timeSlot']
        });
        
        const bookedSlots = bookedAppointments.map(a => a.timeSlot);
        
        // Mark slots as available or booked
        const availableSlots = slots.map(slot => ({
            time: slot,
            available: !bookedSlots.includes(slot)
        }));

        res.json({ status: 'success', data: availableSlots });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Book an appointment for donation
router.post('/book', verifyToken, async (req, res) => {
    try {
        const { campId, timeSlot, bloodGroup, age, condition } = req.body;
        
        if (!campId || !timeSlot) {
            return res.status(400).json({ status: 'error', message: 'Camp and time slot are required' });
        }

        const camp = await Camp.findByPk(campId);
        if (!camp) return res.status(404).json({ status: 'error', message: 'Camp not found' });
        if (camp.status !== 'APPROVED') {
            return res.status(400).json({ status: 'error', message: 'Camp is not approved yet' });
        }

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            where: { campId, timeSlot, status: 'SCHEDULED' }
        });
        
        if (existingAppointment) {
            return res.status(400).json({ status: 'error', message: 'This time slot is already booked' });
        }

        // Check if camp is full
        if (camp.bookedSlots >= camp.totalSlots) {
            return res.status(400).json({ status: 'error', message: 'Camp is fully booked' });
        }

        // Create donation record
        const donation = await Donation.create({
            userId: req.user.id,
            bloodGroup: bloodGroup || req.user.bloodGroup,
            age: age || req.user.age,
            condition: condition || 'Good',
            campId,
            appointmentDate: camp.date,
            appointmentTime: timeSlot,
            status: 'PENDING'
        });

        // Create appointment
        const appointment = await Appointment.create({
            donationId: donation.id,
            campId,
            userId: req.user.id,
            appointmentDate: camp.date,
            timeSlot,
            status: 'SCHEDULED'
        });

        // Update camp booked slots
        await camp.update({ bookedSlots: camp.bookedSlots + 1 });

        res.status(201).json({
            status: 'success',
            message: 'Appointment booked successfully! Your donation request has been submitted for admin approval.',
            data: { appointment, donation }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get user's appointments
router.get('/my', verifyToken, async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Camp, as: 'camp', attributes: ['name', 'address', 'city', 'date'] },
                { model: Donation, as: 'donation', attributes: ['bloodGroup', 'status'] }
            ],
            order: [['appointmentDate', 'DESC']]
        });

        res.json({ status: 'success', data: appointments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Cancel appointment
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        if (appointment.userId !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized' });
        }

        // Update camp booked slots
        const camp = await Camp.findByPk(appointment.campId);
        if (camp && camp.bookedSlots > 0) {
            await camp.update({ bookedSlots: camp.bookedSlots - 1 });
        }

        await appointment.update({ status: 'CANCELLED' });

        res.json({ status: 'success', message: 'Appointment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get appointments roster for a camp (Organization view)
router.get('/camps/:campId/roster', verifyToken, async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { campId: req.params.campId },
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['name', 'email', 'phone', 'bloodGroup', 'age'] 
                },
                { 
                    model: Donation, 
                    as: 'donation', 
                    attributes: ['bloodGroup', 'status'] 
                }
            ],
            order: [['timeSlot', 'ASC']]
        });

        res.json({ status: 'success', data: appointments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    let current = start;
    while (current < end) {
        const next = current + 30; // 30-minute slots
        const startStr = formatTime(current);
        const endStr = formatTime(next);
        slots.push(`${startStr}-${endStr}`);
        current = next;
    }
    
    return slots;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Mark appointment as completed (for organizations/admins)
router.put('/:id/complete', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Donation, as: 'donation' },
                { model: User, as: 'user' }
            ]
        });
        
        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }

        // Check if user has permission (admin or organization that owns the camp)
        const camp = await Camp.findByPk(appointment.campId);
        if (req.user.role !== 'ADMIN' && req.user.id !== camp.organizationId) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized' });
        }

        // Update appointment status
        await appointment.update({ status: 'COMPLETED' });

        // Update donation status to completed and award points
        if (appointment.donation && appointment.donation.status !== 'COMPLETED') {
            const previousDonationStatus = appointment.donation.status;
            await appointment.donation.update({ status: 'COMPLETED' });

            // Award points and update badge only if donation wasn't already approved or completed
            const user = appointment.user;
            if (user && previousDonationStatus === 'PENDING') {
                await user.update({ lastDonationDate: new Date() });
                const result = await recalculateUserGamification(user.id);

                // Create notification for the user
                await Notification.create({
                    userId: user.id,
                    type: 'DONATION_APPROVED',
                    title: 'Donation Completed!',
                    message: `Your blood donation has been completed! You now have ${result?.points} points and your badge is ${result?.badge}. Thank you for saving lives! 🩸❤️`,
                    read: false
                });
            }
        }

        res.json({ status: 'success', message: 'Appointment marked as completed successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
