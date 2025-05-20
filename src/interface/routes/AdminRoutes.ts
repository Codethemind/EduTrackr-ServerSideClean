import { Router, Request, Response } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { AdminRepository } from "../../infrastructure/repositories/AdminRepository";
import { upload } from "../../infrastructure/middleware/multer";

const router = Router();

const adminRepository = new AdminRepository();
const adminUseCase = new AdminUseCase(adminRepository);
const adminController = new AdminController(adminUseCase);


router.post('/create', upload.single('profileImage'), async (req: Request, res: Response): Promise<void> => {
  await adminController.createAdminWithImage(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await adminController.getAllAdmins(_req, res);
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  await adminController.findAdminById(req, res);
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  await adminController.updateAdmin(req, res);
});


router.put('/:id/profile-image', upload.single('profileImage'), async (req: Request, res: Response): Promise<void> => {
  await adminController.updateAdminProfileImage(req, res);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await adminController.deleteAdmin(req, res);
});

export default router;
