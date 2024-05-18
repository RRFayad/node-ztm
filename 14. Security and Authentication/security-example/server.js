const fs = require("fs");
const path = require("path");
const https = require("http");
const express = require("express");

const PORT = 5000;
const app = express();

app.get("/secret", (req, res, next) => {
  return res.send("your secret value is 42");
});

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

https
  .createServer(
    {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
