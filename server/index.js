const express = require("express");
const app = express();
const wordFile = require("./words/words.json");

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
app.use(cors());

app.use(express.json());

const { csvJSON } = require("./words/convertCsv");

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/getMysteryWord", (req, res) => {
  const mysteryWord = getMysteryWord();
  res.status(200).send(mysteryWord);
});

app.post("/newJsonFile", (req, res) => {
  const newList = JSON.parse(csvJSON());
  const newListWord = newList[Math.floor(Math.random() * newList.length)].word;
  console.log(newListWord);
  res.status(200);
});

const getMysteryWord = () => {
  const randomWord = wordFile[Math.floor(Math.random() * wordFile.length)].Word;
  console.log(randomWord);
  return randomWord;
};

io.on("connection", (socket) => {
  // every connection has a unique socket id
  console.log(`User Connected: ${socket.id}`); // prints socket id of connection

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});
