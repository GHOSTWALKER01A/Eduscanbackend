import { Router } from "express";
import { loginUser, registerUser, logoutUser, sendOTP, verifyOTP, resetPassword } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =  Router()

router.route("/register").post(
    
    upload.fields([
        {
          name: 'profilephoto',
          maxCount: 1
    }
]),
    
        registerUser
    )


router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route('/send-otp').post(verifyJWT, sendOTP)

router.route('/verify-otp').post(verifyJWT, verifyOTP )

router.route('/reset-password').post( verifyJWT, resetPassword )




export default router