import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { ROLES } from '../config/constants.js';
import {
  registerFacultySchema,
  loginFacultySchema,
  approveFacultySchema
} from '../validators/auth/auth.faculty.schema.js';
import {
  registerFacultyController,
  loginFacultyController,
  approveFacultyController
} from '../controllers/auth/auth.faculty.controller.js';

const router = Router();

router.post('/register', validate(registerFacultySchema), registerFacultyController);
router.post('/login', validate(loginFacultySchema), loginFacultyController);
router.patch(
  '/approve/:facultyId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(approveFacultySchema),
  approveFacultyController
);

export default router;
