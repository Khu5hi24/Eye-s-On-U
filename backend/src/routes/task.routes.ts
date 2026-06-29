import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, updateTaskStatus } from '../controllers/task.controller';

const router = Router();
router.use(protect);

router.post('/create', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
