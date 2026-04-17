import { Post, Comment, Like, User, sequelize } from './config/db.js';

async function testDelete() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
        const post = await Post.findOne({ order: [['createdAt', 'DESC']] });
        if(!post) {
            console.log('No post found');
            process.exit(0);
        }
        console.log('Attempting to delete post:', post.id);
        await Like.destroy({ where: { postId: post.id } });
        await Comment.destroy({ where: { postId: post.id } });
        await post.destroy();
        console.log('Post deleted successfully');
    } catch(e) {
        console.error('Error during deletion:', e);
    }
    process.exit();
}
testDelete();
