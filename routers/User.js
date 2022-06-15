import express from "express";
import { register, verify,login,logout, Profile, updateProfile, updatePassword, forgotPassword, resetPassword } from "../controllers/User.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(register);


router.route("/verify").post(isAuthenticated,verify);


router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticated,Profile);

router.route("/updateprofile").put(isAuthenticated, updateProfile);

router.route("/updatepassword").put(isAuthenticated,updatePassword);

router.route("/forgotpassword").post(forgotPassword);

router.route("/resetpassword").put(resetPassword);




 export   default router;
