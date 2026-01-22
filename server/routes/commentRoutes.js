import express from 'express';
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  toggleCommentStatus
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/', createComment);
router.get('/', getComments);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.patch('/:id/toggle-status', toggleCommentStatus);

export default router;
