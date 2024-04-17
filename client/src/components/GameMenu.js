import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Switch } from "../components/ui/switch";
import { User, Users, Copy, Check, LockKeyhole } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";

const GameMenu = ({ roomDetails, isClosedRoomState, sessionUrl }) => {

    const [socket, setSocket] = useSocketContext();

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting]] = useGameInfoContext();

    const [inLobby, setInLobby] = useLobbyContext();

    const [isClosedRoom, setIsClosedRoom] = isClosedRoomState;

    const [copied, setCopied] = useState(false);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [isWaitingOpen, setIsWaitingOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        if (!isPopoverOpen) {

            setIsWaitingOpen(false);

        }

        if (isWaitingOpen) {

            setIsPlayerWaiting(false);

        }

    }, [isPopoverOpen, setIsPlayerWaiting, isWaitingOpen, isPlayerWaiting]);

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

    const handleNavigateLobby = async () => {

        try {

            await socket.emit("returnToLobby", roomDetails.roomID, playerName);

            if (playerName === roomDetails.host) {

                navigate(`/newhost/${roomDetails.roomID}`);
    
            } else {
    
                navigate(`/lobby/${roomDetails.roomID}`);
    
            }


        } catch (error) {

            throw error;

        }

    }

    return (

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>

            <PopoverTrigger asChild>
                <div className="absolute top-0 right-0 m-6">
                    <div className="relative">
                        <Button className="p-0 aspect-square mb-1" variant="outline"><Users size={14} /></Button>
                        <div className={`absolute -top-1 -right-1 aspect-square w-2.5 rounded-full bg-cyan-500 transition-all duration-500 ${isPlayerWaiting ? "" : "invisible opacity-5"}`} />
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-96 max-h-[80vh] overflow-auto mr-6 p-4">

                <div className="flex flex-row items-center bg-slate-100 p-4 rounded-lg transition-colors duration-300 [&:hover:not(:has(button:hover))]:bg-slate-200">

                    <div className="flex items-center justify-center h-10 aspect-square rounded-full bg-slate-900">
                        <p className="text-slate-50 text-xl">{playerName.charAt(0).toUpperCase()}</p>
                    </div>

                    <h3 className="text-lg text-slate-900 px-6">{playerName}</h3>

                    <AlertDialog>

                        <AlertDialogTrigger asChild>
                            <Button 
                                className="ml-auto flex flex-row justify-center items-center bg-slate-400 hover:bg-red-600 rounded-lg transition-colors duration-300 cursor-pointer"
                            >
                                <h3 className="text-xs font-semibold text-slate-50">Return to Lobby</h3>
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="space-y-4">

                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to return to lobby?</AlertDialogTitle>
                                <AlertDialogDescription>You won't be able to come back to this game and your progress will be lost.</AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleNavigateLobby}>Return to Lobby</AlertDialogAction>
                            </AlertDialogFooter>

                        </AlertDialogContent>
                    </AlertDialog>

                </div>

                <div>

                    <Accordion className="mt-2 px-2" type="multiple">

                        <AccordionItem className="w-full border-slate-200" value="item-1">

                            <AccordionTrigger>{`In Game:`}</AccordionTrigger>

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

                        <AccordionItem open={false} className="w-full border-slate-200" value="item-2">

                            <AccordionTrigger onClick={() => {setIsWaitingOpen(value => !value)}}>
                                <div className="flex flex-row items-center w-full">
                                    <h2>{`Waiting in Lobby:`}</h2>
                                    <div className={`aspect-square w-2 ml-auto mr-6 rounded-full bg-cyan-500 transition-all duration-500 ${isPlayerWaiting ? "" : "invisible opacity-5"}`} />
                                </div>
                            </AccordionTrigger>

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

                            <AccordionTrigger>{`Share Link:`}</AccordionTrigger>

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

    );

}

export default GameMenu;