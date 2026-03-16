import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/auth/password.reset.schema.js';
import { forgotPasswordController, resetPasswordController } from '../controllers/auth/password.reset.controller.js';

const router = Router();

router.post('/forgot', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset', validate(resetPasswordSchema), resetPasswordController);

export default router;
