import { React, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import WordGenerator from "../components/WordGenerator";
import Timeline from "../components/Timeline";

const Game = function (props) {
  return (
    <div>
      <Timeline />
      <WordGenerator />
    </div>
  );
};

export default Game;
