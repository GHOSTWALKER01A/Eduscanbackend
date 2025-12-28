import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { markAttendanceViaQR , geoLocation, enrollMac } from "../controllers/Attendence.controller.js";

const router = Router()


router.route('/scan').post(verifyJWT,markAttendanceViaQR)

router.route('/geo').post( verifyJWT, geoLocation)

router.route('/enroll-mac').post( verifyJWT, enrollMac)



export default router