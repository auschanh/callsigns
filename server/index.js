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

let socketLookup = [];

let roomLookup = [];

io.on("connection", (socket) => { // every connection has a unique socket id

    console.log(`User Connected: ${socket.id}`); // prints socket id of connection

    console.log(io.sockets.adapter.sids);
    console.log(io.sockets.adapter.nickname);

    socket.on("gameInfo", ({ username, roomName, numPlayers, aiPlayers }) => {

        console.log(username, roomName, numPlayers, aiPlayers);

        socket.nickname = username;

        socket.join(`room-${roomLookup.length}`);

        // either works to send a message to the room
        // io.sockets.in(`room-${roomLookup.length}`).emit('connectToRoom', "You are in room no. " + roomLookup.length);
        io.to(`room-${roomLookup.length}`).emit('connectToRoom', "You are in room no. " + roomLookup.length);

        socketLookup.push({

            username: username,
            socketID: socket.id,

        });

        roomLookup.push({

            roomID: `room-${roomLookup.length}`,
            roomName: roomName,
    
        });

        console.log(socketLookup);

        console.log(roomLookup);

        // list of all rooms
        console.log(io.sockets.adapter);

        console.log(`nickname set: ${socket.nickname}`);

        const socketIDsInRoom = io.sockets.adapter.rooms.get(`room-${roomLookup.length - 1}`);

        // which socketIDs are in this room?
        console.log(socketIDsInRoom);

        // how many socketIDs are in this room?
        console.log(io.sockets.adapter.rooms.get(`room-${roomLookup.length - 1}`).size);

        // which rooms is this socketID in?
        console.log(socket.rooms);

        // full socket information
        // console.log(io.sockets.sockets.get(socket.id));
       
    });

    socket.on("disconnect", () => {

        socketLookup = socketLookup.filter((user) => {user.socketID !== socket.id});

        console.log(socketLookup);

        console.log("User Disconnected: ", socket.id);

    });

});



