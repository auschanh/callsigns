import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogPlay from '../components/DialogPlay';
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";

function NewHost() {

    const [socket, setSocket] = useSocketContext();

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]] = useGameInfoContext();

    const [playOpen, setPlayOpen] = useState(false);

    const [alertOpen, setAlertOpen] = useState(true);

    const [roomDetails, setRoomDetails] = useState();

    let { roomID } = useParams();

    const navigate = useNavigate();

    useEffect(() => {

        if (roomDetails === undefined) {

            

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

            if (inRoom) {

                if (othersInLobby) {

                    
    
                    const prevGameInfo = {

                        username: roomDetails.host,
                        roomName: roomDetails.roomName,
                        numPlayers: roomDetails.numPlayers,
                        aiPlayers: roomDetails.aiPlayers,
                        numGuesses: roomDetails.numGuesses,
                        numRounds: roomDetails.numRounds,
                        timeLimit: roomDetails.timeLimit,
                        keepScore: roomDetails.keepScore,
    
                    }
    
                    setRoomDetails(roomDetails);
                    
                    if (!roomDetails.newHostAssigned) {

                        

                        setAlertOpen(false);

                        setPlayOpen(true);

                    } else {

                        try {
        
                            socket.emit("newHostNotified", roomID);
            
                        } catch (error) {
            
                            throw error;
            
                        }

                    }
    
                    try {
        
                        socket.emit("gameInfo", prevGameInfo, true, playerName !== undefined);
        
                    } catch (error) {
        
                        throw error;
        
                    }
    
                } else {
    
                    

                    setRoomDetails(false);
    
                }

            } else {

                

                setRoomDetails(false);

            }

        });

        return () => {

            socket.removeAllListeners("roomExists");

        }

    }, [socket, roomDetails, roomID, playerName]);

    return (

        <>

            <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%">

                {roomDetails && (

                    <DialogPlay tailwindStyles={"invisible"} isOpen={[playOpen]} propSlide={1} isNewHost={true} prevClosedRoom={roomDetails.isClosedRoom} />

                )}

            </div>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent className="gap-12 w-[30vw]">

                    <AlertDialogHeader className="space-y-2">
                        <AlertDialogTitle>Welcome to Callsigns!</AlertDialogTitle>
                    </AlertDialogHeader>

                    {roomDetails && (

                        <>

                            <div className="flex flex-col flex-none items-center text-slate-700">
                                <p>You have been promoted to host.</p>
                            </div>
                            <Button className="mt-auto w-24 justify-self-center" onClick={() => {setAlertOpen(false); setPlayOpen(true);}}>OK</Button>

                        </>
                        
                    ) || (

                        <>
                            <div className="flex flex-col flex-none items-center text-slate-700">
                                <p>This link is not valid.</p>
                                <p>Please contact the host or start a new game.</p>
                            </div>
                            <Button className="mt-auto w-fit justify-self-center" onClick={() => navigate("/")}>Return to the Home Page</Button>
                        </>

                    )}

                </AlertDialogContent>
            </AlertDialog>

        </> 

    );

}

export default NewHost;