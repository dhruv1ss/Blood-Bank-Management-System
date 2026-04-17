import express from 'express';
import { Post, Comment, Like, User, Donation } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/community/survivor-stats - Public endpoint for survivor impact data
router.get('/survivor-stats', async (req, res) => {
    try {
        const survivorEmails = ['aarav@lifeflow.com', 'priya@lifeflow.com', 'vikram@lifeflow.com', 'ananya@lifeflow.com'];
        
        const stats = await Promise.all(survivorEmails.map(async (email) => {
            const user = await User.findOne({ 
                where: { email },
                attributes: ['id', 'name', 'email', 'badge']
            });
            
            if (!user) return null;
            
            const approvedDonations = await Donation.count({
                where: { userId: user.id, status: ['APPROVED', 'COMPLETED'] }
            });
            
            return {
                email: user.email,
                name: user.name,
                livesImpacted: approvedDonations * 3,
                badge: user.badge
            };
        }));
        
        res.json({ status: 'success', data: stats.filter(s => s !== null) });
    } catch (error) {
        console.error('Error fetching survivor stats:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch survivor statistics' });
    }
});

// GET /api/community/posts - Fetch all posts with users, likes, and comments
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'role', 'bloodGroup', 'avatar'] },
                { 
                    model: Comment, 
                    as: 'comments', 
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }] 
                },
                { model: Like, as: 'likes', attributes: ['userId'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ status: 'success', data: posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch posts' });
    }
});

// POST /api/community/posts - Create a new post
router.post('/posts', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ status: 'error', message: 'Content cannot be empty' });
        }

        const newPost = await Post.create({
            userId: req.user.id,
            content
        });
        
        // Fetch it back with associations so frontend can render immediately
        const populatedPost = await Post.findOne({
            where: { id: newPost.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'role', 'bloodGroup', 'avatar'] },
                { model: Comment, as: 'comments' },
                { model: Like, as: 'likes' }
            ]
        });

        res.status(201).json({ status: 'success', data: populatedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create post' });
    }
});

// POST /api/community/posts/:id/like - Toggle Like
router.post('/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

        const existingLike = await Like.findOne({ where: { postId, userId } });

        if (existingLike) {
            await existingLike.destroy();
        } else {
            await Like.create({ postId, userId });
        }

        // Fetch remaining likes
        const updatedLikes = await Like.findAll({ where: { postId }, attributes: ['userId'] });

        res.json({ status: 'success', data: { likes: updatedLikes } });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ status: 'error', message: 'Failed to toggle like' });
    }
});

// POST /api/community/posts/:id/comment - Add comment
router.post('/posts/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ status: 'error', message: 'Comment cannot be empty' });
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

        await Comment.create({
            postId,
            userId: req.user.id,
            text
        });

        // Fetch all comments for this post to return to frontend
        const updatedComments = await Comment.findAll({
            where: { postId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }],
            order: [['createdAt', 'ASC']]
        });

        res.status(201).json({ status: 'success', data: updatedComments });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to add comment' });
    }
});

// DELETE /api/community/comments/:id - Delete a comment
router.delete('/comments/:id', verifyToken, async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await Comment.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        // Allow deletion if user wrote it or if user is ADMIN
        if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Unauthorized to delete this comment' });
        }

        const postId = comment.postId;
        await comment.destroy();

        // Return updated comments for this post
        const updatedComments = await Comment.findAll({
            where: { postId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }],
            order: [['createdAt', 'ASC']]
        });

        res.json({ status: 'success', data: updatedComments, postId });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete comment' });
    }
});

// DELETE /api/community/posts/:id - Delete a post
router.delete('/posts/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        
        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

        // Allow deletion if user wrote it or if user is ADMIN
        if (post.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Unauthorized to delete this post' });
        }

        // Manually delete related likes and comments to avoid foreign key constraints
        await Like.destroy({ where: { postId: post.id } });
        await Comment.destroy({ where: { postId: post.id } });

        await post.destroy();

        res.json({ status: 'success', message: 'Post deleted successfully', postId });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ status: 'error', message: `Database error: ${error.message}` });
    }
});

export default router;
