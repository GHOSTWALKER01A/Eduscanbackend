import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { getAssignments,
    createAssignment, 
    updateAssignment, deleteAssignment} from "../controllers/Assignment.controller.js";



 const router = Router()


 router.route("/").get(verifyJWT,getAssignments)

 router.route("/").post(verifyJWT,createAssignment)

 router.route("/:id").put(verifyJWT, updateAssignment)

 router.route("/:id").delete(deleteAssignment)


 export default router