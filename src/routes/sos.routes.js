import { Router } from 'express';
import { createSOSRequest } from '../controllers/sos.controller.js';

const router = Router();

// POST /api/sos
// Handles the initial SOS request from a user's device.
router.post('/', createSOSRequest);

export default router;