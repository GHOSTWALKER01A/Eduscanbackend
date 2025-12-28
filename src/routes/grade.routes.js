import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { getGradesBySemester } from "../controllers/Grade.controller.js";


const router = Router()

router.route("/semester/:semester").get(verifyJWT, getGradesBySemester)


export default router