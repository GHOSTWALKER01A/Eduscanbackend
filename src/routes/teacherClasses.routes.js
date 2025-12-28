import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import { startQrSession, getQrToken,
    endQrSession,
    scanQRForAttendance,
    getTodayClasses,
    cancelClass,
    rescheduleClass } from '../controllers/teacherAttendance.controller.js';









const router =  Router()





router.route("/today").get(verifyJWT,getTodayClasses)

router.route("/qr/start/:classId").post(verifyJWT,startQrSession)

router.route("/qr/current/:sessionId").get(getQrToken)

router.route("/qr/end/:classId").post(verifyJWT,endQrSession)

router.route("/attendance/scan").post(verifyJWT,scanQRForAttendance)

router.route("/cancel/:classId").put(verifyJWT,cancelClass)

router.route("/reschedule/:classId").put(verifyJWT,rescheduleClass)


export default router