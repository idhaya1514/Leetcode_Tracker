import { Router } from 'express';
import { triggerReminders, triggerCongratulations } from '../controllers/emailController';

const router = Router();

// POST /api/email/remind
router.post('/remind', triggerReminders);

// POST /api/email/congratulate
router.post('/congratulate', triggerCongratulations);

export default router;
