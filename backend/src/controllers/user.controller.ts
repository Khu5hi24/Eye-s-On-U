import { Response, NextFunction } from 'express';
import User from '../models/User.model';
import { hashPassword } from '../utils/hashPassword';
import { uploadAvatar } from '../services/cloudinary.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import Task from '../models/Task.model';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, bio, specialization } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = name || user.name;
    user.bio = bio || specialization || user.bio;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select('name email role avatar bio createdAt').sort({ name: 1 });
    const tasks = await Task.find({}).select('assignedTo status');

    const data = users.map((user) => {
      const memberTasks = tasks.filter((task) => String(task.assignedTo) === String(user._id));
      const completed = memberTasks.filter((task) => task.status === 'completed').length;
      const completionRate = memberTasks.length ? Math.round((completed / memberTasks.length) * 100) : 0;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        tasksAssigned: memberTasks.length,
        completionRate,
        status: 'active',
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file || (req as any).files?.profilePicture?.[0] || (req as any).files?.avatar?.[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'Profile picture is required.' });
    }

    const avatarUrl = await uploadAvatar(file);
    if (!avatarUrl) {
      return res.status(500).json({ success: false, message: 'Failed to upload profile picture.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
