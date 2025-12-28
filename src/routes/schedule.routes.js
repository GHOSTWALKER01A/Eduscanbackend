import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getSchedule} from '../controllers/Schedule.controller.js';




const router = Router()

router.route("/").get(verifyJWT, getSchedule)


export default router