import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";
import UserModel from "../model/User.model.js";

export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

/** POST: http://localhost:8000/api/register
 * @param: {
 * "username": "example123",
 * "password": "admin123",
 * "email": "example@gmail.com",
 * "firstname": "bill",
 * "lastname": "william",
 * "mobile": 1234567891
 * "address": "Apt, 556, kulas light, india",
 * profile: ""
 * }
 */
export async function register(req, res) {
  try {
    const { username, password, email, profile } = req.body;

    // check the existing user
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: "Please use unique username" });
    }

    // check for existing email
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).send({ error: "Please use unique Email" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || "",
        email,
      });

      const savedUser = await user.save();
      res.status(201).send({ msg: "User Register Successfully" });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

/** POST: http://localhost:8000/api/login
 * @param: {
 * "username": "example123",
 * "password": "admin123"
 * }
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(404).send({ error: "Username not Found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).send({ error: "Password doesn't match" });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      ENV.secret,
      { expiresIn: "24h" }
    );

    return res.status(200).send({
      msg: "Login Successful...!",
      username: user.username,
      token,
    });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET: http://localhost:8000/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    UserModel.findOne({ username }, (err, user) => {
      if (err) return res.status(500).send({ err });
      if (!user)
        return res.status(501).send({ error: "Couldn't find the user" });

      // remove password from user and convert to object and remove unnecessary data
      const { password, ...rest } = Object.assign({}, user.toJSON());
      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data." });
  }
}

/** PUT: http://localhost:8000/api/updateUser
 * @param: {
 * "id": "<userid>"
 * }
 * body {
 * firstname: "",
 * lastname: "",
 * profile: ""
 *
 * }
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // update the data
      UserModel.updateOne({ _id: userId }, body, function (err, data) {
        if (err) throw err;

        return res.status(201).send({ msg: "Record Updated...!" });
      });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:8000/api/generateotp */
export async function generateOTP(req, res) {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8000/api/verifyotp */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP to null again after one use
    req.app.locals.resetSession = true;
    return res.status(201).send({ msg: "Verified Successfully" });
  }

  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8000/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag : req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired" });
}

/** PUT: http://localhost:8000/api/resetpassword */
export async function resetPassword(req, res) {
  try {
    if (!res.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired" });
    const { username, password } = req.body;

    try {
      UserModel.findOne({ username })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              UserModel.updateOne(
                { username: user.username },
                { password: hashedPassword },
                (err, data) => {
                  if (err) throw err;
                  req.app.locals.resetSession = false;
                  return res.status(201).send({ msg: "Record Updated!" });
                }
              );
            })
            .catch((error) =>
              res.status(500).send({ error: "Enabled to hashed password" })
            );
        })
        .catch((error) =>
          res.status(404).send({ error: "Username not found" })
        );
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  } catch (error) {
    return res.status(401).send({ error: error.message });
  }
}
