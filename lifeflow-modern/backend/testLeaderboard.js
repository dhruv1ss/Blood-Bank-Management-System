import dotenv from 'dotenv';
dotenv.config();

process.env.DATABASE_URL = "postgresql://lifeflow_db_dxyf_user:PwGZIRtJqUnRJPG15y0jSLyQUVcQVce3@dpg-d7h2sdrbc2fs738o0gg0-a.oregon-postgres.render.com/lifeflow_db_dxyf";

async function testLeaderboard() {
    try {
        const db = await import('./config/db.js');
        const sequelize = db.sequelize;
        const User = db.User;
        
        console.log("Connecting...");
        await sequelize.authenticate();
        
        console.log("Running Query...");
        const topDonors = await User.findAll({
            where: { role: 'DONOR' },
            attributes: [
                'id', 'name', 'badge', 'bloodGroup', 'city', 'createdAt',
                [sequelize.literal(`(SELECT COUNT(*) FROM "Donations" WHERE "Donations"."userId" = "User"."id" AND ("Donations"."status" = 'COMPLETED' OR "Donations"."status" = 'APPROVED'))`), 'totalDonations'],
                [sequelize.literal(`(SELECT COUNT(*) FROM "Donations" WHERE "Donations"."userId" = "User"."id" AND ("Donations"."status" = 'COMPLETED' OR "Donations"."status" = 'APPROVED')) * 1`), 'livesSaved'],
                [sequelize.literal(`(SELECT COUNT(*) FROM "Donations" WHERE "Donations"."userId" = "User"."id" AND ("Donations"."status" = 'COMPLETED' OR "Donations"."status" = 'APPROVED')) * 50`), 'points']
            ],
            order: [[sequelize.literal('points'), 'DESC']],
            limit: 20
        });
        
        console.log("Success! Returned " + topDonors.length + " users.");
        console.log("First user raw data:");
        console.log(JSON.stringify(topDonors[0].toJSON(), null, 2));
        
        // Add rank and badge info calculation from leaderboard.js to see if it copies literals
        const enhancedLeaderboard = topDonors.map((user, index) => {
            const userData = user.toJSON();
            const points = userData.points || 0;
            return {
                rank: index + 1,
                ...userData,
                points
            };
        });
        
        console.log("Enhanced first user:");
        console.log(JSON.stringify(enhancedLeaderboard[0], null, 2));
        process.exit(0);
    } catch (e) {
        console.log("ERROR! " + e.message);
        console.log(e);
        process.exit(1);
    }
}
testLeaderboard();
