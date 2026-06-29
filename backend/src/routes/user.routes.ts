import { Router } from 'express';
import { getProfile, getTeamMembers, updateProfile, updateAvatar, deleteAccount } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload as uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(protect);
router.get('/profile', getProfile);
router.get('/team', getTeamMembers);
router.put('/profile', updateProfile);
router.put('/avatar', uploadMiddleware.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), updateAvatar);
router.delete('/delete-account', deleteAccount);

export default router;
