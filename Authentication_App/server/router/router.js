import express from "express";

const router = express.Router();

/** Import all contoller */
import * as controller from "../controllers/appController.js"

/** POST */
router.route('/register').post(controller.register)
// router.route('/registerMail').post()
router.route('/authenticate').post((req, res) => res.end())
router.route('/login').post(controller.login)

/** GET */
router.route('/user/:username').get(controller.getUser)
router.route('/generateotp').get(controller.generateOTP)
router.route('/verifyotp').get(controller.verifyOTP)
router.route('/createresetsession').get(controller.createResetSession)

/** PUT */
router.route('/updateuser').put(controller.updateUser)
router.route('/resetpassword').put(controller.resetPassword)
export default router;