"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Lobby from "../components/Lobby";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useSocketContext } from "../contexts/SocketContext";

function JoinRoom() {

    const [socket, setSocket] = useSocketContext();

    const [roomExists, setRoomExists] = useState(false);

    const [username, setUsername] = useState();

    const [success, setSuccess] = useState(false);

    const [lobby, setLobby] = useState([]);

    const [open, setOpen] = useState(true);

    // use %20 in address bar for space
    let { roomName } = useParams();

    useEffect(() => {

        (async () => {

            await socket.emit("roomCheck", roomName, setRoomExists);

        })();

        if (username) {

            (async () => {

                await socket.emit("joinRoom", roomName);
    
            })();

        } else {

            console.log("nope");

        }

        socket.on("getLobby", (othersInLobby) => {

            if (othersInLobby) {

                setSuccess(true);

                setLobby(othersInLobby);

            } else {

                console.log(`could not join room ${roomName}`);

            }

        });

        return () => {

            socket.removeAllListeners("getLobby");

        }

    }, [socket, roomName, username, roomExists]);

    const form = useForm();

    function onSubmit(values) {

		console.log(values.username);

        setUsername(values.username);

        setOpen(false);

	}

	return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700">

                <div className="h-[80vh] w-[60vw] bg-slate-50 border rounded-3xl p-12">

                <h1 className="font-semibold text-2xl">Join A Lobby</h1>

                {success && (

                    <div>

                        <p>{`Joined room ${roomName}`}</p>

                        {lobby.map((player, index) => {

                            return (

                                <p key={index}>{player}</p>

                            );

                        })}

                    </div>

                ) || (

                    <>
                    </>

                )} 

                </div>

            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="gap-0">

                    {roomExists && (

                        <>

                            <AlertDialogHeader className="space-y-0 mb-8">
                                <AlertDialogTitle>Welcome to Just One!</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You'll be joining room: {roomName}
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
