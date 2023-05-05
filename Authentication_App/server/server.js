import cors from "cors";
import morgan from "morgan";
import express from "express";
import router from "./router/router.js";
import connect from "./database/connection.js";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");

/** HTTP Request */
app.get("/", (req, res) => res.json("Home get request"));

/** API Routes */
app.use("/api", router);

/** start sever only when we have a valid connection */
connect().then(() => {
  try { app.listen(PORT, () => console.log(`Server connected to http://localhost:${PORT}`)) }
  catch (error) { console.log("Cannot connect to the server") }
})
.catch((error) => console.log("Invalid Database Connection"));
