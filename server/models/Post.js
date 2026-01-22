import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: null
  },
  createdByName: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ slug: 1 });
postSchema.index({ isActive: 1 });
postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post;
