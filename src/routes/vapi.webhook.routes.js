import { Router } from 'express';
import { handleWebhook } from '../controllers/vapi.webhook.controller.js';

const router = Router();

// POST /api/vapi/webhook
// Listens for incoming data from Vapi after a call has ended.
router.post('/webhook', handleWebhook);

export default router;