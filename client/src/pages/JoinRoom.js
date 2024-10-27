"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from "../components/Chat";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Copy, Check, MessageSquare, LockKeyhole } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";
import { useMessageContext } from "../contexts/MessageContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";

function JoinRoom() {

    const [socket, setSocket] = useSocketContext();

    const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

    const [[inLobby, setInLobby], regPlayerCount] = useLobbyContext();

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();

    const [username, setUsername] = useState();

    const [success, setSuccess] = useState(0);

    const [sessionUrl, setSessionUrl] = useState();

    const [copied, setCopied] = useState(false);

    const [roomDetails, setRoomDetails] = useState();

    const [isFoundRoom, setIsFoundRoom] = useState(false);

    const [isReady, setIsReady] = useState(false);

    const [isClosedRoom, setIsClosedRoom] = useState();

    const [beenRemoved, setBeenRemoved] = useState(false);

    const [open, setOpen] = useState(true);

    // use %20 in address bar for space
    const { roomID } = useParams();

    const navigate = useNavigate();

    const invalidUsernameRef = useRef(null);

    useEffect(() => {

        if (roomDetails === undefined && !isClosedRoom && !beenRemoved) {

            console.log("checking room");

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();
        }

        // if username is not yet set
        if (!username) {

            if (isFoundRoom) {

                console.log("joining room");

                setIsFoundRoom(false);

                (async () => {

                    try {

                        await socket.emit("joinRoom", roomID, username);

                    } catch (error) {

                        throw error;

                    }

                })();

            }            

        } else {

            // if not already in lobby
            if (!inLobby.find(({playerName}) => { return playerName === username })) {

                console.log("registering username");

                // setIsFoundRoom(false);

                (async () => {

                    try {

                        await socket.emit("joinRoom", roomID, username);

                    } catch (error) {

                        throw error;

                    }

                })();

            } else {

                console.log("not gonna try to join room");

            }

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

            if (othersInLobby) {

                setIsFoundRoom(true);

                setSuccess(1);

                setInLobby(othersInLobby);

                setSessionUrl(sessionUrl);

                setRoomDetails(roomDetails);

                if (roomDetails.setGuesser) {

                    setGuesser(roomDetails.guesser);

                }

                if (inRoom) {

                    console.log("i'm already in here");

                    setUsername(playerName);

                    setOpen(false);

                    (async () => {

                        try {
        
                            await socket.emit("joinRoom", roomID, playerName, true);
        
                        } catch (error) {
        
                            throw error;
        
                        }
        
                    })();

                }

                // just for late joiners
                if (roomDetails.isGameStarted && playerName === undefined) {

                    setGuesser(roomDetails.guesser);

                    (async () => {

                        try {
        
                            await socket.emit("getPlayersInGame", roomDetails.hostID);
        
                        } catch (error) {
        
                            throw error;
        
                        }
        
                    })();

                }

            } else {

                if (isClosedRoom) {

                    setIsClosedRoom(true);

                } else {

                    console.log(`could not join room ${roomID}`);

                    setSuccess();

                }
            }

        });

        socket.on("getLobby", (othersInLobby, roomDetails, isClosedRoom) => {

            if (othersInLobby) {

                setInLobby(othersInLobby);

                setRoomDetails(roomDetails);

            } else {

                if (isClosedRoom) {

                    setUsername();

                    setIsClosedRoom(true);

                } else {

                    console.log(`could not join room ${roomID}`);

                }

                setSuccess();

                setOpen(true);

                setRoomDetails();

            }

        });

        socket.on("updateRoomInfo", (link, othersInLobby, roomID, newDetails) => {

            setInLobby(othersInLobby);

            setRoomDetails(newDetails);

            setIsGameStarted(newDetails.isGameStarted);

        });
        

        socket.on("getSelectedPlayers", (selectedPlayers) => {

            setSelectedPlayers(selectedPlayers);

        });

        socket.on("guesserSelected", (guesser) => {

            console.log(`The guesser is ${guesser}`);

            setGuesser(guesser);

        });

        socket.on("isRoomClosed", (isClosedRoom) => {

            setIsClosedRoom(isClosedRoom);

        });

        socket.on("receiveInGame", (inGame, roomDetails) => {

            setInGame(inGame);

            if (roomDetails) {

                setGuesser(roomDetails.guesser);

                setRoomDetails(roomDetails);

                setIsGameStarted(roomDetails.isGameStarted);

            }

        });

        socket.on("newHost", () => {

            navigate(`/newhost/${roomID}`);

        });

        socket.on("exitLobby", () => {

            setBeenRemoved(true);

            setUsername();

            setSuccess();

            setOpen(true);

            setRoomDetails();

        });

        return () => {

            socket.removeAllListeners("roomExists");
            socket.removeAllListeners("getLobby");
            socket.removeAllListeners("updateRoomInfo");
            socket.removeAllListeners("getSelectedPlayers");
            socket.removeAllListeners("guesserSelected");
            socket.removeAllListeners("isRoomClosed");
            socket.removeAllListeners("receiveInGame");
            socket.removeAllListeners("newHost");
            socket.removeAllListeners("exitLobby");

        }

    }, [socket, roomID, username, inLobby, navigate, roomDetails, isClosedRoom, beenRemoved, playerName, isFoundRoom]);

    useEffect(() => {

		if (inGame?.length === 0) {

			setInGame();
            
            setGuesser();

		}

	}, [inGame]);

    const handleChatExpansion = () => {

		setChatExpanded(!chatExpanded);

	}

    const form = useForm();

    function onSubmit(values) {

        // username cannot be blank
        if (values.username === "") {

            invalidUsernameRef.current.innerText = "Please enter a username.";

        // username cannot contain any spaces
        } else if (/\s/.test(values.username)) {

            invalidUsernameRef.current.innerText = "Username cannot contain spaces."

        // username must be at least 3 characters
        } else if (!/.{3,}/.test(values.username)) {

            invalidUsernameRef.current.innerText = "Username must be at least 3 characters long.";

        // username must contain at least one letter
        } else if (!/(.*[a-z]){1}/i.test(values.username)) {

            invalidUsernameRef.current.innerText = "Username must contain at least one letter.";

        // cannot enter an existing username
        } else if (values.username !== username && inLobby.some((player) => { return player.playerName === values.username })) {

            invalidUsernameRef.current.innerText = "This username has already been taken.";

        } else {

            invalidUsernameRef.current.innerText = "";

            console.log(values.username);

            setUsername(values.username);

            setOpen(false);

        }

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

    const handleReady = () => {

        setIsReady(!isReady);

        try {

            socket.emit("sendIsReady", roomID);

        } catch (error) {

            throw error;

        }

    }

	return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-tr from-slate-950 from-30% via-slate-900 via-75% to-slate-950 to-100%">

                {success && (

                    <div className={`flex flex-none flex-col h-[85vh] bg-slate-50 border rounded-lg p-12 pb-0 gap-8 overflow-auto transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60vw]" : "w-[35vw]"}`}>

                        <div className="flex flex-row h-full w-full gap-6">

                            <div className={`flex flex-col flex-none h-full gap-6 transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60%]" : "w-full"}`}>

                                <div className="flex flex-row items-end w-full">

                                    <h1 className="font-semibold text-xl underline">{roomDetails.roomName}</h1>

                                    <Button className="flex justify-end mb-4 ml-auto gap-x-2 relative" variant="border" onClick={handleChatExpansion}>
                                        <h2 className="text-xs leading-none m-0 p-0">Chat</h2>
                                        <MessageSquare size={14} />
                                        <div className={`absolute -right-1.5 -top-1.5 aspect-square h-3 rounded-full bg-cyan-500 transition-all duration-1000" ${newMessage ? "" : "invisible opacity-20"}`} />
                                    </Button>

                                </div>

                                {username && (

                                    <TooltipProvider>                      
                                        <Tooltip delayDuration={0}>
                                            <div className="py-2 w-fit">
                                                <h1 className="text-xl font-extralight">{`Welcome `}
                                                    <TooltipTrigger asChild>
                                                        <span className="font-normal hover:underline hover:cursor-pointer" onClick={() => {setOpen(true)}}>{username}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-semibold">{`Change Username`}</p>
                                                    </TooltipContent>
                                                !</h1>
                                            </div>
                                        </Tooltip>
                                    </TooltipProvider>

                                )}

                                <div>

                                    <div className="mb-6">
                                        <div className="flex flex-row items-center mb-2">
                                            <h1 className="text-sm font-semibold">Link</h1>
                                        </div>

                                        <div className={`flex flex-row items-center w-full p-4 pr-14 rounded-md border border-slate-400 dark:border-slate-800 dark:bg-slate-950 relative transition-all duration-300 ${!isClosedRoom ? "bg-white" : "bg-slate-200"}`}>

                                            {!isClosedRoom && (

                                                <>

                                                    <p className="text-sm break-all">{sessionUrl}</p>
                                                    <Button className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>

                                                </>

                                            ) || (

                                                <>
                                                    <LockKeyhole className="stroke-2 stroke-slate-900 mr-3" size={15} />
                                                    <p className="text-sm">Your host <span className="font-semibold underline">{roomDetails.host}</span> has closed this room</p>
                                                </>

                                            )}

                                        </div>
                                        
                                    </div>

                                    <div className="mb-6">

                                        <h1 className="text-sm font-semibold mb-2">
                                            
                                            {inGame && (

                                                `${roomDetails.host} will be selecting ${roomDetails.numPlayers} ${roomDetails.numPlayers === 1 ? "player" : "players"} for the next round:`

                                            ) || (

                                                `${roomDetails.host} will be selecting ${roomDetails.numPlayers} ${roomDetails.numPlayers === 1 ? "player" : "players"} for this round:`

                                            )}
                                        
                                        </h1>

                                        <div className="flex flex-wrap gap-x-3 gap-y-3">

                                            {inLobby?.map((player, index) => {

                                                if (player.playerName === roomDetails.host) {

                                                    if (!inGame?.includes(player.playerName)) {

                                                        return (

                                                            <TooltipProvider key={index}>                      
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button 
                                                                            className={`flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer`}
                                                                            variant={
                                                                                selectedPlayers.includes(player.playerName)
                                                                                    ? "green"
                                                                                    : "indigo"
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
                                                                    <TooltipContent>
                                                                        <p className="font-semibold">{`👑 Host`}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
    
                                                        );

                                                    }

                                                } else {

                                                    if (player.playerName && !inGame?.includes(player.playerName)) {

                                                        return (

                                                            <TooltipProvider key={index}>                      
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
                                                                            variant={
                                                                                selectedPlayers.includes(player.playerName) 
                                                                                    ? "green" 
                                                                                    : 
                                                                                        player.isReady 
                                                                                        ? "default" 
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
                                                                            <p className="font-semibold">This player is not ready</p>
                                                                        </TooltipContent>
    
                                                                    )}
    
                                                                </Tooltip>
                                                            </TooltipProvider>
    
                                                        );

                                                    }

                                                }
                                            })}

                                            {inLobby && Array.from({ length: roomDetails.numPlayers - regPlayerCount }, (_, index) => {

                                                if (!inGame) {

                                                    if (regPlayerCount < roomDetails.numPlayers) {

                                                        return (

                                                            <Badge className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer" variant="empty" key={index}>
                                                                <div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
                                                                <p>Player {regPlayerCount + index + 1}</p>
                                                            </Badge>
                                
                                                        );
                                                    }

                                                }

                                            })}

                                            {inGame && !inGame.includes(playerName) && ((regPlayerCount - inGame.length) < roomDetails.numPlayers) && Array.from({ length: roomDetails.numPlayers - (regPlayerCount - inGame.length) }, (_, index) => {

                                                return (

                                                    <Badge className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer" variant="empty" key={index}>
                                                        <div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
                                                        <p>Player {(regPlayerCount - inGame.length) + index + 1}</p>
                                                    </Badge>

                                                );

                                            })}

                                            {/* {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

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

                                                {/* {Array.from({ length: roomDetails.prevAiPlayers }, (_, index) => {

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

                                <div className="flex flex-row mt-auto w-full justify-end pt-8 pb-12">
                                    <Button className="w-28" onClick={handleReady} variant={ isReady ? "green": "default" }>{ isReady ? "Ready!" : "Ready Up" }</Button>
                                </div>

                            </div>

                            <div className={`overflow-hidden pb-12 ${chatExpanded ? "h-full w-full" : "w-0"}`}>

                                <Chat username={username} roomName={roomDetails.roomName} roomID={roomID} />

                            </div>

                        </div>

                    </div>

                )}

            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="gap-0">

                    {roomDetails && (

                        <>

                            <AlertDialogHeader className="space-y-0 mb-8">
                                <AlertDialogTitle>Welcome to Just One!</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You'll be joining {roomDetails.roomName}
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <Form {...form}>
                                <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
                                    <FormField
                                        defaultValue={''}
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        autoFocus
                                                        placeholder={"Enter Your Username"} 
                                                        {...field}
                                                        id="username"
                                                        onFocus={(event) => event.target.select()}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="my-2 h-8">
                                        <p className="text-xs text-red-500" ref={invalidUsernameRef}></p>
                                    </div>
                                    
                                    <Button className="flex flex-row self-end" type="submit">Submit</Button>

                                </form>
                            </Form>

                        </>

                    ) || beenRemoved && (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>You have been removed from this lobby.</p>
                                <p>Please contact the host for further details.</p>
                            </div>

                        </>

                    ) || isClosedRoom && (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>This is a closed room.</p>
                                <p>Please contact the host to join this room.</p>
                            </div>

                        </>

                    ) || (

                        <>

                            <AlertDialogHeader className="space-y-2">
                                <AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
                                <p>Oops! It looks like this room doesn't exist.</p>
                                <p>Please double check the link you were sent.</p>
                            </div>

                        </>

                    )}
                    
                </AlertDialogContent>
            </AlertDialog>

        </>

	);

}

export default JoinRoom;
