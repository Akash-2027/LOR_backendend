import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { loginAdminSchema } from '../validators/auth/auth.admin.schema.js';
import { loginAdminController } from '../controllers/auth/auth.admin.controller.js';

const router = Router();

router.post('/login', validate(loginAdminSchema), loginAdminController);

export default router;
