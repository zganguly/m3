import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

commentSchema.index({ createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ post: 1 });
commentSchema.index({ isActive: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
