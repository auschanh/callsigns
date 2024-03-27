"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useSocketContext } from "../contexts/SocketContext";

function JoinRoom() {

    const [socket, setSocket] = useSocketContext();

    const [roomName, setRoomName] = useState();

    const [username, setUsername] = useState();

    const [success, setSuccess] = useState(0);

    const [lobby, setLobby] = useState();

    const [sessionUrl, setSessionUrl] = useState();

    const [copied, setCopied] = useState(false);

    const [roomDetails, setRoomDetails] = useState();

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

        socket.on("getLobby", (othersInLobby, sessionUrl, roomDetails) => {

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

        socket.on("receiveMessage", (messageData) => {

            console.log(messageData);

        });

        return () => {

            socket.removeAllListeners("getLobby");
            socket.removeAllListeners("receiveMessage");

        }

    }, [socket, roomID, username, roomName]);

    const form = useForm();

    function onSubmit(values) {

		console.log(values.username);

        setUsername(values.username);

        setOpen(false);

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

	return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700">

                <div className="h-[80vh] w-[60vw] bg-slate-50 border rounded-3xl p-12">

                <h1 className="font-semibold text-2xl">Join A Game</h1>

                {success === 1 && (

                    <div>

                        <h1>{roomName}</h1>

                        {lobby.map((player, index) => {

                            return (

                                <Badge key={index}>{player}</Badge>

                            );

                        })}

                        <p>{sessionUrl}</p>
                        <Button className="transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "green" : "default"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>

                        <p>{roomDetails.roomID}</p>
                        <p>{roomDetails.roomName}</p>
                        <p>{roomDetails.numPlayers}</p>
                        <p>{roomDetails.aiPlayers}</p>

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
