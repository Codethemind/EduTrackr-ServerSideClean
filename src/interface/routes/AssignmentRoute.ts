import { Router } from 'express';
import { AssignmentController, assignmentUpload, submissionUpload } from '../controllers/AssignmentController';
import { AssignmentUseCase } from '../../application/useCases/AssignmentUseCase';
import { AssignmentRepository } from '../../infrastructure/repositories/AssignmentRepository';
import { authenticateToken, authorizeRoles } from '../../infrastructure/middleware/auth';
import { validateAssignment, validateSubmission, validateGrade } from '../../infrastructure/middleware/validation';

const router = Router();

// Initialize dependencies
const assignmentRepository = new AssignmentRepository();
const assignmentUseCase = new AssignmentUseCase(assignmentRepository);
const assignmentController = new AssignmentController(assignmentUseCase);

// Create assignment (Teacher only)
router.post(
  '/',
  // authenticateToken,
  // authorizeRoles(['teacher']),
  // validateAssignment,
  assignmentUpload.array('attachments', 5), // Allow up to 5 files
  async (req, res) => {
    await assignmentController.createAssignment(req, res);
  }
);

// Get all assignments (with filters)
router.get(
  '/',
  // authenticateToken,
  async (req, res) => {
    await assignmentController.getAssignments(req, res);
  }
);

// Get assignments by department ID (accessible by all authenticated users)
router.get(
  '/department/:departmentId',
  async (req, res) => {
    await assignmentController.getAssignmentsByDepartment(req, res);
  }
);

// Get assignments by teacher ID (Teacher only)
router.get(
  '/teacher/:teacherId',
  async (req, res) => {
    await assignmentController.getAssignmentsByTeacher(req, res);
  }
);

// Get assignment by ID (accessible by all authenticated users)
router.get(
  '/:id',
  // authenticateToken,
  async (req, res) => {
    await assignmentController.getAssignmentById(req, res);
  }
);

// Update assignment (Teacher only)
router.put(
  '/:id',
  // authenticateToken,
  // authorizeRoles(['teacher']),
  // validateAssignment,
  async (req, res) => {
    await assignmentController.updateAssignment(req, res);
  }
);

// Delete assignment (Teacher only)
router.delete(
  '/:id',
  // authenticateToken,
  // authorizeRoles(['teacher']),
  async (req, res) => {
    await assignmentController.deleteAssignment(req, res);
  }
);

// Submit assignment (Student only)
router.post(
  '/:id/submit',
  submissionUpload.array('files', 5), // Allow up to 5 files
  // authenticateToken,
  // authorizeRoles(['student']),
  validateSubmission,
  async (req, res) => {
    await assignmentController.submitAssignment(req, res);
  }
);

// Grade submission (Teacher only)
router.post(
  '/:id/grade',
  // authenticateToken,
  // authorizeRoles(['teacher']),
  // validateGrade,
  async (req, res) => {
    await assignmentController.gradeMultipleSubmissions(req, res);
  }
);

// Get all submissions for an assignment (Teacher only)
router.get(
  '/:id/submissions',
  // authenticateToken,
  // authorizeRoles(['teacher']),
  async (req, res) => {
    await assignmentController.getSubmissions(req, res);
  }
);

export default router; 