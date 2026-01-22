import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ isActive: true });
    const inactivePosts = await Post.countDocuments({ isActive: false });

    const totalComments = await Comment.countDocuments();

    const topUsersByPosts = await Post.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          postCount: 1
        }
      }
    ]);

    const topPostsByComments = await Comment.aggregate([
      {
        $group: {
          _id: '$post',
          commentCount: { $sum: 1 }
        }
      },
      {
        $sort: { commentCount: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $unwind: '$post'
      },
      {
        $project: {
          postId: '$_id',
          postTitle: '$post.title',
          postSlug: '$post.slug',
          commentCount: 1
        }
      }
    ]);

    const topUsersByComments = await Comment.aggregate([
      {
        $group: {
          _id: '$author',
          commentCount: { $sum: 1 }
        }
      },
      {
        $sort: { commentCount: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          commentCount: 1
        }
      }
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const postsByMonth = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      }
    ]);

    const commentsByMonth = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      posts: {
        total: totalPosts,
        active: activePosts,
        inactive: inactivePosts
      },
      comments: {
        total: totalComments
      },
      topUsersByPosts,
      topPostsByComments,
      topUsersByComments,
      postsByMonth,
      commentsByMonth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
