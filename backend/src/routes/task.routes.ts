import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';

const router = Router();

router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.patch('/:id/complete', TaskController.completeTask);

export default router;
