import { Router } from 'express';
import { BucketController } from '../controllers/bucket.controller.js';

const router = Router();

router.get('/', BucketController.getItems);
router.get('/:id', BucketController.getItemById);
router.post('/', BucketController.createItem);
router.put('/:id', BucketController.updateItem);
router.delete('/:id', BucketController.deleteItem);
router.patch('/:id/status', BucketController.updateStatus);

export default router;
