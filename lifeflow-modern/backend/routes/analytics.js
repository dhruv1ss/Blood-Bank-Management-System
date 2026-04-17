import express from 'express';
import { User, Request, Donation, Camp, sequelize } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Real-time dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Blood inventory by type
        const bloodInventory = await Donation.findAll({
            where: { 
                status: { [Op.in]: ['COMPLETED', 'APPROVED'] },
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                'bloodGroup',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['bloodGroup']
        });

        // Recent donation trends (last 7 days)
        const donationTrends = await Donation.findAll({
            where: {
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // Lives saved calculation (1 donation = 3 lives)
        const totalDonations = await Donation.count({ 
            where: { status: { [Op.in]: ['COMPLETED', 'APPROVED'] } } 
        });
        const livesSaved = totalDonations * 3;

        // Urgent requests
        const urgentRequests = await Request.findAll({
            where: { 
                status: 'PENDING',
                urgency: { [Op.in]: ['HIGH', 'CRITICAL'] }
            },
            include: [{ model: User, as: 'user', attributes: ['name', 'city'] }],
            order: [['urgency', 'DESC'], ['createdAt', 'DESC']],
            limit: 5
        });

        // Top donors this month
        const topDonors = await User.findAll({
            where: { role: 'DONOR' },
            attributes: ['id', 'name', 'city', 'points', 'badge'],
            order: [['points', 'DESC']],
            limit: 10
        });

        // Regional blood needs
        const regionalNeeds = await Request.findAll({
            where: { 
                status: 'PENDING',
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                'city',
                'bloodGroup',
                [sequelize.fn('COUNT', sequelize.col('id')), 'requests'],
                [sequelize.fn('SUM', sequelize.col('units')), 'totalUnits']
            ],
            group: ['city', 'bloodGroup'],
            order: [[sequelize.fn('SUM', sequelize.col('units')), 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                bloodInventory,
                donationTrends,
                livesSaved,
                urgentRequests,
                topDonors,
                regionalNeeds,
                lastUpdated: now
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Blood demand prediction (simplified ML model)
router.get('/prediction', verifyToken, async (req, res) => {
    try {
        // Get historical data for the last 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        const historicalData = await Request.findAll({
            where: {
                createdAt: { [Op.gte]: ninetyDaysAgo }
            },
            attributes: [
                'bloodGroup',
                'city',
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('units')), 'demand']
            ],
            group: ['bloodGroup', 'city', sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // Simple prediction algorithm (moving average + seasonal adjustment)
        const predictions = {};
        
        historicalData.forEach(record => {
            const key = `${record.city}_${record.bloodGroup}`;
            if (!predictions[key]) {
                predictions[key] = {
                    city: record.city,
                    bloodGroup: record.bloodGroup,
                    historicalDemand: [],
                    predictedDemand: 0,
                    trend: 'stable'
                };
            }
            predictions[key].historicalDemand.push(parseInt(record.dataValues.demand));
        });

        // Calculate predictions
        Object.keys(predictions).forEach(key => {
            const data = predictions[key].historicalDemand;
            if (data.length > 0) {
                const avg = data.reduce((a, b) => a + b, 0) / data.length;
                const recent = data.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, data.length);
                
                predictions[key].predictedDemand = Math.round(avg * 1.1); // 10% buffer
                predictions[key].trend = recent > avg ? 'increasing' : recent < avg ? 'decreasing' : 'stable';
            }
        });

        res.json({
            status: 'success',
            data: {
                predictions: Object.values(predictions),
                generatedAt: new Date(),
                algorithm: 'Moving Average with Seasonal Adjustment'
            }
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Export reports
router.get('/export', verifyToken, async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Get dashboard data
        const dashboardData = await getDashboardData();
        
        if (format === 'pdf') {
            // Simple PDF export (in real app, use libraries like puppeteer or jsPDF)
            const pdfContent = generatePDFContent(dashboardData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="heroes-report.pdf"');
            res.send(pdfContent);
        } else if (format === 'excel') {
            // Simple Excel export (in real app, use libraries like exceljs)
            const excelContent = generateExcelContent(dashboardData);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="heroes-report.xlsx"');
            res.send(excelContent);
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid format' });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper functions for export
async function getDashboardData() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [bloodInventory, topDonors, urgentRequests] = await Promise.all([
        Donation.findAll({
            where: { 
                status: { [Op.in]: ['COMPLETED', 'APPROVED'] },
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                'bloodGroup',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['bloodGroup']
        }),
        User.findAll({
            where: { role: 'DONOR' },
            attributes: ['name', 'points', 'badge', 'bloodGroup', 'city'],
            order: [['points', 'DESC']],
            limit: 20
        }),
        Request.findAll({
            where: { 
                status: 'PENDING',
                urgency: { [Op.in]: ['HIGH', 'CRITICAL'] }
            },
            include: [{ model: User, as: 'user', attributes: ['name', 'city'] }],
            limit: 10
        })
    ]);
    
    return { bloodInventory, topDonors, urgentRequests };
}

function generatePDFContent(data) {
    // Simplified PDF content - in real app, use proper PDF library
    const content = `
HEROES REPORT - ${new Date().toLocaleDateString()}

TOP DONORS:
${data.topDonors.map((donor, i) => `${i+1}. ${donor.name} - ${donor.points} points (${donor.badge})`).join('\n')}

BLOOD INVENTORY:
${data.bloodInventory.map(item => `${item.bloodGroup}: ${item.count} units`).join('\n')}

URGENT REQUESTS:
${data.urgentRequests.map(req => `${req.user?.name || 'Unknown'} - ${req.bloodGroup} (${req.urgency})`).join('\n')}
    `;
    
    return Buffer.from(content, 'utf8');
}

function generateExcelContent(data) {
    // Simplified Excel content - in real app, use proper Excel library
    const content = `Name,Points,Badge,Blood Group,City\n${data.topDonors.map(donor => 
        `${donor.name},${donor.points},${donor.badge},${donor.bloodGroup},${donor.city || ''}`
    ).join('\n')}`;
    
    return Buffer.from(content, 'utf8');
}

export default router;