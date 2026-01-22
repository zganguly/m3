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

const router = express.Router();

router.post('/', createPost);
router.get('/allActive', getAllActivePosts);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/toggle-status', togglePostStatus);
export default router;
