import jwt from "jsonwebtoken";
import ENV from "../config.js";

/** Auth middlware */
export default async function Auth(req, res, next) {
  try {
    // access authorize header to validate request
    const token = req.headers.authorization.split(" ")[1];

    // retrive the user details of the logged in User
    const decodedToken = await jwt.verify(token, ENV.secret);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ erro: "Authentication Failed!" });
  }
}

export function localVariable(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}
