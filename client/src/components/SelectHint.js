import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from "./ui/progress";
import Timer from './Timer';
import AgentIndicator from './AgentIndicator';
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Check, Ellipsis, Trash2, X, RotateCcw, ChevronRight } from "lucide-react";


const SelectHint = ({ resultsState, votedState, submissions, roomDetails, isVoted, currentIndex, setTimeLimitReached, setStartFade, scoresState, hintArrayState }) => {

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]] = useGameInfoContext();

    const [results, setResults] = resultsState; // voting array of objects hints, for hints to eliminate

    const [socket, setSocket] = useSocketContext();
    
    const [voted, setVoted] = votedState;

    const [isVoteSubmitted, setIsVoteSubmitted] = useState(false);

    const [isNoneSelected, setIsNoneSelected] = useState(true);

    const [scores, setScores] = scoresState;

    const [hintArray, setHintArray] = hintArrayState;

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

    // keep track of which hints appear exacly ONCE
    // use hintCount as a conditional to render the appropriate hints
    // any hintCount > 1 does not get rendered
    const hintCount = {}
    results.forEach(player => {
        if(player.hint){
            hintCount[player.hint] = (hintCount[player.hint] || 0) + 1;
            // if(hintCount[player.hint] > 1) {
            //     player.beenRemoved = true;
            // }   
            // player.toRemove = true;
        }
    });

    results.forEach(player => {
        if(hintCount[player.hint] > 1) {
            player.beenRemoved = true;
        }
    })
        

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className="w-full relative py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                {playerName === guesser && (

                    <AgentIndicator />

                )}
                
                {roomDetails.timeLimit !== 0 && currentIndex === 1 && (

                    <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={1} />

                )}

                <div className="flex flex-col w-full items-center">

                    {/* if player is the guesser load progress component  */}

                    {playerName === guesser && (

                        <>
                            <p className="mb-6 text-center">{isVoted.filter(player => player.voted).length} {isVoted.filter(player => player.voted).length === 1 ? "Agent has" : "Agents have"} submitted a vote.</p>

                            <Progress
                                value={(isVoted.filter(player => player.voted && playerName === guesser)).length / (isVoted.length - 1) * 100}
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

                                {/* {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

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

                                })} */}

                            </div>

                        </>
                        
                    ) || ( 
                        
                        /* load voting screen if not the guesser */
                    
                        <>

                            <Label className="mb-12 text-lg leading-none text-center">Select the hints that are too similar or illegal:</Label>

                            <div className="flex flex-row flex-wrap justify-center gap-10">
                            
                                {results.some((result) => { return result.hint !== "" }) && (

                                    results.map((result, index) => {
                                        
                                        // renders good hints

                                        if (result.playerName !== guesser && result.hint !== "" && hintCount[result.hint] == 1) { // exclude guesser and blank hints
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

                                    })

                                ) || (

                                    <h1 className="mt-6 text-lg text-center font-mono text-red-600">
                                        ERROR: No valid hints were transmitted in time!
                                    </h1>

                                )}

                            </div>

                            <div className="mt-12">

                                <h3 className="text-sm">Hints with <span className="font-bold">{Math.ceil((isVoted.length - 1) / 2)}</span> or more votes will be eliminated</h3>

                            </div>

                            <div className="flex flex-row justify-center gap-4 mt-6">

                                {results.some((result) => { return result.hint !== "" }) && (

                                    <>

                                        <Button onClick={handleRemove} variant={voted ? "green" : isNoneSelected ? "disabledRed" : "red"} className={`flex flex-row w-44 transition-all ease-in-out duration-150 ${ isNoneSelected ? "cursor-not-allowed" : ""}`}>

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

                                    </>

                                ) || (

                                    <Button 
                                        onClick={() => { setVoted(true); setIsVoteSubmitted(true); }} 
                                        variant={ voted ? "disabled" : "green" } 
                                        className={`flex flex-row w-44 transition-all ease-in-out duration-150`}
                                        disabled={voted}
                                    >

                                        <div className="flex flex-row flex-none justify-center w-full">
                                            
                                            <h1 className="ml-4">Continue</h1>

                                            <div>
                                                <ChevronRight size={20} className="ml-2" />
                                            </div>
                                            
                                        </div>

                                    </Button>

                                )}

                            </div>
                    
                        </>

                    )}

                </div>

            </div>

        </div>
    );

}

export default SelectHint;