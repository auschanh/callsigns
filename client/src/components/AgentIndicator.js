import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

function AgentIndicator() {

    return (

        <TooltipProvider>

            <Tooltip delayDuration={0}>

                <TooltipTrigger asChild>

                    <div className="group absolute top-4 left-4 hover:bg-slate-800 rounded-xl transition-all duration-300">

                        <AgentIcon className="fill-slate-950 aspect-square w-12 group-hover:fill-slate-300 transition-all duration-300" />

                    </div>

                </TooltipTrigger>

                <TooltipContent className="absolute left-8 w-52">

                    <div>

                        <p className="text-center">You're the Stranded Agent!</p>

                    </div>

                </TooltipContent>

            </Tooltip>

        </TooltipProvider>

        


    )
};

export default AgentIndicator;