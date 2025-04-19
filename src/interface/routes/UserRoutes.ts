
import { Router } from 'express';
import { getTotalUsers } from '../controllers/UserController';


const router: Router = Router();

router.get('/', getTotalUsers);

export default router;


