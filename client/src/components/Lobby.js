import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Lobby = function ({ gameInfo }) {
  return (
    <div className="w-full h-full">
      <span className="font-bold">Room Created:</span> Generated Room Name
      {Object.keys(gameInfo).map((value) => {
        return (
          <div>
            <div className="flex">
              {value}: {gameInfo[value]}{" "}
            </div>
          </div>
        );
      })}
      <div className="border-2 mt-8 h-auto object-fill w-auto">
        {gameInfo["username"]} has joined the chat.
      </div>
      <Link to="Game">
        <Button variant={"green"}>Start Game</Button>
      </Link>
    </div>
  );
};

export default Lobby;
