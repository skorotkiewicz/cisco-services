import express from "express";
import cisco from "./lib/cisco.js";
import directory from "./lib/directory.js";
import { port, urlServer } from "./config.js";
const app = express();

app.use("/", cisco);
app.use("/", directory);

// Main page
app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cisco Phone Services</title>
</head>
<body>
  <main>
    <h2>Cisco Phone Services</h2>
    <p>
      Available services:
      <a href="${urlServer}/Cisco/services.xml">${urlServer}/Cisco/services.xml</a>
    </p>
  </main>
</body>
</html>`);
});

app.listen(port, () => {
  console.log(`Server running at ${urlServer}`);
});
