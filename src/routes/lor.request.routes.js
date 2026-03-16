import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { ROLES } from '../config/constants.js';
import {
  createStudentLorRequestSchema,
  updateFacultyLorRequestStatusSchema
} from '../validators/lor/lor.request.schema.js';
import {
  createStudentLorRequestController,
  getApprovedFacultyController,
  listFacultyLorRequestsController,
  listStudentLorRequestsController,
  updateFacultyLorRequestStatusController
} from '../controllers/lor/lor.request.controller.js';

const router = Router();

router.get('/faculty-list', authMiddleware, getApprovedFacultyController);

router.post(
  '/student/requests',
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  validate(createStudentLorRequestSchema),
  createStudentLorRequestController
);

router.get('/student/requests', authMiddleware, roleMiddleware(ROLES.STUDENT), listStudentLorRequestsController);

router.get('/faculty/requests', authMiddleware, roleMiddleware(ROLES.FACULTY), listFacultyLorRequestsController);

router.patch(
  '/faculty/requests/:requestId/status',
  authMiddleware,
  roleMiddleware(ROLES.FACULTY),
  validate(updateFacultyLorRequestStatusSchema),
  updateFacultyLorRequestStatusController
);

export default router;
