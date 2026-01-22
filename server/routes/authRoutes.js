import express from 'express';
import { signup, login, refresh, logout, getLoggedInUsers, getAllAuthUsers, changePassword, updateAuthUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/logged-in', getLoggedInUsers);
router.get('/all', getAllAuthUsers);
router.post('/change-password', changePassword);
router.put('/user/:userId', updateAuthUser);

export default router;
