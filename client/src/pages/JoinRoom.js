"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chat from "../components/Chat";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Copy, Check, MessageSquare } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";

function JoinRoom() {

    const [socket, setSocket] = useSocketContext();

    const [roomName, setRoomName] = useState();

    const [username, setUsername] = useState();

    const [success, setSuccess] = useState(0);

    const [lobby, setLobby] = useState();

    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const [sessionUrl, setSessionUrl] = useState();

    const [copied, setCopied] = useState(false);

    const [roomDetails, setRoomDetails] = useState();

    const [isReady, setIsReady] = useState(false);

    const [chatExpanded, setChatExpanded] = useState(false);

    const [open, setOpen] = useState(true);

    // use %20 in address bar for space
    let { roomID } = useParams();

    useEffect(() => {

        if (roomName === undefined) {

            console.log("checking room");

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID, setRoomName);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();
        }

        if (username) {

            (async () => {

                try {

                    await socket.emit("joinRoom", roomID, username);

                } catch (error) {

                    throw error;

                }

            })();

        } else {

            console.log("nope");

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails) => {

            if (othersInLobby) {

                setSuccess(1);

                setLobby(othersInLobby);

                setSessionUrl(sessionUrl);

                setRoomDetails(roomDetails);

            } else {

                console.log(`could not join room ${roomID}`);

                setSuccess(2);

            }

        });

        socket.on("getLobby", (othersInLobby) => {

            if (othersInLobby) {

                setLobby(othersInLobby);

            } else {

                console.log(`could not join room ${roomID}`);

                setSuccess(2);

            }

        });

        socket.on("receiveMessage", (messageData) => {

            console.log(messageData);

        });

        return () => {

            socket.removeAllListeners("roomExists");
            socket.removeAllListeners("getLobby");
            socket.removeAllListeners("receiveMessage");

        }

    }, [socket, roomID, username, roomName]);

    const form = useForm();

    function onSubmit(values) {

        if (values.username !== "") {

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

        // socket.emit("playerIsReady");

    }

	return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700">

                <div className={`flex flex-none flex-col h-[85vh] bg-slate-50 border rounded-3xl p-12 gap-8 overflow-hidden transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60vw]" : "w-[35vw]"}`}>

                    {success === 1 && (

                        <div className="flex flex-row h-full w-full gap-6">

                            <div className={`flex flex-col flex-none h-full gap-6 transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60%]" : "w-full"}`}>

                                <div className="flex flex-row items-end w-full">

                                    <h1 className="font-semibold text-xl underline">{roomName}</h1>

                                    <Button className="flex justify-end mb-4 ml-auto gap-x-2 relative" variant="border" onClick={() => {setChatExpanded(value => !value)}}>
                                        <h2 className="text-xs leading-none m-0 p-0">Chat</h2>
                                        <MessageSquare size={14} />
                                        <div className={`absolute -right-1.5 -top-1.5 aspect-square h-3.5 rounded-full bg-cyan-500 transition-all duration-1000" ${isReady ? "" : "invisible opacity-20"}`}/>
                                    </Button>

                                </div>

                                <div>

                                    <div className="mb-6">
                                        <div className="flex flex-row items-center mb-2">
                                            <h1 className="text-sm font-semibold">Link</h1>
                                        </div>
                                        <div className="flex flex-row items-center w-full p-4 pr-14 rounded-md border border-slate-400 bg-white dark:border-slate-800 dark:bg-slate-950 relative">
                                            <p className="text-sm break-all">{sessionUrl}</p>
                                            <Button className="flex absolute right-3 h-fit p-2 transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "greenNoHover" : "border"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>
                                        </div>
                                    </div>

                                    <h1 className="text-sm font-semibold mb-2">The host is selecting the players for this round:</h1>

                                    <div className="flex flex-wrap gap-x-3 gap-y-3">

                                        {lobby.map((player, index) => {

                                            return (

                                                <Badge className="flex px-3 py-2 h-10 rounded-lg items-center" 
                                                    key={index} 
                                                    variant={player === username ? (isReady ? "default" : "disabled") : selectedPlayers.includes(player) ? "greenNoHover" : ""}
                                                >
                                                    <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                        <p className="text-slate-900">{player.charAt(0).toUpperCase()}</p>
                                                    </div>
                                                    <p>{player}</p>
                                                </Badge>

                                            );

                                        })}

                                        {lobby && Array.from({ length: roomDetails.numPlayers - lobby.length }, (_, index) => {

                                            if (lobby.length < roomDetails.numPlayers) {

                                                return (

                                                    <Badge className="flex px-3 py-2 h-10 rounded-lg items-center" variant="empty" key={index}>
                                                        <div className="flex aspect-square h-full bg-slate-400 rounded-full items-center justify-center mr-3" />
                                                        <p>Player {lobby.length + index + 1}</p>
                                                    </Badge>
                        
                                                );
                                            }

                                        })}

                                        {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

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

                                <div className="flex flex-row mt-auto w-full justify-end">
                                    <Button className="w-25" onClick={handleReady} variant={ isReady ? "greenNoHover": "default" }>{ isReady ? "Ready!" : "Ready Up" }</Button>
                                </div>

                            </div>

                            <Chat chatExpanded={chatExpanded} username={username} roomName={roomName} inLobby={lobby} roomID={roomID} isHost={false} />

                        </div>

                    ) || success === 2 && (

                        <div>

                            <p>{`Could not join room: ${roomID}`}</p>

                        </div>

                    )} 

                </div>

            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="gap-0">

                    {roomName && (

                        <>

                            <AlertDialogHeader className="space-y-0 mb-8">
                                <AlertDialogTitle>Welcome to Just One!</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You'll be joining {roomName}
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <Form {...form}>
                                <form className="flex flex-col gap-12" onSubmit={form.handleSubmit(onSubmit)}>
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
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className="flex flex-row self-end" type="submit">Submit</Button>
                                </form>
                            </Form>

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
