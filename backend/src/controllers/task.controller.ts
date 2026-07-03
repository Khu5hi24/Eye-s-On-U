import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task.model';
import { AuthRequest } from '../middlewares/auth.middleware';

const isAdmin = (req: AuthRequest) => req.user?.role === 'admin';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const { title, description, priority, status, dueDate, assignedTo } = req.body;
    const createdBy = req.user._id;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      createdBy,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = isAdmin(req)
      ? {}
      : { assignedTo: req.user._id };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role avatar bio')
      .populate('createdBy', 'name email role avatar bio')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const updatePayload = req.body ?? {};
    const task = await Task.findByIdAndUpdate(req.params.id, updatePayload, { returnDocument: 'after' })
      .populate('assignedTo', 'name email role avatar bio')
      .populate('createdBy', 'name email role avatar bio');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.body?.status as string | undefined;
    const task = await Task.findOneAndUpdate(
      isAdmin(req) ? { _id: req.params.id } : { _id: req.params.id, assignedTo: req.user._id },
      { status },
      { returnDocument: 'after' }
    )
      .populate('assignedTo', 'name email role avatar bio')
      .populate('createdBy', 'name email role avatar bio');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
