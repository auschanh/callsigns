import React, { useState, useEffect } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "../components/ui/button";
import Chat from "./Chat";
import CreateGameForm from "./CreateGameForm";
import Lobby from "./Lobby";
import { useSocketContext } from "../contexts/SocketContext";
import { useMessageContext } from "../contexts/MessageContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";

function DialogPlay({ tailwindStyles, triggerName, isOpen, propSlide = 0, isNewHost = false, prevClosedRoom }) {

    const [socket, setSocket] = useSocketContext();

    const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

    const [inLobby, setInLobby] = useLobbyContext();

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();

    const [currentSlide, setCurrentSlide] = useState(propSlide);

    const spaceBetweenSlides = 5;

	const [gameInfo, setGameInfo] = useState();

    const [open, setOpen] = isOpen;

    const [sessionUrl, setSessionUrl] = useState();

    const [roomID, setRoomID] = useState();

    const [isRoomCreated, setIsRoomCreated] = useState(isNewHost);

    const [prevAiPlayers, setPrevAiPlayers] = useState();

    useEffect(() => {

        socket.on("getRoomInfo", (link, roomList, roomID) => {

            setSessionUrl(link);

            setInLobby(roomList);

            setRoomID(roomID);

        });

        socket.on("updateRoomInfo", (link, roomList, roomID, roomDetails) => {

            setInLobby(roomList);

            setGameInfo({

                username: roomDetails.host,
                roomName: roomDetails.roomName,
                numPlayers: roomDetails.numPlayers,
                aiPlayers: roomDetails.aiPlayers,
                numGuesses: roomDetails.numGuesses,
                numRounds: roomDetails.numRounds,
                timeLimit: roomDetails.timeLimit,
                keepScore: roomDetails.keepScore,

            });

            setIsGameStarted(roomDetails.isGameStarted);

            setPrevAiPlayers(roomDetails.prevAiPlayers);

            if (isNewHost) {

                setSessionUrl(link);

                setRoomID(roomID);

            }

        });

        socket.on("guesserSelected", (guesser) => {

            console.log(`The guesser is ${guesser}`);

            setGuesser(guesser);

        });

        return () => {

            socket.removeAllListeners("getRoomInfo");
            socket.removeAllListeners("updateRoomInfo");
            socket.removeAllListeners("guesserSelected");

        }

    }, [socket, isNewHost]);

    useEffect(() => {

		if (inGame?.length === 0) {

			setInGame();

            setGuesser();

            (async () => {

                try {

                    await socket.emit("gameEnded");

                } catch (error) {

                    throw error;

                }

            })();

		}

	}, [inGame]);

    const previousSlide = () => {
        
        setCurrentSlide(currentSlide - 1);

    }

    const nextSlide = () => {
        
        setCurrentSlide(currentSlide + 1);

    }

    const slides = [{

        content:

            <CreateGameForm gameInfoState={[gameInfo, setGameInfo]} nextSlide={nextSlide} roomCreated={[isRoomCreated, setIsRoomCreated]} />

    }, {

        content:

            <>

                {gameInfo && (
                        
                    <Lobby gameInfo={gameInfo} sessionUrl={sessionUrl} previousSlide={previousSlide} prevClosedRoom={prevClosedRoom} prevAiPlayers={prevAiPlayers} />

                )}

            </>

    }];

	return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className={tailwindStyles}>{triggerName}</Button>
            </DialogTrigger>

            <DialogContent className={`flex flex-none flex-col h-[90vh] top-[5%] p-10 overflow-hidden gap-8 transition-all ease-in-out duration-500 ${chatExpanded ? "w-[60vw] left-[20%]" : "w-[35vw] left-[32.5%]"}`} hideClose={isNewHost}>

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
                                                    <CardContent className="px-8 pb-0 pt-6 h-full">
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

                    <Chat username={gameInfo?.username} roomName={gameInfo?.roomName} roomID={roomID} />

                </div>

            </DialogContent>
            
        </Dialog>
		

	);
}

export default DialogPlay;