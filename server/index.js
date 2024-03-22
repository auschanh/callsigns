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

    getSocketInfo();
    

    socket.on("gameInfo", ({ username, roomName, numPlayers, aiPlayers }) => {

        socket.username = username;

        socket.join(`${roomName}-${socket.id}`);

        getSocketInfo();

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected: ", socket.id);

    });

});



