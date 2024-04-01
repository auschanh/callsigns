import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SmallSwitch } from "../components/ui/small-switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { useSocketContext } from "../contexts/SocketContext";
import { Copy, Check, ChevronLeft, MessageSquare } from "lucide-react";

const Lobby = function ({ gameInfo, sessionUrl, inLobby, previousSlide, handleChatExpansion, newMessage }) {

	const [socket, setSocket] = useSocketContext();

	const [allowSharing, setAllowSharing] = useState(false);

	const [copied, setCopied] = useState(false);

	const [selectedPlayers, setSelectedPlayers] = useState([]);

	useEffect(() => {

		selectedPlayers.forEach((player) => {

			if (!inLobby.some(({playerName}) => { return playerName === player })) {

				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player }));

			}

		});

		inLobby?.forEach((player) => {

			if (selectedPlayers.includes(player.playerName) && !player.isReady) {

				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player.playerName }));

			} 

		});

	}, [inLobby]);

	const handleAllowSharing = async () => {

		try {

			await socket.emit("allowSharing", !allowSharing);

		} catch (error) {

			throw error;

		}

		setAllowSharing(!allowSharing);

	}

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

	const handleSelectPlayer = (player) => {

		if (player.isReady) {

			console.log("sure " + player + " is ready");

			if (!selectedPlayers.includes(player.playerName)) {

				setSelectedPlayers([...selectedPlayers, player.playerName]);
	
			} else {
	
				setSelectedPlayers(selectedPlayers.filter((value) => { return value !== player.playerName }));
	
			}

		} else {

			console.log(player.playerName + " is not ready");

		}

	}

	return (

		<div className="flex flex-col h-full">

			<div className="flex flex-col bg-slate-200 border-slate-400 rounded-md">

				<div className="flex flex-row justify-between mb-2 relative">

					<Button className="px-0 w-fit text-xs" variant="link" onClick={previousSlide}>
						<ChevronLeft size={20} />
						<p>Edit</p>
					</Button>

					<Button className="gap-x-2" variant="border" onClick={handleChatExpansion}>
						<h2 className="text-xs leading-none m-0 p-0">Chat</h2>
						<MessageSquare size={14} />
						<div className={`absolute -right-1.5 -top-1.5 aspect-square h-3.5 rounded-full bg-cyan-500 transition-all duration-1000" ${newMessage ? "" : "invisible opacity-20"}`} />
					</Button>

				</div>

				<h1 className="font-semibold text-lg mb-6 border border-b-slate-900">{gameInfo.roomName}</h1>

				{gameInfo && (

					<TooltipProvider>                      
						<Tooltip>
							<div className="py-2 w-fit mb-6">
								<h1 className="text-xl font-extralight">{`Welcome `}
									<TooltipTrigger asChild>
										<span className="font-normal hover:underline hover:cursor-pointer" onClick={previousSlide}>{gameInfo.username}</span>
									</TooltipTrigger>
									<TooltipContent>
										<p className="font-semibold">{`Change Username`}</p>
									</TooltipContent>
								!</h1>
							</div>
						</Tooltip>
					</TooltipProvider>

				)}

				<div className="mb-6">
					<div className="flex flex-row items-center mb-2">
						<h1 className="text-sm font-semibold">Link</h1>
						<div className="flex items-center justify-end w-full">
							<p className="text-xs mr-2">Allow sharing:</p>
							<SmallSwitch
								className="data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-slate-400"
								checked={allowSharing}
								onCheckedChange={handleAllowSharing}
							/>
						</div>
					</div>
					<div className="flex flex-row items-center w-full p-4 pr-14 rounded-md border border-slate-400 bg-white dark:border-slate-800 dark:bg-slate-950 relative">
						<p className="text-sm break-all">{sessionUrl}</p>
						<Button className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>
					</div>
				</div>

				<h1 className="text-sm font-semibold mb-2">Select {gameInfo.numPlayers} {gameInfo.numPlayers === 1 ? "player" : "players"} for this round:</h1>

				<div className="flex flex-wrap gap-x-3 gap-y-3">

					{inLobby?.map((player, index) => {

						if (player.playerName === gameInfo.username) {

							return (

								<TooltipProvider key={index}>                      
									<Tooltip>
										<TooltipTrigger asChild>
											<Button 
												className={`flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer`}
												variant={selectedPlayers.includes(player.playerName) ? "greenNoHover" : "indigo"}
												onClick={() => { handleSelectPlayer(player) }} 
											>
												<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
													<p className="text-slate-900 text-xs font-semibold">{player.playerName.charAt(0).toUpperCase()}</p>
												</div>
												<p className="text-xs">{player.playerName}</p>
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-semibold">{`👑 Host`}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

							)

						} else {

							return (

								<Badge 
									key={index} 
									className={`flex px-3 py-2 h-10 rounded-lg items-center ${player.isReady ? "cursor-pointer" : ""}`}
									onClick={() => { handleSelectPlayer(player) }} 
									variant={player.isReady ? (selectedPlayers.includes(player.playerName) ? "greenNoHover" : "default") : "disabled"}
								>
									<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
										<p className="text-slate-900">{player.playerName.charAt(0).toUpperCase()}</p>
									</div>
									<p>{player.playerName}</p>
								</Badge>

							);

						}

					})}

					{inLobby && Array.from({ length: gameInfo.numPlayers - inLobby.length }, (_, index) => {

						if (inLobby.length < gameInfo.numPlayers) {

							return (

								<Badge className="flex px-3 py-2 h-10 rounded-lg items-center" variant="empty" key={index}>
									<div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
									<p>Player {inLobby.length + index + 1}</p>
								</Badge>
	
							);
						}

					})}

					{Array.from({ length: gameInfo.aiPlayers }, (_, index) => {

						return (

							<Badge className="flex px-3 py-2 h-10 rounded-lg items-center" variant="bot" key={index}>
								<div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
									<p className="text-slate-900">🤖</p>
								</div>
								<p>Bot {index + 1}</p>
							</Badge>

						);

					})}

				</div>

			</div>

			{/* <div className="border border-black mt-2 max-h-full flex-1 h-auto max-w-screen"></div> */}

			{/* <Link to="game"> */}
			<div className="flex flex-row mt-auto w-full justify-end">
				<Button className="w-25" onClick={() => {console.log(selectedPlayers)}} disabled={ selectedPlayers.length === gameInfo.numPlayers ? false : true }>Start Game</Button>
			</div>
			{/* </Link> */}

		</div>

	);
};

export default Lobby;
