const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = require("./routes/api"); 
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);
app.listen(PORT, function () {
console.log(`KAKAO CHATBOT SERVER IS RUNNING ON ${PORT}`);});