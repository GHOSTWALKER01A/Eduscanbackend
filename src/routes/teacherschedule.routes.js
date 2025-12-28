import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getTeacherSchedule,
    rescheduleClass,
    cancelClass
 } from '../controllers/Schedule.controller.js';




const router = Router()



router.route("/").get(verifyJWT,getTeacherSchedule)

router.route("/reschedule").post(verifyJWT,rescheduleClass)

router.route('/cancel').post(verifyJWT,cancelClass)

export default router