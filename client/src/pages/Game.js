import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Switch } from "../components/ui/switch";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { User, Users, Copy, Check, LockKeyhole } from "lucide-react";

const Game = function (props) {

	const [socket, setSocket] = useSocketContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame]] = useGameInfoContext();

	const [sessionUrl, setSessionUrl] = useState();

	const [inLobby, setInLobby] = useLobbyContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	const [copied, setCopied] = useState(false);

	const navigate = useNavigate();

	const { roomID } = useParams();

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

			if (othersInLobby && playerName !== undefined) {

                setInGame(

					selectedPlayers.filter((player) => { return othersInLobby.find(({ playerName }) => { return playerName === player }) })
					
				);

                setRoomDetails(roomDetails);

				setIsClosedRoom(roomDetails.isClosedRoom);

				setInLobby(othersInLobby);

				setSessionUrl(sessionUrl);

            } else {

				// setRoomDetails(false);

				console.log(isClosedRoom);

				setIsClosedRoom(isClosedRoom);

            	setIsAlertOpen(true);

            }

        });

		// for host only
		socket.on("sendSelectedPlayers", () => {

			sendSelected();

		});

		socket.on("isRoomClosed", (isClosedRoom) => {

            setIsClosedRoom(isClosedRoom);

        });

        return () => {

            socket.removeAllListeners("roomExists");
			socket.removeAllListeners("sendSelectedPlayers");
			socket.removeAllListeners("isRoomClosed");
            
        }

    }, [socket, roomDetails, roomID, selectedPlayers, sendSelected, playerName]);

	const handleCopy = async () => {

		try {

			if ("clipboard" in navigator) {

				await navigator.clipboard.writeText(sessionUrl);
				
			} else {

				document.execCommand("copy", true, sessionUrl);

			}

			setCopied(true);

			setTimeout(() => {

				setCopied(false);

			}, 1000);

		} catch (error) {

			throw error;

		}

	}

	const handleCloseRoom = async () => {

		try {

			await socket.emit("closeRoom", !isClosedRoom);

		} catch (error) {

			throw error;

		}

		setIsClosedRoom(!isClosedRoom);

	};

	return (

		<>

			{roomDetails && (

				<div className="h-screen w-screen flex flex-row flex-none bg-slate-300">

					<Popover>

						<PopoverTrigger asChild>
							<Button className="absolute right-0 p-0 aspect-square m-6" variant="outline"><Users size={14} /></Button>
						</PopoverTrigger>

						<PopoverContent className="w-96 max-h-[80vh] overflow-auto mr-6 p-4">

							<div className="flex flex-row items-center bg-slate-100 p-4 rounded-lg transition-colors duration-300 hover:bg-slate-200">

								<div className="flex items-center justify-center h-10 aspect-square rounded-full bg-slate-900">
									<p className="text-slate-50 text-xl">{playerName.charAt(0).toUpperCase()}</p>
								</div>

								<h3 className="text-lg text-slate-900 px-6">{playerName}</h3>

							</div>

							<div>

								<Accordion className="mt-2 px-2" type="multiple">

									<AccordionItem className="w-full border-slate-200" value="item-1">

										<AccordionTrigger>In Game:</AccordionTrigger>

										<AccordionContent>

											<div className="space-y-2">

												{inGame.map((player, index) => {

													return (

														<div key={index} className="flex flex-row items-center h-14 pl-4 gap-3 rounded-lg transition-colors duration-300 hover:bg-slate-100">

															<User size={16} />

															<p className={`${player === playerName ? "underline" : ""}`}>{player}</p>

														</div>

													);

												})}
												
											</div>

										</AccordionContent>

									</AccordionItem>

									<AccordionItem className="w-full border-slate-200" value="item-2">

										<AccordionTrigger>Waiting in Lobby:</AccordionTrigger>

										<AccordionContent>

											<div className="space-y-2">

												{inLobby.every((player) => { return inGame.includes(player.playerName) }) && (

													<div className="flex items-center h-14 p-2 pl-4 rounded-lg bg-slate-100 transition-colors duration-300 hover:bg-slate-200">
														<p>None</p>
													</div>

												) || (

													inLobby.map((player, index) => {

														if (!inGame.includes(player.playerName)) {
	
															return (
	
																<div key={index} className="grid grid-cols-[16px_auto_auto] items-center h-14 pl-4 gap-2 rounded-lg transition-colors duration-300 hover:bg-slate-100">
	
																	<User size={16} />
		
																	<p className="break-all mx-2">{player.playerName}</p>
	
																	<div className={`ml-auto mr-3 py-2 px-4 rounded-lg ${player.isReady ? "bg-green-100 text-green-600" : "bg-slate-200 text-black opacity-50"}`}>
																		<p>{`${player.isReady ? "Ready" : "Not Ready"}`}</p>
																	</div>
		
																</div>
		
															);
														}
													})

												)}

											</div>

										</AccordionContent>

									</AccordionItem>

									<AccordionItem className={`w-full border-slate-200`} value="item-3">

										<AccordionTrigger>Share Link</AccordionTrigger>

										<AccordionContent>

											<>

												{(playerName === roomDetails.host) && (

													<div className={`transition-all ease-in-out duration-300 ${isClosedRoom ? "h-[58px]" : "h-[148px]"}`}>

														<div className={`w-full px-4 py-2 rounded-md border border-slate-400 transition-all duration-300 ${isClosedRoom ? "bg-slate-200 hover:bg-slate-100" : "bg-slate-100 hover:bg-slate-50"}`}>
															<div className="flex flex-row items-center h-10">
																<p className="flex">Close Room:</p>
																<Switch 
																	className="ml-auto data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-slate-400"
																	checked={isClosedRoom}
																	onCheckedChange={handleCloseRoom}
																/>
															</div>
														</div>
														
														{(!isClosedRoom) && (

															<div className={`transition-all ease-in-out duration-300 ${isClosedRoom ? "opacity-0 -translate-y-3" : ""}`}>
																<div className={`grid grid-cols-[auto_30px] p-4 gap-4 items-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-100 transition-all ease-in-out duration-300 ${isClosedRoom ? "invisible opacity-20" : "mt-4"}`}>
																	<p className="break-all">{sessionUrl}</p>
																	<Button className="h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>
																</div>
															</div>

														)}

													</div>

												) || (

													<>

														<div className={`transition-all ease-in-out duration-500 ${isClosedRoom ? "invisible opacity-5" : ""}`}>

															{(!isClosedRoom) && (

																<div className={`grid grid-cols-[auto_30px] p-4 gap-4 items-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-100`}>
																	<p className={`break-all`}>{sessionUrl}</p>
																	<Button className="h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>
																</div>
															
															)}

														</div>
															
														<div className={`transition-all ease-in-out duration-500 ${isClosedRoom ? "" : "invisible opacity-5"}`}>

															{(isClosedRoom) && (

																<div className={`flex flex-row items-center w-full p-4 pr-14 bg-slate-200 rounded-md border border-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950`}>
																	<LockKeyhole className="stroke-2 stroke-slate-900 mr-3" size={15} />
																	<p className="text-sm">Your host <span className="font-semibold underline">{roomDetails.host}</span> has closed this room</p>
																</div>

															)}

														</div>

													</>

												)}

											</>

										</AccordionContent>

									</AccordionItem>

								</Accordion>

							</div>

						</PopoverContent>

					</Popover>

					<div>

						<div>

							<p>{`The guesser is ${roomDetails.guesser} (${roomDetails.guesserID})`}</p>

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

				</div>

			) || (

				<div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700"></div>

			)}

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="gap-0">

					<AlertDialogHeader className="space-y-2">
						<AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
					</AlertDialogHeader>
					
					{(isClosedRoom === null) && (

						<div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
							<p>Oops! It looks like this room doesn't exist.</p>
							<p>Please double check the link you were sent.</p>
						</div>

					) || (isClosedRoom) && (

						<div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
							<p>This is a closed room.</p>
							<p>Please contact the host to join this room.</p>
						</div>

					) || (!isClosedRoom) && (

						<div className="flex flex-col flex-none h-[20vh] pt-10 items-center text-slate-700">
							<p>This game is already in progress.</p>
							<p>Join the lobby and get ready for the next round!</p>
							<Button className="mt-auto mb-2" onClick={() => {navigate(`/lobby/${roomID}`)}} variant="default">Join Lobby</Button>
						</div>

					)}

				</AlertDialogContent>
			</AlertDialog>

		</>

	);
};

export default Game;
