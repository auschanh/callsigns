const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const cors = require("cors");
app.use(cors());

app.use(express.json());

server.listen(3001, () => {
    console.log("SERVER RUNNING");
}); 

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});




io.on("connection", (socket) => { // every connection has a unique socket id
    console.log(`User Connecetd: ${socket.id}`); // prints socket id of connection

    socket.on("disconnect", () => {
        console.log("User Disconnected: ", socket.id);
    });
});



