import React, { useEffect, useState, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronUp, User, Users } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";

function Chat({ chatExpanded, username, roomName, inLobby, roomID, isHost }) {

    const [socket, setSocket] = useSocketContext();

    const [message, setMessage] = useState('');

    const [messageList, setMessageList] = useState([]);

    const lastMessageRef = useRef(null);

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

        }
    }

    useEffect(() => {

        socket.on("receiveMessage", (messageData) => {

            console.log(messageData);

        });

        const listenForKeydown = (event) => {

            if (document.activeElement.name === "chat" && event.key === "Enter") {

                sendMessage();

            } 

        }

        document.addEventListener("keydown", listenForKeydown);

        return () => {

            socket.removeAllListeners("receiveMessage");
            document.removeEventListener("keydown", listenForKeydown);

        }

    }, [socket, document.activeElement, sendMessage]);

    useEffect(() => {

        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });

    }, [messageList]);

    return (

        <div className={`flex flex-col w-full h-full bg-white rounded-lg border border-slate-400 overflow-hidden transition-all ease-in-out duration-1000 ${chatExpanded ? "" : "invisible opacity-5 -translate-x-3"}`}>

            <div className={`flex flex-row items-center mb-1 px-4 py-2 h-[10%] bg-slate-200/70 border-solid border-b border-slate-400`}>

                <div className="h-2 w-2 bg-green-500 rounded mr-3"/>
                <h2 className={`text-sm pr-2 whitespace-nowrap transition-all ease-in-out duration-1000 ${chatExpanded ? "" : "invisible opacity-20"}`}>{roomName}</h2>

                <DropdownMenu className="relative">
                    <DropdownMenuTrigger asChild className="aspect-square h-full ml-auto border border-solid border-slate-400">
                        <Button className="p-0" variant="outline"><Users size={14} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="absolute -right-4 w-60 border border-solid border-slate-400">
                        <DropdownMenuLabel>Players</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-300" />
                        <DropdownMenuGroup>
                            
                            {inLobby && (

                                inLobby.map((player, index) => {

                                    return (

                                        <DropdownMenuItem key={index} className="flex flex-row flex-none">
                                            <User className="flex flex-none mr-2 h-4 w-4" />
                                            <h2 className="flex break-all">{player}</h2>
                                        </DropdownMenuItem>

                                    );

                                })

                            )}

                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>

            <div className="flex flex-col h-full w-full overflow-hidden">

                <div className="flex flex-col w-full h-full p-3 overflow-y-scroll overflow-x-hidden">

                    {messageList.map((messageContent, index) => {

                        return (

                            <div key={index} className={`flex flex-col w-full mb-4 ${username === messageContent.author ? "items-end" : "items-start"}`}>

                                <div className={`max-w-40 break-words p-3 rounded-lg overflow-hidden ${username === messageContent.author ? "bg-sky-500 text-white" : "bg-slate-200"}`}>

                                    <p className="leading-none text-sm break-words">{messageContent.message}</p>

                                </div>

                                <div className="mt-1 mr-1">

                                    <p className="leading-none text-xs">{messageContent.time}</p>

                                </div>

                            </div>

                        )

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