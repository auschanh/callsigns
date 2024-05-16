import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from "./ui/progress";
import Timer from './Timer';
import { useSocketContext } from "../contexts/SocketContext";
import { Check, Ellipsis, Trash2, X, RotateCcw } from "lucide-react";

const SelectHint = ({ resultsState, submissions, roomDetails, playerName, isVoted, currentIndex, setTimeLimitReached, setStartFade }) => {

    const [results, setResults] = resultsState; // voting array of objects hints, for hints to eliminate

    const [socket, setSocket] = useSocketContext();
    
    const [voted, setVoted] = useState(false);

    const [isVoteSubmitted, setIsVoteSubmitted] = useState(false);

    const [isNoneSelected, setIsNoneSelected] = useState(true);

    useEffect(() => {

        if (isVoteSubmitted) {

            (async () => {

                try {
    
                    await socket.emit("submitVote", roomDetails.roomID, playerName, results, voted);

                    console.log("vote submitted");

                    setIsVoteSubmitted(false);
        
                } catch (error) {
        
                    throw error;
        
                }
    
            })();

        }

    }, [socket, results, roomDetails, playerName, isVoteSubmitted, voted]);

    useEffect(() => {

        if (results.every(({ toRemove }) => { return toRemove === false })) {

            setIsNoneSelected(true);

        } else {

            setIsNoneSelected(false);

        }

    }, [results]);

    const selectToRemove = (playerName) => {

        setResults(

            results.map((result) => {

                return result.playerName === playerName ? {...result, toRemove: !result.toRemove} : result;

            })

        );

    }

	const handleRemove = () => {

        if (voted || isNoneSelected) {

            return;

        }

        console.log(results);

        setResults(

            results.map((result) => {

                return !result.toRemove ? result : {...result, beenRemoved: true, count: result.count + 1};

            })

        );

        setVoted(true);

        setIsVoteSubmitted(true);

    }

    const handleCancel = () => {

        if (!voted) {

            return;

        }

        console.log(results);

        setResults(

            results.map((result) => {

                return !result.toRemove ? result : {...result, toRemove: false, beenRemoved: false, count: result.count - 1};

            })

        );

        setVoted(false);

        setIsVoteSubmitted(true);

        setIsNoneSelected(true);

    }

    const handleClearSelection = () => {

        setResults(

            results.map((result) => {

                return {...result, toRemove: false, beenRemoved: false};

            })

        );

        setIsNoneSelected(true);

    }

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className="w-full relative py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                {roomDetails.timeLimit !== 0 && currentIndex === 1 && (

                    <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={1} />

                )}

                <div className="flex flex-col w-full items-center">

                    {/* if player is the guesser load progress component  */}

                    {playerName === roomDetails.guesser && (

                        <>
                            <p className="mb-6">{isVoted.filter(player => player.voted).length} {isVoted.filter(player => player.voted).length === 1 ? "Agent has" : "Agents have"} submitted a vote.</p>

                            <Progress
                                value={(isVoted.filter(player => player.voted && playerName === roomDetails.guesser)).length / (results.length-1) * 100}
                                max={100}
                            /> 

                            {/* render badges for player vote status */}
                            <div className="flex flex-row flex-none flex-wrap mt-6 justify-center w-full px-24 gap-4">

                                {isVoted?.map((player, index) => {
                                    
                                    if (player.playerName !== playerName) {

                                        return (

                                            <Button
                                                key={index}
                                                className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                                variant={`${player.voted !== false ? "green" : "grey"}`}
                                            >

                                                <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                    {player.voted !== false && (
                                                        <Check className="text-slate-900" size={14} />
                                                    ) || (
                                                        <Ellipsis className="text-slate-900" size={14} />
                                                    )}
                                                </div>

                                                <p className="text-xs">{player.playerName}</p>

                                            </Button>
                                        );
                                    }

                                })}

                                {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

                                    return (

                                        <Button
                                            key={index}
                                            className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                            variant="green"
                                        >

                                            <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                <Check className="text-slate-900" size={14} />
                                            </div>

                                            <p className="text-xs">Bot {index + 1}</p>

                                        </Button>

                                    );

                                })}

                            </div>

                        </>
                        
                    ) || ( 
                        
                        /* load voting screen if not the guesser */
                    
                        <>

                            <Label className="mb-12 text-lg leading-none">Select the hints that are too similar or illegal:</Label>

                            <div className="flex flex-row flex-wrap justify-center gap-10">

                                {results.map((result, index) => {

                                    if (result.playerName !== roomDetails.guesser) {

                                        return (

                                            <div key={index} className="flex flex-col min-w-36 items-center gap-2">
                                                <Label className="text-sm">{result.playerName}</Label>
                                                <div className="w-full relative">
    
                                                    <div className={`absolute -top-2 -right-2 flex flex-none justify-center items-center aspect-square h-5 rounded-full bg-red-600 z-10 ${result.count ? "" : "invisible"}`}>
                                                        <h3 className="text-xs text-slate-50 font-normal">{result.count}</h3>
                                                    </div>
    
                                                    <Button 
                                                        onClick={voted ? () => {} : () => selectToRemove(result.playerName)} 
                                                        variant={!result.toRemove ? "grey" : voted ? "red" : "amber"} 
                                                        className={`flex p-2 w-full max-w-sm justify-center transition-all ease-in-out duration-150 ${result.beenRemoved ? "line-through" : ""}`} 
                                                        disabled={voted}
                                                    >
                                                        {result.hint}
                                                    </Button>
                                                </div>
                                            </div>
    
                                        );

                                    }

                                })}

                            </div>

                            <div className="flex flex-row justify-center gap-4 mt-16">

                                <Button onClick={handleRemove} variant={voted ? "green" : "red"} className="flex flex-row w-44 transition-all ease-in-out duration-150">

                                    {voted && (

                                        <>
                                            <Check size={16} className="mr-2" />
                                            Vote Recorded
                                        </>

                                    ) || (

                                        <>
                                            <Trash2 size={16} className="mr-2" />
                                            Vote to Remove
                                        </>

                                    )}

                                </Button>

                                <Button onClick={(isNoneSelected && !voted) ? () => {setVoted(true); setIsVoteSubmitted(true);} : voted ? handleCancel : handleClearSelection} variant={(isNoneSelected && !voted) ? "green" : voted ? "default" : "blue"} className="flex flex-row w-44 transition-all ease-in-out duration-150">

                                    {(isNoneSelected && !voted) && (

                                        <>
                                            <Check size={16} className="mr-2" />
                                            Looks Good!
                                        </>

                                    ) || voted && (

                                        <>
                                            <X size={16} className="mr-2" />
                                            Cancel Selection
                                        </>

                                    ) || (

                                        <>
                                            <RotateCcw size={16} className="mr-2" />
                                            Clear Selection
                                        </>

                                    )}

                                </Button>

                            </div>
                    
                        </>

                    )}

                </div>

            </div>

        </div>
    );

}

export default SelectHint;