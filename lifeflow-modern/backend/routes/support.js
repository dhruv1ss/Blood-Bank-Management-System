/* eslint-disable no-unused-vars */
import express from 'express';
import { SupportMessage, User, Notification } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── USER ROUTES ────────────────────────────────────────────────────────────

// Submit a support message
router.post('/', verifyToken, async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.userId;

        if (!subject || !message) {
            return res.status(400).json({ status: 'error', message: 'Subject and message are required' });
        }

        const supportMessage = await SupportMessage.create({
            userId,
            subject,
            message,
            status: 'OPEN',
            isReadByAdmin: false, // New message for admin
            isReadByUser: true    // User obviously knows what they wrote
        });

        res.status(201).json({ status: 'success', data: supportMessage, message: 'Support message submitted successfully' });
    } catch (error) {
        console.error('Support submission error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to submit support message' });
    }
});

// Mark all user's messages as read by user
router.put('/mark-read-user', verifyToken, async (req, res) => {
    try {
        await SupportMessage.update({ isReadByUser: true }, {
            where: { userId: req.userId, isReadByUser: false }
        });
        res.json({ status: 'success', message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to mark messages as read' });
    }
});

// Mark all messages as read by admin
router.put('/mark-read-admin', verifyAdmin, async (req, res) => {
    try {
        await SupportMessage.update({ isReadByAdmin: true }, {
            where: { isReadByAdmin: false }
        });
        res.json({ status: 'success', message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to mark messages as read' });
    }
});

// Get user's own support messages
router.get('/user', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const messages = await SupportMessage.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: messages });
    } catch (error) {
        console.error('Fetch user support messages error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch support messages' });
    }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Get all support messages for admin
router.get('/admin', verifyAdmin, async (req, res) => {
    try {
        const messages = await SupportMessage.findAll({
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: messages });
    } catch (error) {
        console.error('Fetch admin support messages error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch support messages' });
    }
});

// Reply to a support message
router.put('/reply/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply } = req.body;

        if (!adminReply) {
            return res.status(400).json({ status: 'error', message: 'Reply content is required' });
        }

        const message = await SupportMessage.findByPk(id);
        if (!message) {
            return res.status(404).json({ status: 'error', message: 'Support message not found' });
        }

        message.adminReply = adminReply;
        message.status = 'REPLIED';
        message.isReadByUser = false; // Send unread notification to user
        message.isReadByAdmin = true; // Admin just replied, so it's read by them
        await message.save();

        // Create a notification for the user
        await Notification.create({
            userId: message.userId,
            type: 'GENERAL',
            title: 'Support Update',
            message: `Admin has replied to your problem: "${message.subject}". Check your support panel for details.`,
            read: false
        });

        res.json({ status: 'success', data: message, message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Admin reply error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send reply' });
    }
});

// Resolve a support message
router.put('/resolve/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const message = await SupportMessage.findByPk(id);
        if (!message) {
            return res.status(404).json({ status: 'error', message: 'Support message not found' });
        }

        message.status = 'RESOLVED';
        await message.save();

        res.json({ status: 'success', data: message, message: 'Message marked as resolved' });
    } catch (error) {
        console.error('Admin resolve error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to resolve message' });
    }
});

export default router;
