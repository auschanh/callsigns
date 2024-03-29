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

        const activeUsers = [...io.sockets.sockets.values()].map((socketObj) => {

            return {

                username: socketObj.username,
                socketID: socketObj.id,
                rooms: socketObj.rooms

            }
    
        });

        console.log(activeUsers);

    }

    const getPlayersInLobby = (roomName) => {

        const lobby = [...io.sockets.adapter.rooms].find((room) => {return room[0] === roomName})[1];

        return usernameLookup([...lobby]);

    }

    const usernameLookup = (lobbyArray) => {

        return usernames = lobbyArray.map((socketID) => {

            let foundSocket = [...io.sockets.sockets.values()].find((socketObj) => {return socketObj.id === socketID});

            return {

                playerName: foundSocket.username,
                isReady: foundSocket.isReady

            }

        });

    }

    getSocketInfo();
    
    socket.on("gameInfo", ({ username, roomName, numPlayers, aiPlayers }, isRoomCreated) => {

        if (!isRoomCreated) {

            const roomID = socket.id + Math.floor(Math.random() * 10);

            socket.join(roomID);

            socket.roomID = roomID;

            socket.isReady = true;

            roomLookup.push({

                roomID: roomID,
                roomName: roomName,
                host: username,
                numPlayers: numPlayers,
                aiPlayers: aiPlayers,
                allowSharing: false
    
            });

        } else {

            const findRoom = roomLookup.find(({roomID}) => {return roomID === socket.roomID});

            findRoom.roomName = roomName;
            findRoom.numPlayers = numPlayers;
            findRoom.aiPlayers = aiPlayers;

        }

        socket.username = username;

        getSocketInfo();

        const roomList = getPlayersInLobby(socket.roomID);

        socket.emit("getRoomInfo", `http://localhost:3000/game/${socket.roomID}`, roomList, socket.roomID);

        console.log(roomLookup);

    });

    socket.on("allowSharing", (allowSharing) => {

        const findRoom = roomLookup.find(({roomID}) => {return roomID === socket.roomID});

        findRoom.allowSharing = allowSharing;

        console.log(findRoom);

    });

    socket.on("roomCheck", (roomID, setRoomName) => {

        const findRoom = roomLookup.find((room) => {return room.roomID === roomID});

        if (findRoom) {

            setRoomName(findRoom.roomName);

            const roomList = getPlayersInLobby(roomID);

            console.log("players in " + findRoom.roomName + ": ");

            console.log(roomList);

            socket.emit("roomExists", roomList, `http://localhost:3000/game/${roomID}`, findRoom);

        } else {

            setRoomName(false);

            socket.emit("roomExists");
            
        }

    });

    socket.on("joinRoom", (roomName, username) => {

        socket.username = username;

        console.log(username + " is joining " + roomName);

        socket.join(roomName);

        socket.roomID = roomName;

        socket.isReady = false;

        getSocketInfo();

        const roomList = getPlayersInLobby(roomName);

        if (roomList.some(({playerName}) => { return playerName === username})) {      

            socket.emit("getLobby", roomList);

            socket.to(roomName).emit("joinedLobby", roomList);

        } else {

            socket.emit("getLobby");

        }

    });

    socket.on("sendIsReady", (roomID) => {

        socket.isReady = !socket.isReady;

        const roomList = getPlayersInLobby(roomID);

        io.to(roomID).emit("receiveIsReady", roomList);

    });

    socket.on("sendMessage", (roomName, messageData) => {

        socket.to(roomName).emit("receiveMessage", messageData);

    });

    socket.on("disconnecting", () => {

        const leavingRooms = [...socket.rooms];

        console.log(leavingRooms);

        leavingRooms.forEach((room) => {

            // if you're the only one left in the room,
            if (io.sockets.adapter.rooms.get(room).size === 1) {

                // if you joined this room, deregister the room from roomLookup
                if (room !== socket.id) {

                    roomLookup = roomLookup.filter(({roomID}) => {return roomID !== room});

                    console.log("removed room from roomLookup");
                    
                } else {

                    console.log("I was the last one here but this was my own room that no one joined");

                }

            } else {

                // ---------------------------------------------------------
                socket.to(room).emit("leftRoom", socket.username);
                // ---------------------------------------------------------

            }

        });

    });

    socket.on("disconnect", () => {

        console.log(roomLookup);

        console.log("User Disconnected: ", socket.id);

    });

});



