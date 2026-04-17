import express from 'express';
import { Request, User, Notification } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto-match donors for a blood request
router.post('/auto-match/:requestId', verifyAdmin, async (req, res) => {
    try {
        const bloodRequest = await Request.findByPk(req.params.requestId);
        if (!bloodRequest) {
            return res.status(404).json({ status: 'error', message: 'Request not found' });
        }

        // Find compatible donors
        const compatibleDonors = await findCompatibleDonors(
            bloodRequest.bloodGroup,
            bloodRequest.city,
            bloodRequest.state
        );

        if (compatibleDonors.length === 0) {
            return res.json({
                status: 'success',
                message: 'No compatible donors found',
                data: { matchedCount: 0, donors: [] }
            });
        }

        // Create notifications for matched donors
        const notifications = await Promise.all(
            compatibleDonors.map(donor =>
                Notification.create({
                    userId: donor.id,
                    type: 'URGENT_REQUEST',
                    title: 'Urgent Blood Request',
                    message: `${bloodRequest.patientName} needs ${bloodRequest.bloodGroup} blood at ${bloodRequest.hospitalName}`,
                    requestId: bloodRequest.id,
                    read: false
                })
            )
        );

        // Update request with matched donors
        const matchedDonorIds = compatibleDonors.map(d => d.id);
        await bloodRequest.update({
            matchedDonors: JSON.stringify(matchedDonorIds)
        });

        res.json({
            status: 'success',
            message: `Matched ${compatibleDonors.length} donors`,
            data: {
                matchedCount: compatibleDonors.length,
                donors: compatibleDonors.map(d => ({
                    id: d.id,
                    name: d.name,
                    bloodGroup: d.bloodGroup,
                    city: d.city,
                    phone: d.phone
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get user's notifications
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json({ status: 'success', data: notifications });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }

        await notification.update({ read: true });
        res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper function to find compatible donors
async function findCompatibleDonors(bloodGroup, city, state) {
    const compatibleGroups = getCompatibleBloodGroups(bloodGroup);

    const donors = await User.findAll({
        where: {
            role: 'DONOR',
            bloodGroup: compatibleGroups,
            city: city,
            state: state
        },
        attributes: ['id', 'name', 'bloodGroup', 'city', 'phone', 'lastDonationDate'],
        limit: 50
    });

    // Filter by donation eligibility (56 days since last donation)
    return donors.filter(donor => {
        if (!donor.lastDonationDate) return true;
        const daysSinceLastDonation = Math.floor(
            (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastDonation >= 56;
    });
}

// Get compatible blood groups for transfusion
function getCompatibleBloodGroups(bloodGroup) {
    const compatibility = {
        'O-': ['O-'],
        'O+': ['O+', 'O-'],
        'A-': ['A-', 'O-'],
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'AB-': ['AB-', 'A-', 'B-', 'O-'],
        'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
    };
    return compatibility[bloodGroup] || [bloodGroup];
}

export default router;
