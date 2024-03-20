import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "../components/ui/badge";
// import { Label } from "../components/ui/label";

const Lobby = function ({ gameInfo }) {
  
  const [totaPlayers, setTotalPlayers] = useState(0);

  return (
    <div className="flex flex-col bg-slate-200 border-slate-400 p-4 rounded-md">
      <div className="flex-[0_0_auto]">
        <div className="justify-center text-center">
          <div className="flex flex-col w-full items-center space-x-2 mb-8">
            <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
              <p className="flex text-xl text-center">{gameInfo.roomName}</p>
            </div>
          </div>
        </div>
        <div className="block">
          <p>
            <span className="font-bold">Username: </span> {gameInfo.username}
          </p>
          <p>
            <span className="font-bold">Room Name: </span> {gameInfo.roomName}
          </p>
          <p>
            {" "}
            <span className="font-bold">Number of Players: </span>
            {gameInfo.numPlayers}
          </p>
          <p>
            {" "}
            <span className="font-bold">AI Players: </span> {gameInfo.aiPlayers}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-x-1">
        <div>
          <Badge>Batman</Badge>
        </div>
        <div>
          <Badge>Spiderman</Badge>
        </div>
        <div>
          <Badge>The Joker</Badge>
        </div>
        <div>
          <Badge>Green Goblin</Badge>
        </div>
      </div>

      <div className="border border-black mt-2 max-h-full flex-1 h-auto max-w-screen"></div>

      <Link to="Game">
        <Button className="mt-4">Start Game</Button>
      </Link>
    </div>
  );
};

export default Lobby;
