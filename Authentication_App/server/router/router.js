import express from "express";
const router = express.Router();

/** Import all contoller */
import * as controller from "../controllers/appController.js";
import { registerMail } from "../controllers/mailer.js";
import Auth, { localVariable } from "../middleware/Auth.js";

/** POST */
router.route("/registerMail").post(registerMail);
router.route("/register").post(controller.register);
router.route("/login").post(controller.verifyUser, controller.login);
router.route("/authenticate").post(controller.verifyUser, (req, res) => res.end());

/** GET */
router.route("/user/:username").get(controller.getUser);
router.route("/createResetSession").get(controller.createResetSession);
router.route("/verifyOTP").get(controller.verifyUser, controller.verifyOTP);
router.route("/generateOTP").get(controller.verifyUser, localVariable, controller.generateOTP);

/** PUT */
router.route("/updateUser").put(Auth, controller.updateUser);
router.route("/resetPassword").put(controller.verifyUser, controller.resetPassword);

export default router;
