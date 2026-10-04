import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller.js';

const router = Router();

router.get('/', TodoController.getTodos);
router.get('/:id', TodoController.getTodoById);
router.post('/', TodoController.createTodo);
router.put('/:id', TodoController.updateTodo);
router.delete('/:id', TodoController.deleteTodo);
router.patch('/:id/complete', TodoController.completeTodo);
router.post('/:id/schedule', TodoController.scheduleTodo);

export default router;
