import Post from '../models/Post.js';
import { renameImageFile, deleteImageFile } from '../middleware/uploadMiddleware.js';
import fs from 'fs';

const generateSlug = (title) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const slug = req.body.slug || generateSlug(req.body.title);
    const postData = {
      ...req.body,
      slug,
      createdBy: req.authUser?.id || null,
      createdByName: req.authUser?.name || null,
      image: null
    };
    
    const post = new Post(postData);
    await post.save();

    const imageFilename = renameImageFile(req.file.path, post._id.toString());
    if (imageFilename) {
      post.image = imageFilename;
      await post.save();
    }

    await post.populate('author', 'name email');
    res.status(201).json(post);
  } catch (error) {
    if (req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    res.status(400).json({ error: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllActivePosts = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      if (req.file && req.file.path) {
        const fs = await import('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      return res.status(404).json({ error: 'Post not found' });
    }

    if (req.body.title && !req.body.slug) {
      req.body.slug = generateSlug(req.body.title);
    }

    if (req.file) {
      if (post.image) {
        deleteImageFile(post.image);
      }
      const imageFilename = renameImageFile(req.file.path, post._id.toString());
      if (imageFilename) {
        req.body.image = imageFilename;
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json(updatedPost);
  } catch (error) {
    if (req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.image) {
      deleteImageFile(post.image);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const togglePostStatus = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.isActive = !post.isActive;
    await post.save();
    await post.populate('author', 'name email');
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
