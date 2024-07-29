import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";

function AgentIndicator() {

    return (

        <div className="group absolute top-4 left-4 hover:bg-slate-800 rounded-xl transition-all duration-300 cursor-pointer">

            <AgentIcon className="fill-slate-950 aspect-square w-12 group-hover:fill-slate-300 transition-all duration-300" />

        </div>


    )
};

export default AgentIndicator;