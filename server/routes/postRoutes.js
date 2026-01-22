import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePostStatus,
  getAllActivePosts
} from '../controllers/postController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadPostImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, uploadPostImage.single('image'), createPost);
router.get('/allActive', getAllActivePosts);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', authenticateToken, uploadPostImage.single('image'), updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/toggle-status', togglePostStatus);
export default router;
