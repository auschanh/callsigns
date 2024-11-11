import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { SmallSwitch } from "../components/ui/small-switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./ui/context-menu";
import { useSocketContext } from "../contexts/SocketContext";
import { useMessageContext } from "../contexts/MessageContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Copy, Check, ChevronLeft, MessageSquare, X } from "lucide-react";
import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";

function Lobby({ gameInfo, sessionUrl, previousSlide, prevClosedRoom, prevAiPlayers }) {

	const [socket, setSocket] = useSocketContext();
	
	const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

	const [[inLobby, setInLobby], regPlayerCount] = useLobbyContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]] = useGameInfoContext();

	const [isClosedRoom, setIsClosedRoom] = useState(prevClosedRoom);

	const [copied, setCopied] = useState(false);

	const [removePlayerName, setRemovePlayerName] = useState();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	useEffect(() => {

		selectedPlayers.forEach((player) => {

			if (!inLobby.some(({ playerName }) => { return playerName === player })) {

				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player }));

			}

		});

		inLobby?.forEach((player) => {

			if (selectedPlayers.includes(player.playerName) && !player.isReady) {

				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player.playerName }));

				if (player.playerName === guesser) {

					console.log("the guesser is not ready");

					try {

						socket.emit("selectGuesser", "");

					} catch (error) {

						throw error;

					}

				}

			}

		});

	}, [inLobby]);

	const sendSelected = async () => {

		try {

			await socket.emit("setSelectedPlayers", selectedPlayers);

		} catch (error) {

			throw error;

		}

	};

	useEffect(() => {

		socket.on("sendSelectedPlayers", () => {

			sendSelected();

		});

		return () => {

			socket.removeAllListeners("sendSelectedPlayers");

		}

	}, [socket, sendSelected]);

	useEffect(() => {

		sendSelected();

	}, [selectedPlayers]);

	const handleChatExpansion = () => {

		setChatExpanded(!chatExpanded);

	}

	const handleCloseRoom = async () => {

		try {

			await socket.emit("closeRoom", !isClosedRoom);

		} catch (error) {

			throw error;

		}

		setIsClosedRoom(!isClosedRoom);

	};

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

	};

	const handleSelectPlayer = (player) => {

		if (player.isReady) {

			console.log("sure " + player.playerName + " is ready");

			if (!selectedPlayers.includes(player.playerName)) {

				setSelectedPlayers([...selectedPlayers, player.playerName]);

			} else {

				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player.playerName }));

				if (player.playerName === guesser) {

					try {

						socket.emit("selectGuesser", "");
			
					} catch (error) {
			
						throw error;
			
					}

				}

			}

		} else {

			console.log(player.playerName + " is not ready");

		}
	};

	const handleRemovePlayer = async (playerType) => {

		if (playerType === "bot") {

			try {

				await socket.emit("gameInfo", { ...gameInfo, aiPlayers: gameInfo.aiPlayers - 1 }, true);

			} catch (error) {

				throw error;

			}

		} else if (playerType === "missingPlayer") {

			try {

				await socket.emit("gameInfo", { ...gameInfo, numPlayers: gameInfo.numPlayers - 1 }, true);

			} catch (error) {

				throw error;

			}

		} else if (playerType.match(/^player-/gm)) {

			setRemovePlayerName(playerType.substring(7));

			setIsAlertOpen(true);

		}

	};

	const removePlayer = async () => {

		try {

			await socket.emit("removePlayer", removePlayerName);

		} catch (error) {

			throw error;

		}

	};

	const handleSelectGuesser = async (newGuesser) => {

		try {

			if (newGuesser !== guesser) {

				await socket.emit("selectGuesser", newGuesser);

			} else {

				await socket.emit("selectGuesser", "");

			}

		} catch (error) {

			throw error;

		}

	};

	const selectAll = () => {

		setSelectedPlayers(

			inLobby.reduce((result, player) => {

				if (player.isReady) {

					result.push(player.playerName);

				}

				return result;

			}, [])

		);

	}

	const deselectAll = () => {

		setSelectedPlayers([]);

	}

	const startGame = async () => {

		const joinOrder = inLobby.map((player) => { return player.playerName });

		try {

			await socket.emit("startGame", selectedPlayers, joinOrder);

		} catch (error) {

			throw error;

		}

	};

	return (

		<>

			<div className="flex flex-col h-full">

				<div className="flex flex-col bg-slate-200 border-slate-400 rounded-md">

					<div className="flex flex-row justify-between mb-2 relative">

						<Button
							className="px-0 w-fit text-xs"
							variant="link"
							onClick={previousSlide}
						>
							<ChevronLeft size={20} />
							<p>Edit</p>
						</Button>

						<Button
							className="gap-x-2"
							variant="border"
							onClick={handleChatExpansion}
						>
							<h2 className="text-xs leading-none m-0 p-0">Chat</h2>
							<MessageSquare size={14} />
							<div
								className={`absolute -right-1.5 -top-1.5 aspect-square h-3 rounded-full bg-cyan-500 transition-all duration-1000" ${newMessage ? "" : "invisible opacity-20"}`}
							/>
						</Button>

					</div>

					<h1 className="font-semibold text-lg mb-6 border border-b-slate-900">
						{gameInfo.roomName}
					</h1>

					{gameInfo && (
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<div className="py-2 w-fit mb-6">
									<h1 className="text-xl font-extralight">
										{`Welcome `}
										<TooltipTrigger asChild>
											<span
												className="font-normal hover:underline hover:cursor-pointer"
												onClick={previousSlide}
											>
												{gameInfo.username}
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-semibold">{`Change Username`}</p>
										</TooltipContent>
										!
									</h1>
								</div>
							</Tooltip>
						</TooltipProvider>
					)}

					<div className="mb-6">

						<div className="flex flex-row items-center mb-2">

							<h1 className="text-sm font-semibold">Link</h1>

							<div className="flex items-center justify-end w-full">
								<p className="text-xs mr-2">Close Room:</p>
								<SmallSwitch
									className="data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-slate-400"
									checked={isClosedRoom}
									onCheckedChange={handleCloseRoom}
								/>
							</div>

						</div>

						<div className="flex flex-row items-center w-full p-4 pr-14 mb-6 rounded-md border border-slate-400 bg-white dark:border-slate-800 dark:bg-slate-950 relative">
							<p className="text-sm break-all">{sessionUrl}</p>
							<Button
								className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500"
								onClick={handleCopy}
								variant={copied ? "greenNoHover" : "border"}
							>
								{(!copied && <Copy size={12} />) || <Check size={14} />}
							</Button>
						</div>

						<div className="text-xs">

							<h2 className="underline font-semibold mb-1">Game Settings</h2>
							<p>Number of Guesses: <span className="font-semibold">{`${Number(gameInfo.numGuesses) !== 11 ? Number(gameInfo.numGuesses) : "Unlimited"}`}</span></p>
							<p>Number of Rounds: <span className="font-semibold">{`${Number(gameInfo.numRounds) !== 11 ? Number(gameInfo.numRounds) : "Unlimited"}`}</span></p>
							<p>Timer: <span className="font-semibold">{`${Number(gameInfo.timeLimit) !== 0 ? ((Math.floor(Number(gameInfo.timeLimit) / 60)) === 0 ? "" : ((Math.floor(Number(gameInfo.timeLimit) / 60)) + "m ")) + ((Number(gameInfo.timeLimit) % 60) + "s") : "Off"}`}</span></p>
							<p>Scoring: <span className="font-semibold">{`${gameInfo.keepScore ? "On" : "Off"}`}</span></p>

						</div>

					</div>

					<div className="mb-6">

						<div className="flex flex-row flex-none">

							<h1 className="text-sm font-semibold mb-4">

								{inGame && (

									`Select ${gameInfo.numPlayers} ${gameInfo.numPlayers === 1 ? "player" : "players"} for the next round:`

								) || (

									`Select ${gameInfo.numPlayers} ${gameInfo.numPlayers === 1 ? "player" : "players"} for this round:`

								)}
								
							</h1>

							<Button 
								className="rounded-full px-2 py-3 w-24 h-4 ml-auto text-xs"
								variant="border"
								onClick={selectedPlayers.length === 0 ? selectAll : selectedPlayers.length === inLobby.reduce((accumulator, currentValue) => { if (currentValue.isReady) { return accumulator + 1 } else { return accumulator + 0 }  }, 0) ? deselectAll : selectAll }
							>

								{selectedPlayers.length === 0 && (
		
									<>Select All</>
		
								) || selectedPlayers.length === inLobby.reduce((accumulator, currentValue) => { if (currentValue.isReady) { return accumulator + 1 } else { return accumulator + 0 }  }, 0) && (
		
									<>Deselect All</>
		
								) || (
		
									<>Select All</>
		
								)}
		
							</Button>

						</div>

						<h2 className="mb-2 leading-none text-xs font-normal">Right-click for more options</h2>

						<div className="flex flex-wrap gap-x-3 gap-y-3">

							{inLobby?.map((player, index) => {

								if (player.playerName === gameInfo.username) {

									return (

										<ContextMenu key={index}>
											<ContextMenuTrigger>
												<TooltipProvider>
													<Tooltip delayDuration={0}>
														<TooltipTrigger asChild>
															<Button
																className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
																variant={
																	selectedPlayers.includes(player.playerName)
																		? "green"
																		: "indigo"
																}
																onClick={() => {
																	handleSelectPlayer(player);
																}}
															>
																<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">

																	{guesser && guesser === player.playerName && (

																		<AgentIcon className="aspect-square h-5" />

																	) || (

																		<p className="text-slate-900 text-xs font-semibold">
																			{player.playerName.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase()}
																		</p>

																	)}
																	
																</div>
																<p className="text-xs">{player.playerName}</p>
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p className="font-semibold">{`👑 Host`}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</ContextMenuTrigger>
											<ContextMenuContent className="p-0 border-0">
												
												{guesser && guesser === player.playerName && (

													<ContextMenuItem 
														className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-blue-900 focus:text-slate-50 group"
														onClick={() => {handleSelectGuesser(player.playerName)}}
													>
														<AgentIcon className="aspect-square h-12 group-hover:fill-white" />
														<p>Remove as Stranded Agent</p>
													</ContextMenuItem>
													
												) || (

													<ContextMenuItem 
														disabled={!selectedPlayers.includes(player.playerName)}
														className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-blue-900 focus:text-slate-50 group"
														onClick={() => {handleSelectGuesser(player.playerName)}}
													>
														<AgentIcon className="aspect-square h-12 group-hover:fill-white" />
														<p>Select as Stranded Agent</p>
													</ContextMenuItem>

												)}

												<ContextMenuSeparator className="m-0" />
												<ContextMenuItem
													disabled
													className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-red-500 focus:text-slate-50"
												>
													<X size={16} />
													<p>Host cannot be removed from Lobby</p>
												</ContextMenuItem>
											</ContextMenuContent>
										</ContextMenu>

									);

								} else {

									if (player.playerName && !inGame?.includes(player.playerName)) {

										return (

											<ContextMenu key={index}>
												<ContextMenuTrigger>
													<TooltipProvider>
														<Tooltip delayDuration={0}>
															<TooltipTrigger asChild>
																<Button
																	className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
																	onClick={() => {
																		handleSelectPlayer(player);
																	}}
																	variant={
																		player.isReady
																			? selectedPlayers.includes(player.playerName)
																				? "green"
																				: "default"
																			: "disabled"
																	}
																>
																	<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
																		
																		{guesser && guesser === player.playerName && (

																			<AgentIcon className="aspect-square h-5" />

																		) || (

																			<p className="text-slate-900 text-xs font-semibold">
																				{player.playerName.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase()}
																			</p>

																		)}

																	</div>
																	<p className="text-xs">{player.playerName}</p>
																</Button>
															</TooltipTrigger>
	
															{!player.isReady && (
																<TooltipContent>
																	<p className="font-semibold">
																		This player is not ready
																	</p>
																</TooltipContent>
															)}
														</Tooltip>
													</TooltipProvider>
												</ContextMenuTrigger>
												<ContextMenuContent className="p-0 border-0">

													{guesser && guesser === player.playerName && (

														<ContextMenuItem 
															className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-blue-900 focus:text-slate-50 group"
															onClick={() => {handleSelectGuesser(player.playerName)}}
														>
															<AgentIcon className="aspect-square h-12 group-hover:fill-white" />
															<p>Remove as Stranded Agent</p>
														</ContextMenuItem>
														
													) || (

														<ContextMenuItem 
															disabled={!selectedPlayers.includes(player.playerName)}
															className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-blue-900 focus:text-slate-50 group"
															onClick={() => {handleSelectGuesser(player.playerName)}}
														>
															<AgentIcon className="aspect-square h-12 group-hover:fill-white" />
															<p>Select as Stranded Agent</p>
														</ContextMenuItem>

													)}

													<ContextMenuSeparator className="m-0" />
													<ContextMenuItem
														// disabled={regPlayerCount + gameInfo.aiPlayers <= 3}
														className="cursor-pointer gap-3 pr-4 pl-3 focus:bg-red-500 focus:text-slate-50"
														onClick={() => {
															handleRemovePlayer(`player-${player.playerName}`);
														}}
													>
														{/* {(regPlayerCount + gameInfo.aiPlayers > 3 && ( */}
															<>
																<X size={16} />
																<p>Remove from Lobby</p>
															</>
														{/* )) || <p className="pl-2">Minimum 3 players</p>} */}
													</ContextMenuItem>
												</ContextMenuContent>
											</ContextMenu>
	
										);

									}

								}

							})}

							{inLobby && Array.from({ length: gameInfo.numPlayers - regPlayerCount }, (_, index) => {

								if (!inGame) {

									if (regPlayerCount < gameInfo.numPlayers) {

										return (

											<ContextMenu key={index}>
												<ContextMenuTrigger>
													<Badge
														className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
														variant="empty"
														key={index}
													>
														<div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
														<p>Player {regPlayerCount + index + 1}</p>
													</Badge>
												</ContextMenuTrigger>
												<ContextMenuContent className="p-0 border-0">
													<ContextMenuItem
														disabled={
															gameInfo.numPlayers + gameInfo.aiPlayers <= 3
														}
														className="cursor-pointer gap-3 pr-4 focus:bg-red-500 focus:text-slate-50"
														onClick={() => {
															handleRemovePlayer("missingPlayer");
														}}
													>
														{(gameInfo.numPlayers + gameInfo.aiPlayers > 3 && (
															<>
																<X size={16} />
																<p>Remove from Lobby</p>
															</>
														)) || <p className="pl-2">Minimum 3 players</p>}
													</ContextMenuItem>
												</ContextMenuContent>
											</ContextMenu>

										);

									}

								} 

							})}

							{inGame && !inGame.includes(playerName) && ((regPlayerCount - inGame.length) < gameInfo.numPlayers) && Array.from({ length: gameInfo.numPlayers - (regPlayerCount - inGame.length) }, (_, index) => {

								return (

									<ContextMenu key={index}>
										<ContextMenuTrigger>
											<Badge
												className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
												variant="empty"
												key={index}
											>
												<div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
												<p>Player {(regPlayerCount - inGame.length) + index + 1}</p>
											</Badge>
										</ContextMenuTrigger>
										<ContextMenuContent className="p-0 border-0">
											<ContextMenuItem
												disabled={
													gameInfo.numPlayers + gameInfo.aiPlayers <= 3
												}
												className="cursor-pointer gap-3 pr-4 focus:bg-red-500 focus:text-slate-50"
												onClick={() => {
													handleRemovePlayer("missingPlayer");
												}}
											>
												{(gameInfo.numPlayers + gameInfo.aiPlayers > 3 && (
													<>
														<X size={16} />
														<p>Remove from Lobby</p>
													</>
												)) || <p className="pl-2">Minimum 3 players</p>}
											</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>

								);

							})}

							{/* {Array.from({ length: gameInfo.aiPlayers }, (_, index) => {

								return (

									<ContextMenu key={index}>
										<ContextMenuTrigger>
											<Badge
												className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
												variant="bot"
												key={index}
											>
												<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
													<p className="text-slate-900">🤖</p>
												</div>
												<p>Bot {index + 1}</p>
											</Badge>
										</ContextMenuTrigger>
										<ContextMenuContent className="p-0 border-0">
											<ContextMenuItem
												disabled={gameInfo.numPlayers + gameInfo.aiPlayers <= 3}
												className="cursor-pointer gap-3 pr-4 focus:bg-red-500 focus:text-slate-50"
												onClick={() => {
													handleRemovePlayer("bot");
												}}
											>
												{(gameInfo.numPlayers + gameInfo.aiPlayers > 3 && (
													<>
														<X size={16} />
														<p>Remove from Lobby</p>
													</>
												)) || <p className="pl-2">Minimum 3 players</p>}
											</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>

								);

							})} */}

						</div>

					</div>

					{inGame && (

						<div>

							<h1 className="text-sm font-semibold mb-2">{`Currently in game:`}</h1>

							<div className="flex flex-wrap gap-x-3 gap-y-3">

								{inGame.map((player, index) => {

									return (

										<Button
											key={index}
											className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
											variant={"red"}
										>
											<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
												
												{guesser && guesser === player && (

													<AgentIcon className="aspect-square h-5" />

												) || (

													<p className="text-slate-900 text-xs font-semibold">
														{player.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase()}
													</p>

												)}

											</div>
											<p className="text-xs">{player}</p>
										</Button>
										
									);

								})}

								{/* {Array.from({ length: prevAiPlayers }, (_, index) => {

									return (

										<Badge className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer" variant="bot" key={index}>
											<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
												<p className="text-slate-900">🤖</p>
											</div>
											<p>Bot {index + 1}</p>
										</Badge>

									);

								})} */}

							</div>
						
						</div>

					)}

				</div>

				<div className="flex flex-row mt-auto pb-10 w-full justify-end gap-3">

					<Button
						className="w-28 mt-12"
						onClick={startGame}
						disabled={isGameStarted || selectedPlayers.length !== gameInfo.numPlayers}
					>
						Start Game
					</Button>

				</div>

			</div>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="gap-0">
					<AlertDialogHeader className="space-y-0 mb-8">
						<AlertDialogTitle>
							Are you sure you want to remove {removePlayerName}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogAction
							onClick={removePlayer}
							className="w-24 bg-red-600 text-slate-50 hover:bg-red-600/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90"
						>
							Remove
						</AlertDialogAction>
						<AlertDialogCancel className="w-24 bg-slate-900 text-slate-50 hover:bg-slate-900/90 hover:text-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
							Cancel
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

		</>

	);

}

export default Lobby;
