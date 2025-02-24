import express from "express";
import cisco from "./cisco.js";
const app = express();
const port = 3000;

app.use("/", cisco);

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
