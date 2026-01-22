import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    await comment.populate('author', 'name email');
    await comment.populate('post', 'title slug');
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const postId = req.query.postId;

    const query = {};
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    if (postId) {
      query.post = postId;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name email')
      .populate('post', 'title slug');
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('author', 'name email')
      .populate('post', 'title slug');
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleCommentStatus = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    comment.isActive = !comment.isActive;
    await comment.save();
    await comment.populate('author', 'name email');
    await comment.populate('post', 'title slug');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
