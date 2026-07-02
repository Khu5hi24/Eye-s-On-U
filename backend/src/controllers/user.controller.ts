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
    const { name, email, bio, specialization, phone, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address is already in use.' });
      }
      user.email = email.toLowerCase();
    }

    user.name = name || user.name;
    user.bio = bio ?? user.bio;
    user.phone = typeof phone === 'string' ? phone : user.phone;
    user.gender = typeof gender === 'string' ? gender : user.gender;

    if (typeof req.body.avatar !== 'undefined') {
      user.avatar = req.body.avatar;
    }

    if (typeof specialization !== 'undefined' && req.user?.role === 'admin') {
      user.specialization = specialization;
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const { id } = req.params;
    const { role, specialization } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (typeof role === 'string') {
      const allowedRoles = ['admin', 'employee', 'user'] as const;
      if (allowedRoles.includes(role as any)) {
        user.role = role as typeof allowedRoles[number];
      }
    }

    if (typeof specialization === 'string') {
      user.specialization = specialization;
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select('name email role avatar bio specialization phone gender createdAt').sort({ name: 1 });
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
        specialization: user.specialization || '',
        phone: user.phone || '',
        gender: user.gender || '',
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
