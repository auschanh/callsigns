import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";

const Game = function (props) {

	const [socket, setSocket] = useSocketContext();

	const [roomID, playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers]] = useGameInfoContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [inGame, setInGame] = useState();

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	const [playersInLobby, setPlayersInLobby] = useState();

	// for host only
	const sendSelected = async () => {

		try {

			await socket.emit("setSelectedPlayers", selectedPlayers);

		} catch (error) {

			throw error;

		}

	};

	useEffect(() => {

        if (roomDetails === undefined) {

            console.log("checking room");

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

            if (othersInLobby) {

                setInGame(

					selectedPlayers.filter((player) => { return othersInLobby.find(({ playerName }) => { return playerName === player }) })
					
				);

                setRoomDetails(roomDetails);

				setIsClosedRoom(roomDetails.isClosedRoom);

				setPlayersInLobby(othersInLobby);

            } else {

				// setRoomDetails(false);

            	setIsAlertOpen(true);

            }

        });

		// for host only
		socket.on("sendSelectedPlayers", () => {

			sendSelected();

		});

        socket.on("joinedLobby", (othersInLobby) => {

			setPlayersInLobby(othersInLobby);

        });

        socket.on("leftRoom", (user) => {

			console.log(`${user} has left the lobby`);

			setInGame(inGame.filter((player) => { return player !== user }));

            setPlayersInLobby(playersInLobby.filter(({playerName}) => { return playerName !== user }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== user }));

		});

        return () => {

            socket.removeAllListeners("roomExists");
			socket.removeAllListeners("sendSelectedPlayers");
            socket.removeAllListeners("joinedLobby");
            socket.removeAllListeners("leftRoom");
        }

    }, [socket, roomDetails, roomID, selectedPlayers, sendSelected, inGame, playersInLobby]);

	return (

		<>

			{roomDetails && (

				<div>

					<div>
						Room ID: {roomID}
						<br />
						Hello, {playerName}
						<br />

						<p>
							
							{`Players In Game: `}

							{inGame.map((playerName, index) => {

								if (index !== inGame.length - 1) {
									return (<span key={index}>{`${playerName}, `}</span>);
								} else {
									return (<span key={index}>{`${playerName}`}</span>);
								}

							})}
							
						</p>

						<p>
							
							{`Players Waiting In Lobby: `}

							{playersInLobby.map((player, index) => {

								if (!inGame.includes(player.playerName)) {

									if (index !== playersInLobby.length - 1) {

										return (<span key={index}>{`${player.playerName}, `}</span>);
	
									} else {
	
										return (<span key={index}>{`${player.playerName}`}</span>);
	
									}

								}

							})}

						</p>

						<p>{`The guesser is ${roomDetails.guesser} (${roomDetails.guesserID})`}</p>

						{isClosedRoom && (

							<p>This is a closed room.</p>

						) || (

							<p>This is not a closed room.</p>

						)}

						{callsign && (

							<>

								<p>{`This round's callsign is: ${callsign}`}</p>

								<p>

									{`The generated words are: `}

									{generatedWords.map((prevWord, index) => {

										if (index !== generatedWords.length - 1) {

											return (

												<span key={index}>{`${prevWord}, `}</span>

											);

										} else {

											return <span key={index}>{prevWord}</span>

										}

									})}

								</p>

							</>

						)}
						
					</div>

				</div>

			) || (

				<div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700"></div>

			)}

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="gap-0">

					<AlertDialogHeader className="space-y-2">
						<AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
					</AlertDialogHeader>

					<div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
						<p>Oops! It looks like this room doesn't exist.</p>
						<p>Please double check the link you were sent.</p>
					</div>

				</AlertDialogContent>
			</AlertDialog>

		</>

	);
};

export default Game;
