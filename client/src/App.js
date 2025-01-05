import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, Redirect, useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/styles.css";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./components/ui/alert-dialog";
import Home from "./pages/Home";
import Game from "./pages/Game";
import JoinRoom from "./pages/JoinRoom";
import NewHost from "./pages/NewHost";
import SocketContext from "./contexts/SocketContext";
import MessageContext from "./contexts/MessageContext";
import LobbyContext from "./contexts/LobbyContext";
import GameInfoContext from "./contexts/GameInfoContext";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { TriangleAlert, Info } from "lucide-react";
import styles from "./css/tailwindStylesLiterals";

import axios from "axios";

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const [socket, setSocket] = useState(mainSocket);

	const [playerName, setPlayerName] = useState();

	const [selectedPlayers, setSelectedPlayers] = useState([]);

	const [callsign, setCallsign] = useState();

	const [generatedWords, setGeneratedWords] = useState([]);

	const [messageList, setMessageList] = useState([]);

	const [chatExpanded, setChatExpanded] = useState(false);

	const [newMessage, setNewMessage] = useState(false);

	const [inLobby, setInLobby] = useState([]);

	const [inGame, setInGame] = useState();

	const [isPlayerWaiting, setIsPlayerWaiting] = useState(false);	

	const [isGameStarted, setIsGameStarted] = useState(false);

	const [guesser, setGuesser] = useState();

	const [nextGuesser, setNextGuesser] = useState();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [regPlayerCount, setRegPlayerCount] = useState();

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

							console.log("host is excluded");
			
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

					const info = {

						username: roomDetails.host,
						roomName: roomDetails.roomName,
						numPlayers: roomDetails.numPlayers,
						aiPlayers: roomDetails.aiPlayers,
						numGuesses: roomDetails.numGuesses,
						numRounds: roomDetails.numRounds,
						timeLimit: roomDetails.timeLimit,
						keepScore: roomDetails.keepScore

					}

					// for the host (DialogPlay)
					await socket.emit("gameInfo", info, true, false);
	
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

			if (user !== guesser) {

				if (user !== nextGuesser) {

					console.log("not guesser", guesser, nextGuesser);

					setInLobby(prev => prev.filter(({playerName}) => { return playerName !== user }));

				} else {

					console.log("nextGuesser", user);

				}

			} else {

				if (!inGame.includes(playerName)) {

					setInLobby(prev => prev.filter(({playerName}) => { return playerName !== user }));

				}

				console.log("guesser", user);

			}

			setInGame(inGame?.filter((player) => { return player !== user }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== user }));

			if (user && user !== playerName && inGame?.includes(playerName)) {

				toast(

					user === guesser && inGame.includes(user) ? "The Stranded Agent, " + user + ", has disconnected." : user + " has disconnected.", {
						unstyled: true,
						classNames: {
							toast: `flex flex-row flex-none items-center justify-center w-full p-4 border border-solid ${user === guesser && inGame.includes(user) ? "bg-amber-500 border-black" : "bg-slate-100 border-black"}`,
							title: 'ml-5 max-w-32 text-slate-900 text-xs',
							actionButton: `inline-flex items-center justify-center px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90`,
						},
						action: {
							label: "Return to Lobby",
							onClick: () => { setIsAlertOpen(true); },
						},
						icon: <>{user === guesser && inGame.includes(user) && (<TriangleAlert className="ml-1" size={20} />) || (<Info className="ml-1" size={20} />)}</>,
						duration: 5000,
						dismissible: true,
					}
				);
			}

		});

		socket.on("notifyReturnToLobby", (user) => {

			setInGame(inGame?.filter((player) => { return player !== user }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== user }));

			if (user !== playerName && inGame?.includes(playerName)) {

				toast(

					user === guesser ? "The Stranded Agent, " + user + ", is back in the lobby." : user + " is back in the lobby.", {
						unstyled: true,
						classNames: {
							toast: `flex flex-row flex-none items-center justify-center w-full p-4 border border-solid ${user === guesser ? "bg-amber-500 border-black" : "bg-slate-100 border-black"}`,
							title: 'ml-5 max-w-32 text-slate-900 text-xs',
							actionButton: `inline-flex items-center justify-center px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90`,
						},
						action: {
							label: "Return to Lobby",
							onClick:  () => { setIsAlertOpen(true); },
						},
						icon: <>{user === guesser && inGame.includes(user) && (<TriangleAlert className="ml-1" size={20} />) || (<Info className="ml-1" size={20} />)}</>,
						duration: 5000,
						dismissible: true,
					}
				);

			}

		});

		socket.on("navigateLobby", (roomID, host) => {

			toast.dismiss();

			if (playerName === host) {

				navigate(`/newhost/${roomID}`);

			} else {

				navigate(`/lobby/${roomID}`);

			}

		});

		// host only
		socket.on("receiveNewCallsign", (newCallsign) => {

			(async () => {

				if (generatedWords.includes(newCallsign)) {

					const retrievedWord = await generateWord();

					try {

						await socket.emit("sendNextCallsign", retrievedWord, [...generatedWords, retrievedWord]);
		
					} catch (error) {
		
						throw error;
		
					}

				} else {

					try {

						await socket.emit("sendNextCallsign", newCallsign, [...generatedWords, newCallsign]);
		
					} catch (error) {
		
						throw error;
		
					}

				}

			})();

		});

		socket.on("receiveNextCallsign", (callsign, generatedWords, isHost) => {

			setCallsign(callsign);

			setGeneratedWords(generatedWords);

			if (isHost) {

				(async () => {

					try {
		
						await socket.emit("sendNextRound");
						
					} catch (error) {
		
						throw error;
		
					}
		
				})();

			}

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
			socket.removeAllListeners("navigateLobby");
			socket.removeAllListeners("receiveNewCallsign");
			socket.removeAllListeners("receiveNextCallsign");

		}

	}, [socket, generatedWords, generateWord, navigate, inLobby, inGame, selectedPlayers, chatExpanded]);

	useEffect(() => {

        if (chatExpanded) {

            setNewMessage(false);

        }

    }, [chatExpanded]);

	useEffect(() => {

		// count players that have entered a username
		setRegPlayerCount(

			inLobby.reduce((accumulator, currentValue) => {
				
				// if playerName is not null
				if (currentValue.playerName) { 
					
					return accumulator + 1; 
				
				} else {
					
					return accumulator;

				} 
			
			}, 0)

		)

	}, [inLobby]);

	const handleReturnLobby = async () => {

		try {

			await socket.emit("returnToLobby", null, playerName);

		} catch (error) {

			throw error;

		}

	}

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

				<MessageContext.Provider value={[[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]]}>

					<LobbyContext.Provider value={[[inLobby, setInLobby], regPlayerCount]}>

						<GameInfoContext.Provider value={[playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]]}>

							<Toaster />
							
							<Routes>

								<Route exact path="/" element={<Home />} />

								<Route exact path="lobby/:roomID" element={<JoinRoom />} />

								<Route exact path="game/:roomID" element={<Game />} />

								<Route exact path="newhost/:roomID" element={<NewHost />} />

								<Route path="*" element={<Navigate replace to="/" />} />

							</Routes>

							<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
								<AlertDialogContent className="space-y-4">

									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure you want to return to lobby?</AlertDialogTitle>
										<AlertDialogDescription>You won't be able to come back to this game and your progress will be lost.</AlertDialogDescription>
									</AlertDialogHeader>
									
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleReturnLobby}>Return to Lobby</AlertDialogAction>
									</AlertDialogFooter>

								</AlertDialogContent>
							</AlertDialog>

						</GameInfoContext.Provider>
					
					</LobbyContext.Provider>

				</MessageContext.Provider>

			</SocketContext.Provider>

		</div>

	);

}

export default App;
