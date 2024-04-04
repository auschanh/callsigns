import { React, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import WordGenerator from "../components/WordGenerator";
import Timeline from "../components/Timeline";
import { useGameInfoContext } from "../contexts/GameInfoContext";

const Game = function (props) {
  const [playerName, selectedPlayers, roomID] = useGameInfoContext();

  return (
    <div>
      <Timeline />
      <div>
        Room ID: {roomID}
        <br />
        Hello, {playerName}
        <br />
        These are the current players:{" "}
        {/* {selectedPlayers?.map((player) => {
          <div>{player}</div>;
        })} */}
        {selectedPlayers}
      </div>
      <WordGenerator />
    </div>
  );
};

export default Game;
