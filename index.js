import express from "express";
import cisco from "./cisco.js";
import directoryRouter from "./directory.js";
import { port, urlServer } from "./config.js";
const app = express();

app.use("/", cisco);
app.use("/", directoryRouter);

app.listen(port, () => {
  console.log(`Server running at ${urlServer}`);
});
