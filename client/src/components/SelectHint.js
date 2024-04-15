import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Check, Trash2, X } from "lucide-react";

const SelectHint = ({ resultsState }) => {

    const [results, setResults] = resultsState;
    
    const [voted, setVoted] = useState(false);

    const changeToRed = (playerName) => {

        setResults(

            results.map((result) => {

                return result.playerName === playerName ? {...result, toRemove: !result.toRemove} : result;

            })
        );

    }

	const handleRemove = () => {

        if (voted) {

            return;

        }

        console.log(results);

        setResults(

            results.map((result, index) => {

                return !result.toRemove ? result : index === 0 ? {...result, beenRemoved: true, visible: false} : {...result, beenRemoved: true}

            })

        );

        setVoted(true);

    }

    const handleCancel = () => {

        if (!voted) {

            return;

        }

        console.log(results);

        setResults(

            results.map((result, index) => {

                return index === 0 ? {...result, toRemove: false, beenRemoved: false, visible: true} : {...result, toRemove: false, beenRemoved: false};

            })

        );

        setVoted(false);

    }

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className="w-full py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                <div className="flex flex-col w-full items-center">

                    <Label className="mb-12 text-lg leading-none">Select the hints that are too similar or illegal:</Label>

                    <div className="flex flex-row flex-wrap justify-center gap-4">

                        {results.map((result, index) => {

                            return (

                                <div key={index} className="flex flex-col min-w-36 items-center gap-2">
                                    <Label className="text-sm">{result.playerName}</Label>
                                    <Button 
                                        onClick={voted ? () => {} : () => changeToRed(result.playerName)} 
                                        variant={!result.toRemove ? "grey" : voted ? "red" : "amber"} 
                                        className={`flex p-2 w-full max-w-sm justify-center ${result.beenRemoved ? "line-through" : ""}`} 
                                        disabled={voted ? true : false}
                                    >
                                        {result.hint}
                                    </Button>
                                </div>

                            );

                        })}

                    </div>

                </div>

                <div className="flex flex-row justify-center gap-4 mt-16">
                    <Button onClick={handleRemove} variant={voted ? "green" : "red"} className="flex flex-row w-44">

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
                    <Button onClick={handleCancel} variant="default" className="flex flex-row w-44">
                        <X size={16} className="mr-2" />
                        Cancel Selection
                    </Button>
                </div>

            </div>

        </div>

    );

}

export default SelectHint;