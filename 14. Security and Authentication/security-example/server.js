const path = require("path");
const express = require("express");

const PORT = 5000;
const app = express();

app.get("/secret", (req, res, next) => {
  return res.send("your secret value is 42");
});

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
