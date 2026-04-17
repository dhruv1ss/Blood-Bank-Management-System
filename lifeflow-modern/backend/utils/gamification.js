import { Donation, User } from '../config/db.js';
import { Op } from 'sequelize';

const BADGES = {
    'Starter': { minPoints: 0 },
    'Bronze': { minPoints: 50 },
    'Silver': { minPoints: 150 },
    'Gold': { minPoints: 250 },
    'Platinum': { minPoints: 500 },
    'Diamond': { minPoints: 1000 },
    'Legend': { minPoints: 2500 }
};

/**
 * Recalculates a user's points and badge strictly as: 50 points per approved/completed donation.
 * Lives impacted = 1 per donation.
 * @param {number} userId 
 */
export const recalculateUserGamification = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;

        const totalDonations = await Donation.count({
            where: {
                userId: user.id,
                status: { [Op.in]: ['COMPLETED', 'APPROVED'] }
            }
        });

        // Strictly: 50 points per donation, no bonus points
        const points = totalDonations * 50;

        // Determine badge based on points
        let newBadge = 'Starter';
        const sortedBadges = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
        for (const [badgeName, badgeInfo] of sortedBadges) {
            if (points >= badgeInfo.minPoints) {
                newBadge = badgeName;
            }
        }

        // Save
        await user.update({ points, badge: newBadge });
        return { points, badge: newBadge, totalDonations };
    } catch (error) {
        console.error('Error recalculating gamification:', error);
        return null;
    }
};
