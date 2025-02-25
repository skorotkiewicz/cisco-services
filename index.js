import express from "express";
import cisco from "./cisco.js";
import { port, urlServer } from "./config.js";
const app = express();

app.use("/", cisco);

app.listen(port, () => {
  console.log(`Server running at ${urlServer}`);
});
