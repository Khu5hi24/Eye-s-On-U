import { Schema, model, Document, Types } from 'mongoose';
import { ITask } from '../types';

export interface ITaskModel extends ITask, Document {}

const taskSchema = new Schema<ITaskModel>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
    status: { type: String, required: true, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
    dueDate: { type: Date, required: true },
    assignedTo: { type: Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default model<ITaskModel>('Task', taskSchema);
