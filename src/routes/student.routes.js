import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import { getProfile, updateProfile } from '../controllers/Student.controller.js';


const router = Router()

router.route("/profile").get(verifyJWT,getProfile)

router.route("/profile").put(verifyJWT,updateProfile)



export default router