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
  res.json('register route')
}

/** POST: http://localhost:8000/api/login
 * @param: {
 * "username": "example123",
 * "password": "admin123"
 * }
 */
export async function login(req, res) {
  res.json('register route')
}