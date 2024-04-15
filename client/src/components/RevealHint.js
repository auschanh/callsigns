import React from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X } from "lucide-react";

const RevealHint = ({ resultsState }) => {

    const [results, setResults] = resultsState;

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className="flex flex-col items-center w-full py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                <Label className="mb-12 text-lg leading-none">Your hints have been revealed!</Label>

                <div className="flex flex-row flex-wrap justify-center gap-4">

                    <TooltipProvider>                      

                        {results.map((result, index) => {

                            return (

                                <div key={index} className="flex flex-col min-w-36 items-center gap-2">
                                    <Label className="text-sm">{result.playerName}</Label>

                                    {result.visible && (
                                    
                                        <Button 
                                            variant="green" 
                                            className="flex p-2 w-full max-w-sm justify-center" 
                                        >
                                            {result.hint}

                                        </Button>
                                    
                                    
                                    ) || (

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button className="flex p-2 w-full max-w-sm justify-center" variant="red">
                                                    <X size={16} />                                                        
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{result.hint}</p>
                                            </TooltipContent>
                                        </Tooltip>

                                    )}

                                </div>

                            );

                        })}

                    </TooltipProvider>

                </div>

                <h1 className="text-lg text-center font-medium leading-none mt-16">Now it's up to the stranded agent to figure out their callsign...</h1>

            </div>

        </div>

    );

}

export default RevealHint;