import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {  getProfile, updateProfile,getClassStudents } from '../controllers/Teacher.controller.js';



const router =  Router()






router.route("/profile").get(verifyJWT,getProfile)

router.route("/profile").put(verifyJWT,updateProfile)

router.route("/classes/:classId/students").get(verifyJWT,getClassStudents)




export default router