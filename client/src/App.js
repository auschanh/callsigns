import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, Redirect, useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/styles.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
import JoinRoom from "./pages/JoinRoom";
import NewHost from "./pages/NewHost";
import SocketContext from "./contexts/SocketContext";
import MessageContext from "./contexts/MessageContext";
import LobbyContext from "./contexts/LobbyContext";
import GameInfoContext from "./contexts/GameInfoContext";
import styles from "./css/tailwindStylesLiterals";

import axios from "axios";

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const [socket, setSocket] = useState(mainSocket);

	const [playerName, setPlayerName] = useState();

	const [selectedPlayers, setSelectedPlayers] = useState([]);

	const [callsign, setCallsign] = useState();

	const [generatedWords, setGeneratedWords] = useState(["Board", "Boil", "Bolt"]);

	const [messageList, setMessageList] = useState([]);

	const [chatExpanded, setChatExpanded] = useState(false);

	const [newMessage, setNewMessage] = useState(false);

	const [inLobby, setInLobby] = useState([]);

	const [inGame, setInGame] = useState();

	const [isPlayerWaiting, setIsPlayerWaiting] = useState(false);	

	const [isGameStarted, setIsGameStarted] = useState(false);

	const [guesser, setGuesser] = useState();

	const navigate = useNavigate();

	const generateWord = async () => {

		const url = "http://localhost:3001/getMysteryWord";

		try {

			const response = await axios.get(url);

			const retrievedWord = response.data;

			if (generatedWords.includes(retrievedWord)) {

				return generateWord();

			} else {

				return retrievedWord;

			}

		} catch (error) {

			throw error;

		}

	}

	useEffect(() => {

		socket.on("redirectGame", (roomID, playerName, selectedPlayers, callsign, isHost) => {

			(async () => {

				setPlayerName(playerName);

				setSelectedPlayers(selectedPlayers);

				setIsPlayerWaiting(false);

				setChatExpanded(false);

				if (isHost) {

					if (generatedWords.includes(callsign)) {

						const retrievedWord = await generateWord();

						try {

							await socket.emit("sendCallsign", retrievedWord, [...generatedWords, retrievedWord]);
			
						} catch (error) {
			
							throw error;
			
						}
	
					} else {

						try {

							await socket.emit("sendCallsign", callsign, [...generatedWords, callsign]);
			
						} catch (error) {
			
							throw error;
			
						}
	
					}

				}

				if (selectedPlayers.includes(playerName)) {

					navigate(`/game/${roomID}`);

				} else if (isHost) {

					(async () => {

						try {
			
							await socket.emit("roomCheck", roomID, true);
			
						} catch (error) {
			
							throw error;
			
						}
			
					})();
					
				}

			})();

		});

		// for host only
		socket.on("sendGameStart", (roomList, roomDetails) => {

			const playing = selectedPlayers.filter((player) => { return roomList.find(({ playerName }) => { return playerName === player }) });

			setInGame(playing);

			setGuesser(roomDetails.guesser);

			setIsGameStarted(roomDetails.isGameStarted);

			setInLobby(roomList);

			(async () => {

				try {

					// for the host (DialogPlay)
					await socket.emit("gameInfo", { username: roomDetails.host, roomName: roomDetails.roomName, numPlayers: roomDetails.numPlayers, aiPlayers: roomDetails.aiPlayers }, true, false);
	
					await socket.emit("announceGameStart", playing, roomDetails);
	
				} catch (error) {
	
					throw error;
	
				}
	
			})();

		});

		socket.on("receiveCallsign", (callsign, generatedWords) => {

			setCallsign(callsign);

			setGeneratedWords(generatedWords);

		});

		socket.on("receiveMessage", (messageData) => {

            console.log(messageData);

            setMessageList((list) => [...list, messageData]);

            if (!chatExpanded) {

                setNewMessage(true);

            }

        });

		socket.on("getRoomList", (roomList, isGameStarted) => {

			setInLobby(roomList);

			if (isGameStarted) {

				setIsPlayerWaiting(true);

			}

        });

		// for host only
		socket.on("sendInGame", (socketID) => {

			(async () => {

				try {

					await socket.emit("transmitInGame", inGame, socketID);
	
				} catch (error) {
	
					throw error;
	
				}
	
			})();

		});

		socket.on("leftRoom", (user) => {

			console.log(`${user} has left the lobby`);

            setInLobby(inLobby.filter(({playerName}) => { return playerName !== user }));

			setInGame(inGame?.filter((player) => { return player !== user }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== user }));

		});

		socket.on("notifyReturnToLobby", (playerName) => {

			setInGame(inGame?.filter((player) => { return player !== playerName }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== playerName }));

		});

		return () => {

			socket.removeAllListeners("redirectGame");
			socket.removeAllListeners("sendGameStart");
			socket.removeAllListeners("receiveCallsign");
			socket.removeAllListeners("receiveMessage");
			socket.removeAllListeners("getRoomList");
			socket.removeAllListeners("sendInGame");
			socket.removeAllListeners("leftRoom");
			socket.removeAllListeners("notifyReturnToLobby");

		}

	}, [socket, generatedWords, generateWord, navigate, inLobby, inGame, selectedPlayers, chatExpanded]);

	useEffect(() => {

        if (chatExpanded) {

            setNewMessage(false);

        }

    }, [chatExpanded]);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

				<MessageContext.Provider value={[[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]]}>

					<LobbyContext.Provider value={[inLobby, setInLobby]}>

						<GameInfoContext.Provider value={[playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]]}>

							<Routes>

								<Route exact path="/" element={<Home />} />

								<Route exact path="lobby/:roomID" element={<JoinRoom />} />

								<Route exact path="game/:roomID" element={<Game />} />

								<Route exact path="newhost/:roomID" element={<NewHost />} />

								<Route path="*" element={<Navigate replace to="/" />} />

							</Routes>

						</GameInfoContext.Provider>
					
					</LobbyContext.Provider>

				</MessageContext.Provider>

			</SocketContext.Provider>

		</div>

	);

}

export default App;
