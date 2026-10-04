import { Router } from 'express';
import { GoogleController } from '../controllers/google.controller.js';

const router = Router();

router.get('/auth', GoogleController.getAuth);
router.get('/callback', GoogleController.handleCallback);
router.get('/status', GoogleController.getStatus);
router.post('/disconnect', GoogleController.disconnect);
router.get('/events', GoogleController.getEvents);

export default router;
