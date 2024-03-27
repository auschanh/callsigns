import React, { useState, useEffect } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "../components/ui/button";
import Chat from "./Chat";
import { useSocketContext } from "../contexts/SocketContext";

import CreateGameForm from "./CreateGameForm";
import Lobby from "./Lobby";

const DialogPlay = function ({ tailwindStyles, variant, triggerName, isOpen }) {

    const [socket, setSocket] = useSocketContext();

    const [currentSlide, setCurrentSlide] = useState(0);

    const spaceBetweenSlides = 5;

	const [gameInfo, setGameInfo] = useState();

    const [open, setOpen] = isOpen;

    const [sessionUrl, setSessionUrl] = useState();

    const [inLobby, setInLobby] = useState();

    const [roomID, setRoomID] = useState();

    const [isRoomCreated, setIsRoomCreated] = useState(false);

    const [chatExpanded, setChatExpanded] = useState(false);

    useEffect(() => {

        socket.on("getRoomInfo", (link, roomList, roomID) => {

            setSessionUrl(link);

            setInLobby(roomList);

            setRoomID(roomID);

        });

        socket.on("joinedLobby", (players) => {

			setInLobby(players);

        });

		socket.on("leftRoom", (user) => {

			console.log(`${user} has left the lobby`);

            const playersRemaining = inLobby.filter((player) => { return player !== user });

            setInLobby(playersRemaining);

		});

        return () => {

            socket.removeAllListeners("getRoomInfo");
            socket.removeAllListeners("joinedLobby");
			socket.removeAllListeners("leftRoom");

        }

    }, [socket, inLobby]);

    const previousSlide = () => {
        
        setCurrentSlide(currentSlide - 1);

    }

    const nextSlide = () => {
        
        setCurrentSlide(currentSlide + 1);

    }

    const slides = [{

        content:

            <CreateGameForm setGameInfo={setGameInfo} nextSlide={nextSlide} roomCreated={[isRoomCreated, setIsRoomCreated]} />

    }, {

        content:

            <>

                {gameInfo && (
                        
                    <Lobby gameInfo={gameInfo} sessionUrl={sessionUrl} inLobby={inLobby} previousSlide={previousSlide} setChatExpanded={setChatExpanded} />

                )}

            </>

    }];

	return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className={tailwindStyles} variant={variant}>{triggerName}</Button>
            </DialogTrigger>

            <DialogContent className={`flex flex-none flex-col h-[80vh] p-10 overflow-hidden gap-8 transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60vw]" : "w-[35vw]"}`}>

                <DialogHeader>
                    <DialogTitle>Create A Room</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-row h-[90%] gap-6">

                    <div className={`flex h-full transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60%]" : "w-full"}`}>

                        {/* carousel */}

                        <div className="flex h-full w-full items-center">

                            <div className="overflow-hidden relative h-full w-full">

                                <div className="flex transition-transform ease-in-out duration-700 h-full" style={{ transform: `translateX(calc(-${currentSlide * 100}% - ${currentSlide * spaceBetweenSlides}rem))`}}>

                                    {slides.map((slide, index) => {

                                        return (

                                            <Card key={index} className="flex-none flex-col w-full h-full bg-slate-200 border-slate-400 overflow-auto" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                                <div className="h-full">
                                                    <CardContent className="px-8 pb-10 pt-6 h-full">
                                                        {slide.content}
                                                    </CardContent>
                                                </div>
                                            </Card>

                                        )

                                    })}

                                </div>

                            </div>
                            
                        </div>

                        {/* carousel */}

                    </div>

                    <Chat chatExpanded={chatExpanded} gameInfo={gameInfo} inLobby={inLobby} roomID={roomID} />

                </div>

            </DialogContent>
            
        </Dialog>
		

	);
}

export default DialogPlay;