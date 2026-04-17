import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware, { verifyLorRequestOwnership } from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { ROLES } from '../config/constants.js';
import {
  createStudentLorRequestSchema,
  facultyEditLorRequestContentSchema,
  updateFacultyLorRequestStatusSchema
} from '../validators/lor/lor.request.schema.js';
import {
  adminCancelLorRequestController,
  adminDeleteLorRequestController,
  adminReassignLorRequestController,
  createStudentLorRequestController,
  downloadStudentLorLetterController,
  facultyEditLorRequestContentController,
  getApprovedFacultyController,
  listFacultyLorRequestsController,
  listStudentLorRequestsController,
  previewFacultyLorLetterController,
  updateFacultyLorRequestStatusController
} from '../controllers/lor/lor.request.controller.js';
import { getLorConfigController, updateLorConfigController } from '../controllers/lor/lor.config.controller.js';
import { verifyLorCertificateController } from '../controllers/lor/lor.verify.controller.js';

const router = Router();

// Public — no auth
router.get('/verify/:token', verifyLorCertificateController);

// Public config — students & faculty need this to render forms
router.get('/config', getLorConfigController);

router.get('/faculty-list', authMiddleware, getApprovedFacultyController);

// Admin config management
router.patch('/admin/config', authMiddleware, roleMiddleware(ROLES.ADMIN), updateLorConfigController);

router.post(
  '/student/requests',
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  validate(createStudentLorRequestSchema),
  createStudentLorRequestController
);

router.get('/student/requests', authMiddleware, roleMiddleware(ROLES.STUDENT), listStudentLorRequestsController);

router.get(
  '/student/requests/:requestId/letter',
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  validateObjectId('requestId'),
  verifyLorRequestOwnership,
  downloadStudentLorLetterController
);

router.get('/faculty/requests', authMiddleware, roleMiddleware(ROLES.FACULTY), listFacultyLorRequestsController);

router.patch(
  '/faculty/requests/:requestId/content',
  authMiddleware,
  roleMiddleware(ROLES.FACULTY),
  validateObjectId('requestId'),
  verifyLorRequestOwnership,
  validate(facultyEditLorRequestContentSchema),
  facultyEditLorRequestContentController
);

router.get(
  '/faculty/requests/:requestId/preview',
  authMiddleware,
  roleMiddleware(ROLES.FACULTY),
  validateObjectId('requestId'),
  verifyLorRequestOwnership,
  previewFacultyLorLetterController
);

router.patch(
  '/faculty/requests/:requestId/status',
  authMiddleware,
  roleMiddleware(ROLES.FACULTY),
  validateObjectId('requestId'),
  verifyLorRequestOwnership,
  validate(updateFacultyLorRequestStatusSchema),
  updateFacultyLorRequestStatusController
);

router.patch('/admin/:requestId/cancel', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('requestId'), adminCancelLorRequestController);
router.patch('/admin/:requestId/reassign', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('requestId'), adminReassignLorRequestController);
router.delete('/admin/:requestId', authMiddleware, roleMiddleware(ROLES.ADMIN), validateObjectId('requestId'), adminDeleteLorRequestController);

export default router;
