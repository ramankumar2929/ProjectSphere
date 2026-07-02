import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshaccessToken, registerUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount: 1
    }]),
    registerUser
)

router.route("/login").post(
    upload.none(),
    loginUser
)
router.route("/logout").post(
    verifyJWT, logoutUser
)

router.route("/refreshaccessToken").post(
    refreshaccessToken
)

router.route("/changePassword").post(
    verifyJWT, changeCurrentPassword
)

router.route("/updateProfile").post(
    verifyJWT,updateAccountDetails
)

router.route("/updateavatar").post(
     verifyJWT,
     upload.single("avatar"),
     updateUserAvatar
)

router.route("/currentuser").post(
    verifyJWT,
    getCurrentUser
)









export default router