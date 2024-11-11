import React, { useEffect, useState, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { ChevronUp, User, Users } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";
import { useMessageContext } from "../contexts/MessageContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";

function Chat({ username, roomName, roomID }) {

    const [socket, setSocket] = useSocketContext();

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]] = useGameInfoContext();

    const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

    const [[inLobby, setInLobby], regPlayerCount] = useLobbyContext();

    const [message, setMessage] = useState('');

    const [currentUsername, setCurrentUsername] = useState('');

    const lastMessageRef = useRef(null);

    const inputRef = useRef(null);

    const handleChange = (event) => {

        setMessage(event.target.value);

    }

    const sendMessage = async () => {

        if (message !== "") {

            const today = new Date();

            const ampm = today.getHours() >= 12 ? 'pm' : 'am';

            const hours = (today.getHours() % 12) === 0 ? 12 : (today.getHours() % 12);

            const minutes = ("0" + today.getMinutes()).slice(-2);

            let currentTime = hours + ":" + minutes + " " + ampm;

            const messageData = {

                author: username,
                message: message,
                time: currentTime

            };

            try {

                await socket.emit("sendMessage", roomID, messageData);

            } catch (error) {

                throw error;

            }

            setMessageList((list) => [...list, messageData]);

            setMessage('');

            inputRef.current.focus();

        }
    }

    const replaceUsername = async (prevUsername, newUsername) => {

        setMessageList(messageList.map((message) => {

            if (message.author === prevUsername) {

                return {...message, author: newUsername};

            } else {

                return message;

            }

        }));

        if (prevUsername === currentUsername) {

            try {

                await socket.emit("newUsername", roomID, currentUsername, username);
    
            } catch (error) {
    
                throw error;
    
            }
    
            setCurrentUsername(username);

        }
    }

    useEffect(() => {

        if (!currentUsername) {

            setCurrentUsername(username);

        } else if (currentUsername !== username) {

            replaceUsername(currentUsername, username);

        }

        socket.on("getNewUsername", (prevUsername, newUsername) => {

            replaceUsername(prevUsername, newUsername);

        });

        const listenForKeydown = (event) => {

            if (document.activeElement.name === "chat" && event.key === "Enter") {

                sendMessage();

            } 

        }

        document.addEventListener("keydown", listenForKeydown);

        return () => {

            socket.removeAllListeners("getNewUsername");
            document.removeEventListener("keydown", listenForKeydown);

        }

    }, [socket, document.activeElement, sendMessage, replaceUsername, currentUsername, username]);

    useEffect(() => {

        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });

    }, [messageList]);

    return (

        <div className={`flex flex-col w-full h-full bg-white rounded-lg border border-slate-400 overflow-hidden transition-all ease-in-out duration-1000 ${chatExpanded ? "" : "invisible opacity-5 -translate-x-3"}`}>

            <div className={`flex flex-row items-center mb-1 px-4 py-2 h-[10%] bg-slate-200/70 border-solid border-b border-slate-400`}>

                <TooltipProvider>                      
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>

                            {inLobby?.some((player) => { return (player.playerName !== username && player.isReady) }) && (

                                <div className="h-2 w-2 bg-green-500 rounded mr-3"/>

                            ) || (

                                <div className="h-2 w-2 bg-red-500 rounded mr-3"/>


                            )}
                            
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold">{inLobby?.some((player) => { return (player.playerName !== username && player.isReady) }) ? "Active" : "Inactive"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <h2 className={`text-sm pr-2 whitespace-nowrap transition-all ease-in-out duration-1000 ${chatExpanded ? "" : "invisible opacity-20"}`}>{roomName}</h2>

                <DropdownMenu className="relative">
                    <DropdownMenuTrigger asChild className="aspect-square h-full ml-auto border border-solid border-slate-400">
                        <Button className="p-0" variant="outline"><Users size={14} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="absolute -right-4 w-60 border border-solid border-slate-400">
                        <DropdownMenuLabel>Players</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-300" />
                        <DropdownMenuGroup>
                            
                            {inLobby?.map(({playerName}, index) => {

                                return (

                                    <DropdownMenuItem key={index} className="flex flex-row flex-none">
                                        <User className="flex flex-none mr-2 h-4 w-4" />
                                        <h2 className="flex break-all">{playerName}</h2>
                                    </DropdownMenuItem>

                                );

                            })}

                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>

            <div className="flex flex-col h-full w-full overflow-hidden">

                <div className="flex flex-col w-full h-full py-4 pr-3 pl-4 overflow-y-scroll overflow-x-hidden">

                    {messageList.map((messageContent, index) => {

                        return (

                            <div key={index} className={`flex flex-col w-full gap-2 mb-1 ${username === messageContent.author ? "items-end" : "items-start"}`}>

                                {(messageContent.author !== messageList[index - 1]?.author) && (
                                    
                                    <div className="mr-1">

                                        <p className="leading-none text-xs">{messageContent.author}</p>

                                    </div>
                                
                                )}

                                <div className={`max-w-40 break-words p-3 rounded-lg overflow-hidden ${username === messageContent.author ? "bg-sky-500 text-white" : "bg-slate-200"}`}>
                                    <p className={`leading-none text-sm break-words ${isGameStarted && (username === guesser) && (username !== messageContent.author) ? 'blur' : ''} } `}>{messageContent.message}</p>

                                </div>

                                {(messageContent.author !== messageList[index + 1]?.author) && (
                                    
                                    <div className="mr-1 mb-4 leading-none text-xs">

                                        {messageContent.time}

                                    </div>
                                
                                )}

                            </div>

                        );

                    })}

                    <div ref={lastMessageRef} />

                </div>

            </div>

            <div className={`flex flex-row items-center py-3 px-3 gap-3 h-[12%] w-full mt-auto bg-slate-200 border-solid border-t border-slate-400 transition-all ease-in-out duration-1000 ${chatExpanded ? "" : "invisible opacity-20"}`}>

                <Input 
                    autoComplete="off"
                    className={`h-full w-full bg-white rounded-full border border-slate-400 pl-[7%] text-sm whitespace-nowrap`}
                    type="text"
                    id="chat"
                    name="chat"
                    placeholder="Send a message..."
                    value={message}
                    onChange={handleChange}
                    ref={inputRef}
                />

                <Button 
                    className={`flex aspect-square h-full rounded-full bg-white items-center justify-center border border-slate-400 p-0 text-slate-900 hover:bg-slate-50 active:bg-slate-200`}
                    type="submit"
                    onClick={sendMessage}
                >

                    <ChevronUp size={18} />

                </Button>

            </div>

        </div>

    );

}

export default Chat;