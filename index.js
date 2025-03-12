import express from "express";
import cisco from "./lib/cisco.js";
import directory from "./lib/directory.js";
import { port, urlServer } from "./config.js";
const app = express();

app.use("/", cisco);
app.use("/", directory);

// Main page
app.get("/", (_req, res) => {
  res.send(`Cisco Phone Services: ${urlServer}/Cisco/services.xml`);
});

app.listen(port, () => {
  console.log(`Server running at ${urlServer}`);
});
