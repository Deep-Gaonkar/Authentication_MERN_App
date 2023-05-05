import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";

/** Middleware for varify user */
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == 'GET' ? req.query : req.body;
        
        // check the user existance
        let exist = await UserModel.findOne({ username })
        if (!exist) return res.status(404).send({ error: "Can't find User!" })
        next()        
    } catch(error) {
        return res.status(404).send({ error: "Authentication Error" })
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
    const existUsername = new Promise((resolve, reject) => {
      UserModel.findOne({ username }, function (err, user) {
        if (err) reject(new Error(err));
        if (user) reject({ error: "Please use unique username" });

        resolve();
      });
    });

    // check for existing email
    const existEmail = new Promise((resolve, reject) => {
      UserModel.findOne({ email }, function (err, email) {
        if (err) reject(new Error(err));
        if (email) reject({ error: "Please use unique Email" });

        resolve();
      });
    });

    Promise.all([existUsername, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
              });

              // return save result as a response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: "User Register Successfully" })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error });
      });
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8000/api/login
 * @param: {
 * "username": "example123",
 * "password": "admin123"
 * }
 */
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Don't have Password" });

            // create jwt token
            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful...!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET: http://localhost:8000/api/user/example123 */
export async function getUser(req, res) {
  res.json("Get User");
}

/** PUT: http://localhost:8000/api/updateuser
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
  res.json("Update User");
}

/** GET: http://localhost:8000/api/generateotp */
export async function generateOTP(req, res) {
  res.json("Generate OTP");
}

/** GET: http://localhost:8000/api/verifyotp */
export async function verifyOTP(req, res) {
  res.json("verify OTP");
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8000/api/createresetsession */
export async function createResetSession(req, res) {
  res.json("create reset");
}

/** PUT: http://localhost:8000/api/resetpassword */
export async function resetPassword(req, res) {
  res.json("Reset Password");
}
