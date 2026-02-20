import { Router } from 'express';
import authUserRoutes from './auth.user.routes.js';
import authFacultyRoutes from './auth.faculty.routes.js';
import authAdminRoutes from './auth.admin.routes.js';
import authPasswordRoutes from './auth.password.routes.js';
import lorRequestRoutes from './lor.request.routes.js';

const router = Router();

router.use('/auth/student', authUserRoutes);
router.use('/auth/faculty', authFacultyRoutes);
router.use('/auth/admin', authAdminRoutes);
router.use('/auth/password', authPasswordRoutes);
router.use('/lor', lorRequestRoutes);

export default router;
