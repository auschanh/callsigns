import { React, useState } from "react";
import { Button } from "../components/ui/button";

const Game = function (props) {
  const [word, setWord] = useState("");
  const words = [
    "Coffee",
    "Americano",
    "Latte",
    "Flat White",
    "Espresso",
    "Mocha",
  ];
  const generateWord = () => {
    const generatedWord = words[Math.floor(Math.random() * words.length)];
    setWord(generatedWord);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div>
        <h1 className="font-bold text-2xl text-center">Game</h1>
      </div>
      <div className="w-40 text-center">
        <Button
          className="border-2 border-blue-600 text-white"
          onClick={generateWord}
        >
          Generate a Word
        </Button>
      </div>
      {word && <div className="mt-4">Generated Word: {word}</div>}
    </div>
  );
};

export default Game;
