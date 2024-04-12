import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { SmallSwitch } from "../components/ui/small-switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./ui/context-menu";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { Copy, Check, ChevronLeft, MessageSquare, X } from "lucide-react";

const Lobby = function ({ gameInfo, sessionUrl, previousSlide, handleChatExpansion, newMessage, prevClosedRoom }) {

	const [socket, setSocket] = useSocketContext();

	const [,,, [selectedPlayers, setSelectedPlayers],,] = useGameInfoContext();

	const [inLobby, setInLobby] = useLobbyContext();

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

	}, [selectedPlayers, sendSelected]);

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

	const startGame = async () => {

		try {

			await socket.emit("startGame", selectedPlayers);

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
								className={`absolute -right-1.5 -top-1.5 aspect-square h-3.5 rounded-full bg-cyan-500 transition-all duration-1000" ${newMessage ? "" : "invisible opacity-20"
									}`}
							/>
						</Button>

					</div>

					<h1 className="font-semibold text-lg mb-6 border border-b-slate-900">
						{gameInfo.roomName}
					</h1>

					{gameInfo && (
						<TooltipProvider>
							<Tooltip>
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

						<div className="flex flex-row items-center w-full p-4 pr-14 rounded-md border border-slate-400 bg-white dark:border-slate-800 dark:bg-slate-950 relative">
							<p className="text-sm break-all">{sessionUrl}</p>
							<Button
								className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500"
								onClick={handleCopy}
								variant={copied ? "greenNoHover" : "border"}
							>
								{(!copied && <Copy size={12} />) || <Check size={14} />}
							</Button>
						</div>

					</div>

					<h1 className="text-sm font-semibold mb-2">
						Select {gameInfo.numPlayers}{" "}
						{gameInfo.numPlayers === 1 ? "player" : "players"} for this round:
					</h1>

					<div className="flex flex-wrap gap-x-3 gap-y-3">

						{inLobby?.map((player, index) => {

							if (player.playerName === gameInfo.username) {

								return (

									<ContextMenu key={index}>
										<ContextMenuTrigger>
											<TooltipProvider>
												<Tooltip>
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
																<p className="text-slate-900 text-xs font-semibold">
																	{player.playerName.charAt(0).toUpperCase()}
																</p>
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
											<ContextMenuItem
												disabled
												className="cursor-pointer gap-3 pr-4 focus:bg-red-500 focus:text-slate-50"
											>
												<X size={16} />
												<p>Host cannot be removed from Lobby</p>
											</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>

								);

							} else {

								return (

									<ContextMenu key={index}>
										<ContextMenuTrigger>
											<TooltipProvider>
												<Tooltip>
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
																<p className="text-slate-900 text-xs font-semibold">
																	{player.playerName.charAt(0).toUpperCase()}
																</p>
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
											<ContextMenuItem
												disabled={gameInfo.numPlayers + gameInfo.aiPlayers <= 3}
												className="cursor-pointer gap-3 pr-4 focus:bg-red-500 focus:text-slate-50"
												onClick={() => {
													handleRemovePlayer(`player-${player.playerName}`);
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

						})}

						{inLobby && Array.from({ length: gameInfo.numPlayers - inLobby.length }, (_, index) => {

							if (inLobby.length < gameInfo.numPlayers) {

								return (

									<ContextMenu key={index}>
										<ContextMenuTrigger>
											<Badge
												className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
												variant="empty"
												key={index}
											>
												<div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
												<p>Player {inLobby.length + index + 1}</p>
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

						})}

						{Array.from({ length: gameInfo.aiPlayers }, (_, index) => {

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

						})}

					</div>

				</div>

				<div className="flex flex-row mt-auto pb-10 w-full justify-end">

					<Button
						className="w-25 mt-12"
						onClick={startGame}
						disabled={selectedPlayers.length === gameInfo.numPlayers ? false : true}
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
