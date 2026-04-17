import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { ROLES } from '../config/constants.js';
import { loginAdminSchema, adminUpdateFacultyProfileSchema } from '../validators/auth/auth.admin.schema.js';
import {
  adminUpdateFacultyProfileController,
  deleteFacultyController,
  listAdminFacultiesController,
  listAdminLorRequestsController,
  listAdminStudentsController,
  loginAdminController,
  rejectFacultyController,
  toggleFacultyActiveController
} from '../controllers/auth/auth.admin.controller.js';

const router = Router();

router.post('/login', validate(loginAdminSchema), loginAdminController);
router.get('/students', authMiddleware, roleMiddleware(ROLES.ADMIN), listAdminStudentsController);
router.get('/faculties', authMiddleware, roleMiddleware(ROLES.ADMIN), listAdminFacultiesController);
router.get('/lor-requests', authMiddleware, roleMiddleware(ROLES.ADMIN), listAdminLorRequestsController);

router.patch('/faculties/:facultyId/reject', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('facultyId'), rejectFacultyController);
router.patch('/faculties/:facultyId/toggle-active', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('facultyId'), toggleFacultyActiveController);
router.patch('/faculties/:facultyId/profile', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('facultyId'), validate(adminUpdateFacultyProfileSchema), adminUpdateFacultyProfileController);
router.delete('/faculties/:facultyId', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('facultyId'), deleteFacultyController);

export default router;
