import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import { registerStudentSchema, loginStudentSchema } from '../validators/auth/auth.user.schema.js';
import { registerStudentController, loginStudentController } from '../controllers/auth/auth.user.controller.js';

const router = Router();

router.post('/register', validate(registerStudentSchema), registerStudentController);
router.post('/login', validate(loginStudentSchema), loginStudentController);

export default router;
