import express from "express";

const router = express.Router();

/** POST */
router.route('/register').post((req, res) => res.json('register'))
router.route('/registerMail').post()
router.route('/authenticate').post()
router.route('/login').post()

/** GET */
router.route('/user/:username').get()
router.route('/generateOTP').get()
router.route('/verifyOTP').get()
router.route('/createResetSession').get()

/** PUT */
router.route('/updateUser').put()
router.route('/resetPassword').put()
export default router;