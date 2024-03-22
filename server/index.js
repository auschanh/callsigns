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

let roomLookup = [];

io.on("connection", (socket) => { // every connection has a unique socket id

    console.log(`User Connected: ${socket.id}`); // prints socket id of connection

    const getSocketInfo = () => {

        let usernames = [];

        [...io.sockets.sockets.values()].forEach((socketObj) => {

            let temp = {

                username: socketObj.username,
                socketID: socketObj.id

            };

            usernames.push(temp);

    
        });

        let activeUsers = Array.from(io.sockets.adapter.sids, ([socketID, rooms]) => {

            for (let i = 0; i < usernames.length; i++) {

                if (socketID === usernames[i].socketID) {

                    return {
                        
                        username: usernames[i].username,
                        socketID: socketID,
                        rooms: rooms
                    
                    }

                }

            } 
        
        });

        console.log(activeUsers);

    }

    // // list of all rooms (room name => people in this room)
    // console.log(io.sockets.adapter.rooms);

    // // list of all people (person => rooms they are in)
    // console.log(io.sockets.adapter.sids);

    // // array of rooms
    // console.log([...io.sockets.adapter.rooms.keys()]);

    // array of people
    // console.log([...io.sockets.adapter.sids.keys()]);

    // // full socket information
    // console.log(io.sockets.sockets.get(socket.id));

    getSocketInfo();
    

    socket.on("gameInfo", ({ username, roomName, numPlayers, aiPlayers }) => {

        console.log(username, roomName, numPlayers, aiPlayers);

        socket.username = username;

        socket.join(`room-${roomLookup.length}`);

        // either works to send a message to the room
        // io.sockets.in(`room-${roomLookup.length}`).emit('connectToRoom', "You are in room no. " + roomLookup.length);
        io.to(`room-${roomLookup.length}`).emit('connectToRoom', "You are in room no. " + roomLookup.length);

        roomLookup.push({

            roomID: `room-${roomLookup.length}`,
            roomName: roomName,
    
        });

        // console.log(roomLookup);

        console.log(`username set: ${socket.username}`);

        // const socketIDsInRoom = io.sockets.adapter.rooms.get(`room-${roomLookup.length - 1}`);

        // which socketIDs are in this room?
        // console.log(socketIDsInRoom);

        // how many socketIDs are in this room?
        // console.log(io.sockets.adapter.rooms.get(`room-${roomLookup.length - 1}`).size);

        // which rooms is this socketID in?
        console.log(socket.rooms);

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected: ", socket.id);

    });

});



