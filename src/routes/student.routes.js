import { Router } from "express";
import { registerStudent } from "../controllers/student.controllers";

const router =  Router()

router.route("/register").post(registerStudent)

export default router