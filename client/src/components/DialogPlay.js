import React, { useState, useEffect } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "../components/ui/button";
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

    useEffect(() => {

        socket.on("getRoomInfo", (link, roomList) => {

            setSessionUrl(link);

            setInLobby(roomList);

        });

        return () => {

            socket.removeAllListeners("getLink");

        }

    }, [socket]);

    const previousSlide = () => {
        
        setCurrentSlide(currentSlide - 1);

    }

    const nextSlide = () => {
        
        setCurrentSlide(currentSlide + 1);

    }

    const slides = [{

        content:

            <CreateGameForm setGameInfo={setGameInfo} nextSlide={nextSlide} />

    }, {

        content:

            <>

                {gameInfo && (
                        
                    <Lobby gameInfo={gameInfo} sessionUrl={sessionUrl} inLobby={inLobby} />

                )}

            </>

    }];

	return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className={tailwindStyles} variant={variant}>{triggerName}</Button>
            </DialogTrigger>

            <DialogContent className="flex flex-none flex-col h-[80vh] w-[30vw] p-10 pb-16 overflow-auto gap-8">

                <DialogHeader>
                    <DialogTitle>Create A Room</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="max-w-full h-full">

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

            </DialogContent>
            
        </Dialog>
		

	);
}

export default DialogPlay;